using System.Collections.Concurrent;
using System;
using BookLabRepositories;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using BookLabDTO;
using System.Drawing;
using BookLabModel.Model;
using System.Globalization;

namespace BookLabServices
{
    public class BookingService(IBookingRepository _bookingRepository,
    IAwsS3Service _awsS3Service,
    IRoomRepository _roomRepository,
    IAccountRepository _accountRepository,
    ISubBookingRepository _subBookingRepository,
    IClassRepository _classRepository
    ) : IBookingService
    {
        public MemoryStream ExportStudentsToExcel (List<StudentDto> students)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Students");

            // Thêm tiêu đề
            worksheet.Cells[1, 1].Value = "Student ID";
            worksheet.Cells[1, 2].Value = "Student Name";
            worksheet.Cells[1, 3].Value = "Telephone";
            worksheet.Cells[1, 4].Value = "Date of Birth";

            // Định dạng tiêu đề
            using (var range = worksheet.Cells[1, 1, 1, 4])
            {
                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.Yellow);
                range.Style.Font.Bold = true;
                range.Style.Font.Color.SetColor(Color.Black);
                range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }

            int row = 2;
            foreach (var student in students)
            {
                worksheet.Cells[row, 1].Value = student.StudentId;
                worksheet.Cells[row, 2].Value = student.FullName;
                worksheet.Cells[row, 3].Value = student.Telphone;

                var dobCell = worksheet.Cells[row, 4];
                if (student.DOB != null)
                {
                    dobCell.Value = student.DOB?.Date;
                    dobCell.Style.Numberformat.Format = "dd/MM/yyyy";
                    dobCell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }
                else
                {
                    dobCell.Value = "N/A";  // Hiển thị N/A nếu không có ngày sinh
                }

                // Đảm bảo tên sinh viên không bị cắt
                worksheet.Column(2).Width = Math.Max(worksheet.Column(2).Width, 30);

                row++;
            }

            // Đảm bảo tất cả các cột có kích thước phù hợp
            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            // Đặt độ rộng tối thiểu cho từng cột nếu cần
            for (int col = 1; col <= 4; col++)
            {
                worksheet.Column(col).Width = Math.Max(worksheet.Column(col).Width, 15);
            }

            // Trả về MemoryStream chứa dữ liệu Excel
            return new MemoryStream(package.GetAsByteArray());
        }
        public async Task<IEnumerable<ExcelScheduleRecord>> BookingClassByImportExcel(string filePath, Guid userId)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            // Collections để lưu trữ các entities cho việc chèn hàng loạt
            var bookingsToInsert = new List<Booking>();
            var subBookingsToInsert = new List<SubBooking>();
            var classesToInsert = new List<Class>();
            var scheduleRecords = new List<ExcelScheduleRecord>();

            // Dictionary theo dõi các entities đã xử lý
            var processedClasses = new Dictionary<string, Guid>();
            var processedBookings = new Dictionary<string, Booking>();
            var processedSubBookings = new Dictionary<string, SubBooking>();

            // Collection để theo dõi tất cả các record (để ghi đè và báo cáo)
            var allScheduleRecords = new Dictionary<string, ExcelScheduleRecord>();

            // Theo dõi lịch đặt phòng để phát hiện xung đột
            var roomTimeSlots = new Dictionary<string, List<(TimeOnly Start, TimeOnly End, int TypeSlot, string BookingInfo)>>();

            using var package = new ExcelPackage(new FileInfo(filePath));
            var worksheet = package.Workbook.Worksheets[0];
            int rowCount = worksheet.Dimension.Rows;

            // Danh sách các hàng cần xử lý (bắt đầu từ hàng 2)
            var rows = Enumerable.Range(2, rowCount - 1).ToList();

            // Xử lý tuần tự các hàng
            foreach (var row in rows)
            {
                // Khởi tạo record với các thuộc tính an toàn
                var item = new ExcelScheduleRecord
                {
                    RowNumber = row,
                    GroupName = worksheet.Cells[row, 1].Text,
                    SubjectCode = worksheet.Cells[row, 2].Text,
                    RoomNo = worksheet.Cells[row, 5].Text,
                    SessionNo = int.TryParse(worksheet.Cells[row, 6].Text, out int sessionNo) ? sessionNo : 0,
                    Lecturer = worksheet.Cells[row, 7].Text,
                    SlotTypeCode = worksheet.Cells[row, 8].Text,
                    StatusSlot = worksheet.Cells[row, 9].Text,
                    SlotType = worksheet.Cells[row, 10].Text
                };

                try
                {
                    var sdate = worksheet.Cells[row, 3].Value;
                    // Parse các giá trị có thể gây ra ngoại lệ
                    item.Date = sdate is double numericValue
                        ? DateTime.FromOADate(numericValue) // Nếu là số, chuyển từ OADate
                        : DateTime.ParseExact(worksheet.Cells[row, 3].Text, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    item.Slot = int.Parse(worksheet.Cells[row, 4].Text);

                    // Validation logic
                    var roomId = await _roomRepository.GetRoomIdByRoomNo(item.RoomNo);
                    if (roomId == Guid.Empty)
                    {
                        throw new Exception($"Room not found: {item.RoomNo}");
                    }

                    var accountId = await _accountRepository.GetAccountIdByAccountName(item.Lecturer);
                    if (accountId == Guid.Empty)
                    {
                        throw new Exception($"Lecturer not found: {item.Lecturer}");
                    }

                    var descriptionId = Guid.Parse("9f3eefb8-b8f3-4b0d-93c2-31ff152d5d4e");

                    DateTime date = item.Date > DateTime.Now
                        ? item.Date
                        : throw new Exception("Date must be greater than today");

                    var typeSlot = item.SlotType switch
                    {
                        "OLD SLOT" => 1,
                        "NEW SLOT" => 2,
                        "OUT SLOT" => 3,
                        _ => 0
                    };

                    if (typeSlot == 0)
                    {
                        throw new Exception($"Slot type not found: {item.SlotType}");
                    }

                    var (startTime, endTime) = GetTimeFromSlot(item.Slot, typeSlot);
                    item.StartTime = startTime;
                    item.EndTime = endTime;

                    // Kiểm tra khả dụng của giảng viên
                    var bookingExist = await _bookingRepository.GetBookingSuccessful(accountId);
                    var lecturerFree = await _subBookingRepository.LecturerFree(bookingExist, startTime, endTime, date);
                    if (!lecturerFree)
                    {
                        throw new Exception($"Lecturer {item.Lecturer} is not free at this time slot");
                    }

                    if (startTime < TimeOnly.FromDateTime(DateTime.Now.AddMinutes(-30)) && date == DateTime.Now.Date)
                    {
                        throw new Exception("Time must be greater than current at least 30 minutes");
                    }

                    // Xử lý tạo/lấy Class
                    string classKey = $"{item.SubjectCode}_{item.GroupName}";
                    Guid classId;

                    if (!processedClasses.TryGetValue(classKey, out classId))
                    {
                        var existingClassId = await _classRepository.GetClassBySubjectCodeAndName(item.SubjectCode, item.GroupName);

                        if (existingClassId == null)
                        {
                            classId = Guid.NewGuid();
                            classesToInsert.Add(new Class
                            {
                                Id = classId,
                                SubjectCode = item.SubjectCode,
                                Name = item.GroupName,
                                CreatedAt = DateTime.Now,
                                CreatedBy = userId
                            });
                        }
                        else
                        {
                            classId = existingClassId.Value;
                        }

                        processedClasses.Add(classKey, classId);
                    }
                    if (await _bookingRepository.GetBookingByRoomId(roomId, startTime, endTime, date))
                    {
                        throw new Exception("Room is not available at this time slot");
                    }
                    // Xử lý tạo/lấy booking dựa trên room-lecturer
                    string bookingKey = $"{roomId}_{accountId}";
                    Booking booking;

                    if (!processedBookings.TryGetValue(bookingKey, out booking))
                    {
                        booking = new Booking
                        {
                            Id = Guid.NewGuid(),
                            RoomId = roomId,
                            LectureId = accountId,
                            DescriptionId = descriptionId,
                            Type = 6,
                            State = 5,
                            CreatedAt = DateTime.Now,
                            CreatedBy = userId
                        };
                        bookingsToInsert.Add(booking);
                        processedBookings.Add(bookingKey, booking);
                    }

                    // Tạo SubBooking
                    var subBooking = new SubBooking
                    {
                        Id = Guid.NewGuid(),
                        BookingId = booking.Id,
                        ClassId = classId,
                        Approve = 10,
                        Private = false,
                        TypeSlot = typeSlot,
                        Reason = "Study",
                        StartTime = startTime,
                        EndTime = endTime,
                        Date = date,
                        CreatedAt = DateTime.Now,
                        CreatedBy = userId
                    };

                    // Kiểm tra trùng lặp SubBooking
                    string subBookingKey = $"{booking.Id}_{classId}_{date:yyyyMMdd}_{startTime}_{endTime}_{typeSlot}";

                    if (processedSubBookings.ContainsKey(subBookingKey))
                    {
                        throw new Exception("Duplicate booking detected");
                    }
                    processedSubBookings.Add(subBookingKey, subBooking);

                    // Đăng ký record để theo dõi
                    string recordKey = $"{roomId}_{date:yyyyMMdd}_{startTime}_{endTime}";
                    allScheduleRecords[recordKey] = item;

                    // Kiểm tra xung đột phòng
                    string roomDateKey = $"{roomId}_{date:yyyyMMdd}";

                    if (!roomTimeSlots.TryGetValue(roomDateKey, out var timeSlotList))
                    {
                        timeSlotList = new List<(TimeOnly, TimeOnly, int, string)>();
                        roomTimeSlots.Add(roomDateKey, timeSlotList);
                    }

                    // Kiểm tra xung đột thời gian
                    var conflictingSlots = timeSlotList
                        .Where(existingSlot =>
                            (startTime < existingSlot.End && endTime > existingSlot.Start) ||
                            (startTime == existingSlot.Start && endTime == existingSlot.End))
                        .ToList();

                    if (conflictingSlots.Any())
                    {
                        bool canOverride = typeSlot == 1; // OLD SLOT có thể ghi đè các loại khác
                        bool conflictsWithOldSlot = conflictingSlots.Any(s => s.TypeSlot == 1);

                        if (conflictsWithOldSlot && !canOverride)
                        {
                            // Slot hiện tại không phải OLD SLOT nhưng xung đột với OLD SLOT
                            throw new Exception("Cannot book this time slot because it conflicts with an another booking");
                        }
                        else if (canOverride)
                        {
                            // OLD SLOT có thể ghi đè các loại khác - tìm và loại bỏ các booking bị ghi đè
                            var overriddenBookingInfos = conflictingSlots
                                .Where(s => s.TypeSlot != 1) // Chỉ ghi đè các slot không phải OLD SLOT
                                .Select(s => s.BookingInfo)
                                .ToList();

                            if (overriddenBookingInfos.Any())
                            {
                                // Tìm các subBooking bị ghi đè để loại bỏ
                                var keysToRemove = processedSubBookings.Keys
                                    .Where(k => overriddenBookingInfos.Any(info => k.Contains(info)))
                                    .ToList();

                                foreach (var key in keysToRemove)
                                {
                                    if (processedSubBookings.TryGetValue(key, out var removedBooking))
                                    {
                                        processedSubBookings.Remove(key);

                                        // Đánh dấu tất cả các booking bị ghi đè
                                        foreach (var sb in subBookingsToInsert.Where(sb =>
                                            sb.BookingId == removedBooking.BookingId &&
                                            sb.Date == removedBooking.Date &&
                                            sb.StartTime == removedBooking.StartTime).ToList())
                                        {
                                            sb.Approve = -99;
                                        }

                                        // Cập nhật trạng thái cho tất cả các record bị ảnh hưởng
                                        foreach (var record in allScheduleRecords.Values.Where(r =>
                                            r.RoomNo == item.RoomNo &&
                                            r.Date == date &&
                                            r.StartTime == removedBooking.StartTime &&
                                            r.SlotType != "OLD SLOT").ToList())
                                        {
                                            record.IsSuccess = false;
                                            record.ErrorMessage = $"This booking was overridden by an OLD SLOT booking for {item.GroupName} ({item.SubjectCode})";
                                        }
                                    }
                                }

                                // Thêm subBooking mới sau khi đã ghi đè
                                subBookingsToInsert.Add(subBooking);

                                // Cập nhật danh sách time slots (xóa cũ, thêm mới)
                                var updatedSlots = timeSlotList
                                    .Where(s => !overriddenBookingInfos.Contains(s.BookingInfo))
                                    .ToList();

                                updatedSlots.Add((startTime, endTime, typeSlot, $"{booking.Id}_{classId}"));
                                roomTimeSlots[roomDateKey] = updatedSlots;
                            }
                            else
                            {
                                // Xung đột với các OLD SLOT khác
                                throw new Exception($"Time slot conflict with another OLD SLOT at {startTime} - {endTime}");
                            }
                        }
                        else
                        {
                            // Xung đột với slot khác (không phải OLD SLOT)
                            throw new Exception($"Time slot conflict detected at {startTime} - {endTime}");
                        }
                    }
                    else
                    {
                        // Không có xung đột, thêm vào danh sách để insert
                        subBookingsToInsert.Add(subBooking);
                        timeSlotList.Add((startTime, endTime, typeSlot, $"{booking.Id}_{classId}"));
                    }

                    // Đánh dấu thành công
                    item.IsSuccess = true;
                    item.ErrorMessage = null;
                }
                catch (Exception ex)
                {
                    // Đánh dấu thất bại với thông báo lỗi
                    item.IsSuccess = false;
                    item.ErrorMessage = ex.Message;
                }

                scheduleRecords.Add(item);
            }

            // Thực hiện bulk insert (chỉ với các subBooking không bị đánh dấu ghi đè)
            if (classesToInsert.Any())
            {
                await _classRepository.BulkInsertClasses(classesToInsert);
            }

            if (bookingsToInsert.Any())
            {
                await _bookingRepository.BulkInsertBookings(bookingsToInsert);
            }

            if (subBookingsToInsert.Any())
            {
                // Chỉ insert các subBooking không bị đánh dấu ghi đè
                var validSubBookings = subBookingsToInsert
                    .Where(sb => sb.Approve != -99)
                    .ToList();

                if (validSubBookings.Any())
                {
                    await _subBookingRepository.BulkInsertSubBookings(validSubBookings);
                }
            }

            return scheduleRecords;
        }

        public async Task<IEnumerable<ExcelScheduleRecord>> BookingClass(List<ExcelScheduleRecord> clientScheduleRecord, Guid userId)
        {
            // Collections để lưu trữ các entities cho việc chèn hàng loạt
            var bookingsToInsert = new List<Booking>();
            var subBookingsToInsert = new List<SubBooking>();
            var classesToInsert = new List<Class>();
            var scheduleRecords = new List<ExcelScheduleRecord>();

            // Dictionary theo dõi các entities đã xử lý
            var processedClasses = new Dictionary<string, Guid>();
            var processedBookings = new Dictionary<string, Booking>();
            var processedSubBookings = new Dictionary<string, SubBooking>();

            // Collection để theo dõi tất cả các record (để ghi đè và báo cáo)
            var allScheduleRecords = new Dictionary<string, ExcelScheduleRecord>();

            // Theo dõi lịch đặt phòng để phát hiện xung đột
            var roomTimeSlots = new Dictionary<string, List<(TimeOnly Start, TimeOnly End, int TypeSlot, string BookingInfo)>>();

            // Xử lý tuần tự các records
            foreach (var record in clientScheduleRecord)
            {
                // Khởi tạo record với các thuộc tính an toàn
                var item = new ExcelScheduleRecord
                {
                    RowNumber = record.RowNumber,
                    GroupName = record.GroupName,
                    SubjectCode = record.SubjectCode,
                    RoomNo = record.RoomNo,
                    Lecturer = record.Lecturer,
                    SlotTypeCode = record.SlotTypeCode,
                    StatusSlot = record.StatusSlot,
                    SlotType = record.SlotType,
                    Date = record.Date,
                    Slot = record.Slot
                };

                try
                {

                    // Validation logic
                    var roomId = await _roomRepository.GetRoomIdByRoomNo(item.RoomNo);
                    if (roomId == Guid.Empty)
                    {
                        throw new Exception($"Room not found: {item.RoomNo}");
                    }

                    var accountId = await _accountRepository.GetAccountIdByAccountName(item.Lecturer);
                    if (accountId == Guid.Empty)
                    {
                        throw new Exception($"Lecturer not found: {item.Lecturer}");
                    }

                    var descriptionId = Guid.Parse("9f3eefb8-b8f3-4b0d-93c2-31ff152d5d4e");

                    DateTime date = item.Date > DateTime.Now
                        ? item.Date
                        : throw new Exception("Date must be greater than today");

                    var typeSlot = item.SlotType switch
                    {
                        "OLD SLOT" => 1,
                        "NEW SLOT" => 2,
                        "OUT SLOT" => 3,
                        _ => 0
                    };

                    if (typeSlot == 0)
                    {
                        throw new Exception($"Slot type not found: {item.SlotType}");
                    }

                    var (startTime, endTime) = GetTimeFromSlot(item.Slot, typeSlot);
                    item.StartTime = startTime;
                    item.EndTime = endTime;

                    // Kiểm tra khả dụng của giảng viên
                    var bookingExist = await _bookingRepository.GetBookingSuccessful(accountId);
                    var lecturerFree = await _subBookingRepository.LecturerFree(bookingExist, startTime, endTime, date);
                    if (!lecturerFree)
                    {
                        throw new Exception($"Lecturer {item.Lecturer} is not free at this time slot");
                    }

                    if (startTime < TimeOnly.FromDateTime(DateTime.Now.AddMinutes(-30)) && date == DateTime.Now.Date)
                    {
                        throw new Exception("Time must be greater than current by at least 30 minutes");
                    }

                    // Xử lý tạo/lấy Class
                    string classKey = $"{item.SubjectCode}_{item.GroupName}";
                    Guid classId;

                    if (!processedClasses.TryGetValue(classKey, out classId))
                    {
                        var existingClassId = await _classRepository.GetClassBySubjectCodeAndName(item.SubjectCode, item.GroupName);

                        if (existingClassId == null)
                        {
                            classId = Guid.NewGuid();
                            classesToInsert.Add(new Class
                            {
                                Id = classId,
                                SubjectCode = item.SubjectCode,
                                Name = item.GroupName,
                                CreatedAt = DateTime.Now,
                                CreatedBy = userId
                            });
                        }
                        else
                        {
                            classId = existingClassId.Value;
                        }

                        processedClasses.Add(classKey, classId);
                    }
                    if (await _bookingRepository.GetBookingByRoomId(roomId, startTime, endTime, date))
                    {
                        throw new Exception("Room is not available at this time slot");
                    }
                    // Xử lý tạo/lấy booking dựa trên room-lecturer
                    string bookingKey = $"{roomId}_{accountId}";
                    Booking booking;

                    if (!processedBookings.TryGetValue(bookingKey, out booking))
                    {
                        booking = new Booking
                        {
                            Id = Guid.NewGuid(),
                            RoomId = roomId,
                            LectureId = accountId,
                            DescriptionId = descriptionId,
                            Type = 6,
                            State = 5,
                            MoreDescription = item.GroupName,
                            CreatedAt = DateTime.Now,
                            CreatedBy = userId
                        };
                        bookingsToInsert.Add(booking);
                        processedBookings.Add(bookingKey, booking);
                    }

                    // Tạo SubBooking
                    var subBooking = new SubBooking
                    {
                        Id = Guid.NewGuid(),
                        BookingId = booking.Id,
                        ClassId = classId,
                        Approve = 10,
                        Private = false,
                        TypeSlot = typeSlot,
                        Reason = "Study",
                        StartTime = startTime,
                        EndTime = endTime,
                        Date = date,
                        CreatedAt = DateTime.Now,
                        CreatedBy = userId
                    };


                    // Kiểm tra trùng lặp SubBooking
                    string subBookingKey = $"{booking.Id}_{classId}_{date:yyyyMMdd}_{startTime}_{endTime}_{typeSlot}";

                    if (processedSubBookings.ContainsKey(subBookingKey))
                    {
                        throw new Exception("Duplicate booking detected");
                    }
                    processedSubBookings.Add(subBookingKey, subBooking);

                    // Đăng ký record để theo dõi
                    string recordKey = $"{roomId}_{date:yyyyMMdd}_{startTime}_{endTime}";
                    allScheduleRecords[recordKey] = item;

                    // Kiểm tra xung đột phòng
                    string roomDateKey = $"{roomId}_{date:yyyyMMdd}";

                    if (!roomTimeSlots.TryGetValue(roomDateKey, out var timeSlotList))
                    {
                        timeSlotList = new List<(TimeOnly, TimeOnly, int, string)>();
                        roomTimeSlots.Add(roomDateKey, timeSlotList);
                    }

                    // Kiểm tra xung đột thời gian
                    var conflictingSlots = timeSlotList
                        .Where(existingSlot =>
                            (startTime < existingSlot.End && endTime > existingSlot.Start) ||
                            (startTime == existingSlot.Start && endTime == existingSlot.End))
                        .ToList();

                    if (conflictingSlots.Any())
                    {
                        bool canOverride = typeSlot == 1; // OLD SLOT có thể ghi đè các loại khác
                        bool conflictsWithOldSlot = conflictingSlots.Any(s => s.TypeSlot == 1);

                        if (conflictsWithOldSlot && !canOverride)
                        {
                            // Slot hiện tại không phải OLD SLOT nhưng xung đột với OLD SLOT
                            throw new Exception("Cannot book this time slot because it conflicts with an OLD SLOT booking (higher priority)");
                        }
                        else if (canOverride)
                        {
                            // OLD SLOT có thể ghi đè các loại khác - tìm và loại bỏ các booking bị ghi đè
                            var overriddenBookingInfos = conflictingSlots
                                .Where(s => s.TypeSlot != 1) // Chỉ ghi đè các slot không phải OLD SLOT
                                .Select(s => s.BookingInfo)
                                .ToList();

                            if (overriddenBookingInfos.Any())
                            {
                                // Tìm các subBooking bị ghi đè để loại bỏ
                                var keysToRemove = processedSubBookings.Keys
                                    .Where(k => overriddenBookingInfos.Any(info => k.Contains(info)))
                                    .ToList();

                                foreach (var key in keysToRemove)
                                {
                                    if (processedSubBookings.TryGetValue(key, out var removedBooking))
                                    {
                                        processedSubBookings.Remove(key);

                                        // Đánh dấu tất cả các booking bị ghi đè
                                        foreach (var sb in subBookingsToInsert.Where(sb =>
                                            sb.BookingId == removedBooking.BookingId &&
                                            sb.Date == removedBooking.Date &&
                                            sb.StartTime == removedBooking.StartTime).ToList())
                                        {
                                            sb.Approve = -99;
                                        }

                                        // Cập nhật trạng thái cho tất cả các record bị ảnh hưởng
                                        foreach (var records in allScheduleRecords.Values.Where(r =>
                                            r.RoomNo == item.RoomNo &&
                                            r.Date == date &&
                                            r.StartTime == removedBooking.StartTime &&
                                            r.SlotType != "OLD SLOT").ToList())
                                        {
                                            record.IsSuccess = false;
                                            record.ErrorMessage = $"This booking was overridden by an OLD SLOT booking for {item.GroupName} ({item.SubjectCode})";
                                        }
                                    }
                                }

                                // Thêm subBooking mới sau khi đã ghi đè
                                subBookingsToInsert.Add(subBooking);

                                // Cập nhật danh sách time slots (xóa cũ, thêm mới)
                                var updatedSlots = timeSlotList
                                    .Where(s => !overriddenBookingInfos.Contains(s.BookingInfo))
                                    .ToList();

                                updatedSlots.Add((startTime, endTime, typeSlot, $"{booking.Id}_{classId}"));
                                roomTimeSlots[roomDateKey] = updatedSlots;
                            }
                            else
                            {
                                // Xung đột với các OLD SLOT khác
                                throw new Exception($"Time slot conflict with another OLD SLOT at {startTime} - {endTime}");
                            }
                        }
                        else
                        {
                            // Xung đột với slot khác (không phải OLD SLOT)
                            throw new Exception($"Time slot conflict detected at {startTime} - {endTime}");
                        }
                    }
                    else
                    {
                        // Không có xung đột, thêm vào danh sách để insert
                        subBookingsToInsert.Add(subBooking);
                        timeSlotList.Add((startTime, endTime, typeSlot, $"{booking.Id}_{classId}"));
                    }

                    // Đánh dấu thành công
                    item.IsSuccess = true;
                    item.ErrorMessage = null;
                }
                catch (Exception ex)
                {
                    // Đánh dấu thất bại với thông báo lỗi
                    item.IsSuccess = false;
                    item.ErrorMessage = ex.Message;
                }

                scheduleRecords.Add(item);
            }

            // Thực hiện bulk insert (chỉ với các subBooking không bị đánh dấu ghi đè)
            if (classesToInsert.Any())
            {
                await _classRepository.BulkInsertClasses(classesToInsert);
            }

            if (bookingsToInsert.Any())
            {
                await _bookingRepository.BulkInsertBookings(bookingsToInsert);
            }

            if (subBookingsToInsert.Any())
            {
                // Chỉ insert các subBooking không bị đánh dấu ghi đè
                var validSubBookings = subBookingsToInsert
                    .Where(sb => sb.Approve != -99)
                    .ToList();

                if (validSubBookings.Any())
                {
                    await _subBookingRepository.BulkInsertSubBookings(validSubBookings);
                }
            }

            return scheduleRecords;
        }
        public MemoryStream CreateExcelFromScheduleRecords(IEnumerable<ExcelScheduleRecord> records)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Schedule");

            // Add headers
            worksheet.Cells[1, 1].Value = "Group Name";
            worksheet.Cells[1, 2].Value = "Subject Code";
            worksheet.Cells[1, 3].Value = "Date";
            worksheet.Cells[1, 4].Value = "Slot";
            worksheet.Cells[1, 5].Value = "RoomNo";
            worksheet.Cells[1, 6].Value = "SessionNo";
            worksheet.Cells[1, 7].Value = "Lecturer";
            worksheet.Cells[1, 8].Value = "SlotTypeCode";
            worksheet.Cells[1, 9].Value = "StatusSlot";
            worksheet.Cells[1, 10].Value = "TypeSlot";

            // Format headers
            using (var range = worksheet.Cells[1, 1, 1, 10])
            {
                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.DarkBlue);
                range.Style.Font.Bold = true;
                range.Style.Font.Color.SetColor(Color.White);
                range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }

            // Add data rows
            int row = 2;
            foreach (var item in records)
            {
                worksheet.Cells[row, 1].Value = item.GroupName;
                worksheet.Cells[row, 2].Value = item.SubjectCode;

                // Format date
                worksheet.Cells[row, 3].Value = item.Date;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "dd/MM/yyyy";

                worksheet.Cells[row, 4].Value = item.Slot;

                // Format times

                worksheet.Cells[row, 5].Value = item.RoomNo;
                worksheet.Cells[row, 6].Value = item.SessionNo;
                worksheet.Cells[row, 7].Value = item.Lecturer;
                worksheet.Cells[row, 8].Value = item.SlotTypeCode;
                worksheet.Cells[row, 9].Value = item.StatusSlot;
                worksheet.Cells[row, 10].Value = item.SlotType;

                // Set status and conditionally format successful/failed rows


                row++;
            }

            // Format column widths for readability
            worksheet.Column(1).Width = 20; // Group name
            worksheet.Column(2).Width = 15; // Subject code
            worksheet.Column(3).Width = 12; // Date
            worksheet.Column(4).Width = 5;  // Slot
            worksheet.Column(5).Width = 10; // Room
            worksheet.Column(6).Width = 5;  // Row number
            worksheet.Column(7).Width = 20; // Lecturer
            worksheet.Column(8).Width = 15; // Slot type
            worksheet.Column(9).Width = 10; // Status
            worksheet.Column(10).Width = 15; // Error message


            // Create a MemoryStream to hold the package
            var stream = new MemoryStream(package.GetAsByteArray());
            return stream;
        }

        private (TimeOnly startTime, TimeOnly endTime) GetTimeFromSlot(int slot, int typeSlot)
        {
            // Create key for lookup
            var key = (typeSlot, slot);

            // All slot mappings in one dictionary
            var times = new Dictionary<(int, int), (TimeOnly, TimeOnly)>
    {
        // OLD SLOT (type 1)
        {(1, 1), (new TimeOnly(7, 0), new TimeOnly(8, 30))},
        {(1, 2), (new TimeOnly(8, 45), new TimeOnly(10, 15))},
        {(1, 3), (new TimeOnly(10, 30), new TimeOnly(12, 0))},
        {(1, 4), (new TimeOnly(12, 30), new TimeOnly(14, 0))},
        {(1, 5), (new TimeOnly(14, 15), new TimeOnly(15, 45))},
        {(1, 6), (new TimeOnly(16, 0), new TimeOnly(17, 15))},
        
        // NEW SLOT (type 2)
        {(2, 1), (new TimeOnly(7, 0), new TimeOnly(9, 15))},
        {(2, 2), (new TimeOnly(9, 30), new TimeOnly(11, 45))},
        {(2, 3), (new TimeOnly(12, 30), new TimeOnly(14, 45))},
        {(2, 4), (new TimeOnly(15, 0), new TimeOnly(17, 15))},


    };

            // Return the found mapping or default times
            return times.TryGetValue(key, out var result)
                ? result
                : (new TimeOnly(0, 0), new TimeOnly(0, 0));
        }
    }


}


