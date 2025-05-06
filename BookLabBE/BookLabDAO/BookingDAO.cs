using BookLabDTO;
using BookLabModel;
using BookLabModel.Model;
using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;

namespace BookLabDAO
{
    public class BookingDAO : SingletonBase<BookingDAO>
    {
        public async Task<IEnumerable<BookingDto>> GetAllBookings(int pageNumber, int pageSize)
        {
            var bookingsData = await _context.SubBookings
                .Where(x => x.IsDeleted == false && x.Approve == 0)
                .OrderBy(b => b.Date)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    Description = b.Booking.Description.Name,
                    BuildingName = b.Booking.Room.Building.Name,
                    LectureName = b.Booking.Lecturer.AccountDetail.FullName,
                    RoomNumber = b.Booking.Room.Name,
                    LectureEmail = b.Booking.Lecturer.Gmail,
                    TypeSlot = b.TypeSlot,
                    Date = b.Date,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Students = b.GroupInBookings
                        .SelectMany(g => g.StudentInBookings)
                        .Select(sib => new StudentDto
                        {
                            FullName = sib.StudentInGroup.Student.AccountDetail.FullName,
                            Telphone = sib.StudentInGroup.Student.AccountDetail.Telphone,
                            Email = sib.StudentInGroup.Student.Gmail,
                            AvatarUri = sib.StudentInGroup.Student.AccountDetail.Avatar,
                            StudentId = sib.StudentInGroup.Student.AccountDetail.StudentId,
                            DOB = sib.StudentInGroup.Student.AccountDetail.DOB
                        }).ToList()
                })
                .ToListAsync();

            return bookingsData;
        }


        // public async Task<BookingDto> GetBookingDetailById(Guid id)
        // {
        //     var booking = await _context.Bookings
        //         .Include(b => b.GroupInBookings)
        //         .ThenInclude(gib => gib.StudentInBookings)
        //         .ThenInclude(sib => sib.StudentInGroup)
        //         .ThenInclude(sig => sig.Student)
        //         .ThenInclude(s => s.AccountDetail)
        //         .Select(b => new BookingDto
        //         {
        //             BookingId = b.Id,
        //             Description = b.Description,
        //             DateTimeStartBooking = DateOnly.FromDateTime(b.DateTimeBooking),
        //             LectureName = b.Lecturer.AccountDetail.FullName,
        //             LectureEmail = b.Lecturer.Gmail,
        //             RoomNumber = b.Room.Name,
        //             Students = b.GroupInBookings.SelectMany(gib => gib.StudentInBookings.Select(sib => new StudentDto
        //             {
        //                 Id = sib.StudentInGroup.Student.Id,
        //                 FullName = sib.StudentInGroup.Student.AccountDetail.FullName,
        //                 Telphone = sib.StudentInGroup.Student.AccountDetail.Telphone,
        //                 Email = sib.StudentInGroup.Student.Gmail,
        //                 AvatarUri = sib.StudentInGroup.Student.AccountDetail.Avatar,
        //                 StudentId = sib.StudentInGroup.Student.AccountDetail.StudentId,
        //                 DOB = sib.StudentInGroup.Student.AccountDetail.DOB
        //             })).ToList(),
        //             StudentInBookings = b.GroupInBookings.SelectMany(gib => gib.StudentInBookings.Select(sib => new StudentInBookingDto
        //             {
        //                 StudentInGroupId = sib.StudentInGroupId,
        //                 GroupInBookingId = sib.GroupInBookingId,
        //                 CheckInTime = sib.CheckInTime,
        //                 CheckOutTime = sib.CheckOutTime,
        //                 Status = sib.Status
        //             })).ToList()
        //         })
        //         .FirstOrDefaultAsync(x => x.BookingId == id);
        //     return booking;
        // }
        //
        // public async Task<IEnumerable<Booking>> GetAllBookingsByRoomId(Guid id)
        // {
        //     return await _context.Bookings.Where(booking => booking.RoomId == id && booking.Status == true).ToListAsync();
        //     /*return await _context.Bookings.Where(booking => booking.RoomId == id).Include(c => c.Lecturer)
        //      * .Include(c => c.Room).ToListAsync();*/
        // }
        // public async Task<BookingDto> GetBookingsForSendEmail(Guid id)
        // {
        //     var booking = await _context.Bookings.Include(x => x.Room)
        //                                         .Select(x => new BookingDto
        //                                         {
        //                                             BookingId = x.Id,
        //                                             Description = x.Description,
        //                                             DateTimeStartBooking = DateOnly.FromDateTime(x.DateTimeBooking),
        //                                             RoomNumber = x.Room.Name
        //                                         }).FirstOrDefaultAsync(x => x.BookingId == id);
        //     return booking;
        // }
        //
        // public async Task<Booking> GetBookingLatestByLectureId(Guid id)
        // {
        //     var bookings = await _context.Bookings.Where(b => b.LecturerId == id).OrderByDescending(b => b.DateTimeBooking).FirstAsync();
        //     if (bookings == null) return null;
        //
        //     return bookings;
        // }
        //
        // public async Task<IEnumerable<GroupInBooking>> GetAllSlotsByLecturerIdFollowDate(Guid id, string[] listDates)
        // {
        //     var listsOfLecturer = await _context.Bookings.Where(booking => booking.LecturerId == id && booking.Status == true).ToListAsync();
        //     var bookingIds = listsOfLecturer.Select(booking => booking.Id).ToList();
        //
        //     var dateTimes = listDates.Select(date => DateTime.Parse(date)).ToList();
        //     var results = await _context.GroupInBookings
        //         .Where(gip => bookingIds.Contains(gip.BookingId) && dateTimes.Contains(gip.DateTimeInBooking.Date))
        //         .ToListAsync();
        //
        //     var distinctResults = results
        //         .GroupBy(gip => new { gip.DateTimeInBooking.Date, gip.BookingId, gip.SlotId })
        //         .Select(group => group.First())
        //         .ToList();
        //
        //     return distinctResults;
        // }

        public async Task<Booking> GetBookingsById(Guid id)
        {
            var bookings = await _context.Bookings.Include(b => b.Room).Include(b => b.Room.Building)
                .Include(b => b.Room.Building.Campus).FirstOrDefaultAsync(c => c.Id == id);
            if (bookings == null) return null;

            return bookings;
        }

        //
        //         public async Task<BookingDto> GetBookingDetailById(Guid id)
        //         {
        //             var booking = await _context.Bookings
        //                 .Include(b => b.GroupInBookings)
        //                 .ThenInclude(gib => gib.StudentInBookings)
        //                 .ThenInclude(sib => sib.StudentInGroup)
        //                 .ThenInclude(sig => sig.Student)
        //                 .ThenInclude(s => s.AccountDetail)
        //                 .Select(b => new BookingDto
        //                 {
        //                     BookingId = b.Id,
        //                     Description = b.Description,
        //                     DateTimeStartBooking = DateOnly.FromDateTime(b.DateTimeBooking),
        //                     LectureName = b.Lecturer.AccountDetail.FullName,
        //                     LectureEmail = b.Lecturer.Gmail,
        //                     RoomNumber = b.Room.Name,
        //                     Students = b.GroupInBookings.SelectMany(gib => gib.StudentInBookings.Select(sib => new StudentDto
        //                     {
        //                         Id = sib.StudentInGroup.Student.Id,
        //                         FullName = sib.StudentInGroup.Student.AccountDetail.FullName,
        //                         Telphone = sib.StudentInGroup.Student.AccountDetail.Telphone,
        //                         Email = sib.StudentInGroup.Student.Gmail,
        //                         AvatarUri = sib.StudentInGroup.Student.AccountDetail.Avatar,
        //                         StudentId = sib.StudentInGroup.Student.AccountDetail.StudentId,
        //                         DOB = sib.StudentInGroup.Student.AccountDetail.DOB
        //                     })).ToList(),
        //                     StudentInBookings = b.GroupInBookings.SelectMany(gib => gib.StudentInBookings.Select(sib => new StudentInBookingDto
        //                     {
        //                         StudentInGroupId = sib.StudentInGroupId,
        //                         GroupInBookingId = sib.GroupInBookingId,
        //                         CheckInTime = sib.CheckInTime,
        //                         CheckOutTime = sib.CheckOutTime,
        //                         Status = sib.Status
        //                     })).ToList()
        //                 })
        //                 .FirstOrDefaultAsync(x => x.BookingId == id);
        //             return booking;
        //         }
        //
        //         public async Task<IEnumerable<Booking>> GetAllBookingsByRoomId(Guid id)
        //         {
        //             return await _context.Bookings.Where(booking => booking.RoomId == id && booking.Status == true).ToListAsync();
        //             /*return await _context.Bookings.Where(booking => booking.RoomId == id).Include(c => c.Lecturer)
        //              * .Include(c => c.Room).ToListAsync();*/
        //         }
        //         public async Task<BookingDto> GetBookingsForSendEmail(Guid id)
        //         {
        //             var booking = await _context.Bookings.Include(x => x.Room)
        //                                                 .Select(x => new BookingDto
        //                                                 {
        //                                                     BookingId = x.Id,
        //                                                     Description = x.Description,
        //                                                     DateTimeStartBooking = DateOnly.FromDateTime(x.DateTimeBooking),
        //                                                     RoomNumber = x.Room.Name
        //                                                 }).FirstOrDefaultAsync(x => x.BookingId == id);
        //             return booking;
        //         }
        //
        //         public async Task<Booking> GetBookingLatestByLectureId(Guid id)
        //         {
        //             var bookings = await _context.Bookings.Where(b => b.LecturerId == id).OrderByDescending(b => b.DateTimeBooking).FirstAsync();
        //             if (bookings == null) return null;
        //
        //             return bookings;
        //         }
        //
        //         public async Task<IEnumerable<GroupInBooking>> GetAllSlotsByLecturerIdFollowDate(Guid id, string[] listDates)
        //         {
        //             var listsOfLecturer = await _context.Bookings.Where(booking => booking.LecturerId == id && booking.Status == true).ToListAsync();
        //             var bookingIds = listsOfLecturer.Select(booking => booking.Id).ToList();
        //
        //             var dateTimes = listDates.Select(date => DateTime.Parse(date)).ToList();
        //             var results = await _context.GroupInBookings
        //                 .Where(gip => bookingIds.Contains(gip.BookingId) && dateTimes.Contains(gip.DateTimeInBooking.Date))
        //                 .ToListAsync();
        //
        //             var distinctResults = results
        //                 .GroupBy(gip => new { gip.DateTimeInBooking.Date, gip.BookingId, gip.SlotId })
        //                 .Select(group => group.First())
        //                 .ToList();
        //
        //             return distinctResults;
        //         }
        //
        //         public async Task<Booking> GetBookingsById(Guid id)
        //         {
        //             var bookings = await _context.Bookings.Include(b => b.Room).Include(b => b.Room.Building).
        //                             Include(b => b.Room.Building.Campus).FirstOrDefaultAsync(c => c.Id == id);
        //             if (bookings == null) return null;
        //
        //             return bookings;
        //         }
        public async Task AddBooking(Booking bookings)
        {
            await _context.Bookings.AddAsync(bookings);
            await _context.SaveChangesAsync();
        }

        public async Task AddBookingWithCache(Booking bookings)
        {
            await _context.Bookings.AddAsync(bookings);
            await _context.SaveChangesAsync();

            var cacheBookings = _memoryCache.Get<List<Booking>>(Common.SuccessfulBookings);
            if (cacheBookings != null)
            {
                cacheBookings.Add(bookings);
                _memoryCache.Set(Common.SuccessfulBookings, cacheBookings, TimeSpan.FromMinutes(1));
            }
        }

        public async Task UpdateBooking(Booking bookings)
        {
            var existingItem = await GetBookingsById(bookings.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(bookings);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBooking(Guid id)
        {
            var bookings = await GetBookingsById(id);

            if (bookings != null)
            {
                _context.Bookings.Remove(bookings);
                await _context.SaveChangesAsync();
            }
        }
        // public async Task<bool> ChangeStatus(Guid id)
        // {
        //     var bookings = await GetBookingsById(id);
        //     bookings.Status = !bookings.Status;
        //     _context.SaveChanges();
        //     return bookings.Status;
        // }
        //
        // public async Task<bool> LecturerFree(Guid id, Dictionary<string, Guid[]> timesOfBookings)
        // {
        //     string[] listDates = timesOfBookings.Keys.ToArray();
        //     var slots = await GetAllSlotsByLecturerIdFollowDate(id, listDates);
        //     foreach (GroupInBooking slot in slots)
        //     {
        //         var dateStr = slot.DateTimeInBooking.Date.ToString("yyyy-MM-dd");
        //
        //         if (timesOfBookings.TryGetValue(dateStr, out Guid[] slotIds) && slotIds.Contains(slot.SlotId))
        //         {
        //             return false; // Giảng viên không rảnh vì có slot trùng
        //         }
        //     }
        //
        //     return true;
        // }

        //      public async Task<IEnumerable<ScheduleDto>> GetBookingInWeek(DateTime firstDateOfWeek, DateTime endDateOfWeek, Guid lectureId)
        //      {
        //
        //
        //          //var result = await _context.Bookings.Include(b=>b.GroupInBookings)
        //          //    .ThenInclude(gib => gib.StudentInBookings)
        //          //    .Include(b => b.Room)
        //          //    .Where(b => b.LecturerId == lectureId 
        //          //    && b.GroupInBookings.Count > 0 
        //          //    && b.GroupInBookings.ElementAt(0).DateTimeInBooking >= firstDateOfWeek
        //          //    && b.GroupInBookings.ElementAt(0).DateTimeInBooking <= endDateOfWeek).ToListAsync();
        //
        // DateTime startOfDay = firstDateOfWeek.Date; // Lấy ngày nhưng giờ về 00:00:00
        //
        //          // Cuối ngày
        //          DateTime endOfDay = endDateOfWeek.Date.AddDays(1);
        //
        // var buff = await _context.GroupInBookings.Include(gib => gib.Slot).Include(gib => gib.Group).Include(gib => gib.Booking.Room)
        // 	.Where(gib => gib.Group.LecturerId == lectureId 
        //              && gib.DateTimeInBooking >= startOfDay
        // 	&& gib.DateTimeInBooking <= endOfDay
        // 	)
        //
        //              .ToListAsync();
        //
        //          var isolate = buff.GroupBy(b => new { b.Slot, b.DateTimeInBooking, b.Booking, b.Id }).Select(g => new ScheduleDto
        //          {
        //              bookingId = g.Key.Booking.Id,
        //              groupInBookingId = g.Key.Id,
        //              dateTimeInBooking = g.Key.DateTimeInBooking,
        //              slot = new SlotDto
        //              {
        //                  CloseTime = g.Key.Slot.CloseTime,
        //                  OpenTime = g.Key.Slot.OpenTime,
        //                  Name = g.Key.Slot.Name,
        //              },
        //              room = new RoomDTO
        //              {
        //                  Name = g.Key.Booking.Room.Name
        //
        //              },
        //              lecturerId = lectureId
        //
        //
        //
        //          });
        //          return isolate;
        //      }


        //         public async Task UpdateBooking(Booking bookings)
        //         {
        //             var existingItem = await GetBookingsById(bookings.Id);
        //             if (existingItem == null) return;
        //             _context.Entry(existingItem).CurrentValues.SetValues(bookings);
        //             await _context.SaveChangesAsync();
        //         }
        //         public async Task DeleteBooking(Guid id)
        //         {
        //             var bookings = await GetBookingsById(id);
        //
        //             if (bookings != null)
        //             {
        //                 _context.Bookings.Remove(bookings);
        //                 await _context.SaveChangesAsync();
        //             }
        //         }
        //         public async Task<bool> ChangeStatus(Guid id)
        //         {
        //             var bookings = await GetBookingsById(id);
        //             bookings.Status = !bookings.Status;
        //             _context.SaveChanges();
        //             return bookings.Status;
        //         }
        //
        //         public async Task<bool> LecturerFree(Guid id, Dictionary<string, Guid[]> timesOfBookings)
        //         {
        //             string[] listDates = timesOfBookings.Keys.ToArray();
        //             var slots = await GetAllSlotsByLecturerIdFollowDate(id, listDates);
        //             foreach (GroupInBooking slot in slots)
        //             {
        //                 var dateStr = slot.DateTimeInBooking.Date.ToString("yyyy-MM-dd");
        //
        //                 if (timesOfBookings.TryGetValue(dateStr, out Guid[] slotIds) && slotIds.Contains(slot.SlotId))
        //                 {
        //                     return false; // Giảng viên không rảnh vì có slot trùng
        //                 }
        //             }
        //
        //             return true;
        //         }
        //
        //         public async Task<IEnumerable<ScheduleDto>> GetBookingInWeek(DateTime firstDateOfWeek, DateTime endDateOfWeek, Guid lectureId)
        //         {
        //
        //
        //             //var result = await _context.Bookings.Include(b=>b.GroupInBookings)
        //             //    .ThenInclude(gib => gib.StudentInBookings)
        //             //    .Include(b => b.Room)
        //             //    .Where(b => b.LecturerId == lectureId 
        //             //    && b.GroupInBookings.Count > 0 
        //             //    && b.GroupInBookings.ElementAt(0).DateTimeInBooking >= firstDateOfWeek
        //             //    && b.GroupInBookings.ElementAt(0).DateTimeInBooking <= endDateOfWeek).ToListAsync();
        //
        // 			DateTime startOfDay = firstDateOfWeek.Date; // Lấy ngày nhưng giờ về 00:00:00
        //
        //             // Cuối ngày
        //             DateTime endOfDay = endDateOfWeek.Date.AddDays(1);
        //
        // 			var buff = await _context.GroupInBookings.Include(gib => gib.Slot).Include(gib => gib.Group).Include(gib => gib.Booking.Room)
        // 				.Where(gib => gib.Group.LecturerId == lectureId 
        //                 && gib.DateTimeInBooking >= startOfDay
        // 				&& gib.DateTimeInBooking <= endOfDay
        // 				)
        //
        //                 .ToListAsync();
        //
        //             var isolate = buff.GroupBy(b => new { b.Slot, b.DateTimeInBooking, b.Booking, b.Id }).Select(g => new ScheduleDto
        //             {
        //                 bookingId = g.Key.Booking.Id,
        //                 groupInBookingId = g.Key.Id,
        //                 dateTimeInBooking = g.Key.DateTimeInBooking,
        //                 slot = new SlotDto
        //                 {
        //                     CloseTime = g.Key.Slot.CloseTime,
        //                     OpenTime = g.Key.Slot.OpenTime,
        //                     Name = g.Key.Slot.Name,
        //                 },
        //                 room = new RoomDTO
        //                 {
        //                     Name = g.Key.Booking.Room.Name
        //
        //                 },
        //                 lecturerId = lectureId
        //
        //
        //
        //             });
        //             return isolate;
        //         }
        //
        //

        public async Task<IEnumerable<SubBookingDto>> ConvertTemporaryRoomStatusToSubBooking(Guid RoomId, DateTime StartTime, DateTime EndTime)
        {
            using (var context = new BookLabContext())
            {
                var temporaryRooms = await context.TemporaryRoomStatus.Where(t => t.RoomId == RoomId && !(StartTime >= t.EndDate) && !(EndTime <= t.StartDate)).ToListAsync();
                List<SubBookingDto> listSubBooking = new List<SubBookingDto>();
                foreach (var temporaryRoom in temporaryRooms)
                {
                    List<(DateTime start, DateTime end)> splitDate = new List<(DateTime, DateTime)>();
                    DateTime currentTime = temporaryRoom.StartDate;
                    while (currentTime < temporaryRoom.EndDate)
                    {
                        DateTime endOfDate = currentTime.Date.AddHours(23).AddMinutes(59).AddSeconds(59);
                        if (endOfDate >= temporaryRoom.EndDate && currentTime >= StartTime && temporaryRoom.EndDate <= EndTime)
                        {
                            splitDate.Add((currentTime, temporaryRoom.EndDate));
                            break;
                        }
                        if (currentTime >= StartTime && endOfDate <= EndTime)
                        {
                            splitDate.Add((currentTime, endOfDate));
                        }

                        currentTime = currentTime.Date.AddDays(1);
                    }
                    foreach (var separateTime in splitDate)
                    {
                        SubBookingDto subBookingDto = new SubBookingDto();
                        subBookingDto.StartTime = TimeOnly.FromDateTime(separateTime.start);
                        subBookingDto.EndTime = TimeOnly.FromDateTime(separateTime.end);
                        subBookingDto.Approve = temporaryRoom.TemporaryStatus;
                        subBookingDto.Date = separateTime.start.Date;
                        subBookingDto.Private = true;
                        subBookingDto.TypeSlot = 0;
                        subBookingDto.Type = 0;
                        subBookingDto.BookingId = temporaryRoom.Id;
                        subBookingDto.Id = new Guid();
                        listSubBooking.Add(subBookingDto);
                    }

                }
                return listSubBooking;

            }

        }
        public async Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeek(DateTime StartTime, DateTime EndTime,
            Guid RoomId, Guid LectureId)
        {
            using (var context = new BookLabContext())
            {


                DateTime nowUtc7 = DateTime.UtcNow.AddHours(7);
                Console.WriteLine("Current Time in UTC+7:" + nowUtc7);
                if (StartTime < nowUtc7)
                {
                    StartTime = nowUtc7;

                }
                var specialSubBookings = await ConvertTemporaryRoomStatusToSubBooking(RoomId, StartTime, EndTime);

                var subBookings = await context.SubBookings.Include(sb => sb.Booking).ThenInclude(b => b.Lecturer).Include(sb => sb.GroupInBookings).ThenInclude(gib => gib.StudentInBookings).Where(sb => sb.Booking.RoomId == RoomId && sb.Date.Date >= StartTime.Date && sb.Date.Date <= EndTime.Date && (sb.Approve == 10 || (sb.Booking.LectureId == LectureId && sb.Approve == 0))).ToListAsync();
                var subBookingsDto = subBookings.Select(sb => new SubBookingDto
                {
                    Id = sb.Id,
                    BookingId = sb.BookingId,
                    ClassId = sb.ClassId,
                    LectureId = sb.Booking?.LectureId,
                    LectureCode = sb.Booking?.Lecturer?.AccountName,
                    Approve = sb.Approve,
                    Private = sb.Private,
                    TypeSlot = sb.TypeSlot,
                    StartTime = sb.StartTime,
                    Reason = sb.Reason,
                    Type = sb.Booking.Type,
                    State = sb.Booking.State,
                    EndTime = sb.EndTime,
                    Date = sb.Date,
                    StudentQuantity = sb.ClassId == null
                        ? (sb.GroupInBookings?.Sum(gib => gib.StudentInBookings?.Count ?? 0) ?? 0)
                        : 0,
                    GroupQuantity = sb.GroupInBookings?.Count ?? 0,
                });
                List<SubBookingDto> result = new List<SubBookingDto>();
                if (subBookingsDto != null)
                {
                    result.AddRange(subBookingsDto);
                }
                if (specialSubBookings != null)
                {
                    result.AddRange(specialSubBookings);
                }



                return result;
            }
        }

        public async Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeekOfLecturer(DateTime StartTime,
            DateTime EndTime, Guid LectureId)
        {


            var subBookings = await _context.SubBookings.AsNoTracking().Include(sb => sb.Booking)
                .ThenInclude(b => b.Room).Include(sb => sb.GroupInBookings).ThenInclude(gib => gib.StudentInBookings)
                .Where(sb =>
                    sb.Booking.LectureId == LectureId && sb.IsDeleted == false && sb.Date.Date >= StartTime.Date &&
                    sb.Date.Date <= EndTime.Date).ToListAsync();
            var subBookingsDto = subBookings.Select(sb => new SubBookingDto
            {
                Id = sb.Id,
                BookingId = sb.BookingId,
                ClassId = sb.ClassId,
                LectureId = sb.Booking?.LectureId,
                Approve = sb.Approve,
                Private = sb.Private,
                TypeSlot = sb.TypeSlot,
                StartTime = sb.StartTime,
                Type = sb.Booking.Type,
                State = sb.Booking.State,
                EndTime = sb.EndTime,
                Reason = sb.Reason,
                Date = sb.Date,
                RoomName = sb.Booking.Room.Name,
                StudentQuantity = sb.ClassId == null
                    ? (sb.GroupInBookings?.Where(gib => gib.IsDeleted == false).Sum(gib =>
                        gib.StudentInBookings?.Count(sib => sib.IsDeleted == false) ?? 0) ?? 0)
                    : 0,
                GroupQuantity = sb.GroupInBookings?.Count(gib => gib.IsDeleted == false) ?? 0,
                UpdatedAt = sb.UpdatedAt
            });



            return subBookingsDto;

        }
       

        public async Task<IEnumerable<Booking>> GetBookingSuccessful(Guid lecturerId)
        {
            var listBooking = await _context.Bookings.Where(b => b.LectureId.Equals(lecturerId) && b.State == 5 && b.Type == 0)
                .ToListAsync();
            if (listBooking == null)
            {
                return null;
            }

            return listBooking;
        }

        public async Task<Guid[]> GetBookingSuccessfulId(Guid lecturerId)
        {
            var bookings = await CacheHelper.GetSuccessfulBookingsFromCache();

            return bookings
                .Where(b => b.LectureId == lecturerId)
                .Select(b => b.Id)
                .ToArray();
        }


        public async Task BulkInsertBookings(IEnumerable<Booking> bookings)
        {
            if (bookings == null || !bookings.Any())
                return;

            await _context.BulkInsertAsync(bookings);
        }

        public async Task<IEnumerable<CategoryDescription>> GetAllCategoryDescription()
        {
            var listCategoryDescription = await _context.CategoryDescriptions.ToListAsync();
            return listCategoryDescription;
        }

        public async Task<bool> GetBookingByRoomId(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var bookings = await _context.Bookings
                .Where(b => b.RoomId == roomId && b.IsDeleted == false && b.State == 5)
                .SelectMany(b => b.SubBookings) // Lấy tất cả SubBookings
                .Where(s => s.Date == date && // Lọc theo ngày trước
                            (startTime < s.EndTime && endTime > s.StartTime) && s.IsDeleted == false && s.Approve == 10) // Điều kiện xung đột thời gian đầy đủ
                .ToListAsync();

            return bookings.Any();
        }

        public async Task<Guid[]> GetAllBookingsByRoom(Guid roomId)
        {
            var listBookings =
                await _context.Bookings.Where(b => b.RoomId.Equals(roomId) && b.State == 5 && b.Type == 0).Select(s => s.Id).ToArrayAsync();
            if (listBookings == null)
            {
                return null;
            }

            return listBookings;
        }

        public async Task<Guid[]> GetAllBookingsByRoomId(Guid roomId)
        {
            var bookings = await CacheHelper.GetSuccessfulBookingsFromCache();

            return bookings
                .Where(b => b.RoomId == roomId)
                .Select(b => b.Id)
                .ToArray();
        }

        public async Task<bool> CheckRoomAvaliable(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var listBookings = await _context.Bookings.Where(b => b.RoomId.Equals(roomId) && b.Type == 6)
                .Select(s => s.Id).ToListAsync();
            var subBookings = await _context.SubBookings.Where(sb => sb.BookingId != null &&
                                                                     listBookings.Contains(sb.BookingId.Value)
                                                                     && sb.Date.Equals(date) &&
                                                                     !(sb.EndTime <= startTime ||
                                                                       sb.StartTime >= endTime)).ToListAsync();

            return !subBookings.Any();
        }

        public async Task<bool> CheckRoomNoPrivate(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var listBookings = await _context.Bookings.Where(b => b.RoomId.Equals(roomId) && b.Type == 5)
                .Select(s => s.Id).ToListAsync();
            var subBookings = await _context.SubBookings.Where(sb =>
                sb.BookingId != null && listBookings.Contains(sb.BookingId.Value) && sb.Private
                && sb.Date.Equals(date) && !(sb.EndTime <= startTime || sb.StartTime >= endTime)).ToListAsync();

            return !subBookings.Any();
        }

        public async Task<bool> IsRoomAvailableByType(
            Guid roomId,
            TimeOnly startTime,
            TimeOnly endTime,
            DateTime date,
            int bookingType,
            bool requirePrivate = false)
        {
            var query = from sb in _context.SubBookings
                        join b in _context.Bookings on sb.BookingId equals b.Id
                        where b.RoomId == roomId
                              && b.Type == bookingType
                              && sb.Date == date
                              && !(sb.EndTime <= startTime || sb.StartTime >= endTime)
                        select sb;

            if (requirePrivate)
            {
                query = query.Where(sb => sb.Private);
            }

            return !await query.AnyAsync();
        }

        public async Task<List<SubBooking>> GetRoomSubBookingsInRange(
            Guid roomId,
            TimeOnly startTime,
            TimeOnly endTime,
            DateTime date)
        {
            var query = from sb in _context.SubBookings
                        join b in _context.Bookings on sb.BookingId equals b.Id
                        where b.RoomId == roomId
                              && sb.Date == date
                              && !(sb.EndTime <= startTime || sb.StartTime >= endTime)
                        select new SubBooking
                        {
                            Id = sb.Id,
                            BookingId = sb.BookingId,
                            StartTime = sb.StartTime,
                            EndTime = sb.EndTime,
                            Date = sb.Date,
                            Private = sb.Private,
                            Booking = new Booking
                            {
                                Id = b.Id,
                                Type = b.Type,
                                RoomId = b.RoomId
                            }
                        };

            return await query.ToListAsync();
        }

        public async Task<List<SubBooking>> GetRoomSubBookingsInRangeCached(
            Guid roomId,
            TimeOnly startTime,
            TimeOnly endTime,
            DateTime date)
        {
            var allSubBookings = await CacheHelper.GetSuccessfulSubBookingsFromCache();

            return allSubBookings
                .Where(sb => sb.Booking.RoomId == roomId
                             && sb.Date == date
                             && !(sb.EndTime <= startTime || sb.StartTime >= endTime))
                .ToList();
        }

        public async Task<bool> Undo(List<Guid> bookingIds)
        {
            if (bookingIds == null || !bookingIds.Any())
                return false;

            var bookings = await _context.Bookings.Where(b => bookingIds.Contains(b.Id))
                .ToListAsync();
            var subBookings = await _context.SubBookings.Where(sb => bookingIds.Contains(sb.BookingId.Value))
                .ToListAsync();
            if (bookings == null || !bookings.Any())
                return false;
            if (subBookings == null || !subBookings.Any())
                return false;

            foreach (var booking in bookings)
            {
                booking.IsDeleted = true; // Đánh dấu là đã xóa
                booking.State = 0; // Hoàn tác trạng thái
            }

            foreach (var subBooking in subBookings)
            {
                subBooking.IsDeleted = true; // Đánh dấu là đã xóa
                subBooking.Approve = 0; // Hoàn tác trạng thái
            }

            await _context.BulkUpdateAsync(bookings);
            await _context.BulkUpdateAsync(subBookings);


            await _context.SaveChangesAsync();
            return true;


        }
        public async Task<IEnumerable<SubBooking>> GetSubBookingsByDateRange(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            return await _context.SubBookings
                .Include(sb => sb.Booking)
                .ThenInclude(b => b.Room)
                .ThenInclude(r => r.CategoryRoom)
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .ToListAsync();
        }

        public async Task<int> GetUniqueTeachersCount(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            return await _context.Accounts
                .Where(a => a.RoleId == 4 &&
                           _context.SubBookings
                               .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                               .Select(sb => sb.Booking.LectureId)
                               .Contains(a.Id))
                .CountAsync();
        }

        public async Task<IEnumerable<(DateTime Date, int Count)>> GetBookingTrend(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            return await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .GroupBy(sb => sb.Date.Date)
                .Select(g => new ValueTuple<DateTime, int>(g.Key, g.Count()))
                .ToListAsync();
        }

        public async Task<IEnumerable<(string DayOfWeek, int Count)>> GetBookingsByDayOfWeek(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();

            // Materialize dữ liệu trước
            var subBookings = await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .Select(sb => new { sb.Date })
                .ToListAsync();

            // GroupBy và tính toán phía client
            var query = subBookings
                .GroupBy(sb => sb.Date.DayOfWeek)
                .Select(g => new { DayOfWeek = g.Key, Count = g.Count() })
                .OrderBy(x => x.DayOfWeek) // Sắp xếp theo thứ tự ngày trong tuần
                .ToList();

            var dayNames = new[] { "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy" };
            return query.Select(x => new ValueTuple<string, int>(dayNames[(int)x.DayOfWeek], x.Count));
        }

        public async Task<IEnumerable<(string RoomType, int Count)>> GetRoomTypeUsage(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            return await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .Select(sb => sb.Booking.Room.TypeSlot)
                .GroupBy(type => type)
                .Select(g => new ValueTuple<string, int>(g.Key, g.Count()))
                .ToListAsync();
        }

        public async Task<int> GetAvailableRooms(DateTime date)
        {
            using var _context = new BookLabContext();
            var bookedRooms = await _context.SubBookings
                .Where(sb => sb.Date.Date == date.Date)
                .Select(sb => sb.Booking.RoomId)
                .Distinct()
                .CountAsync();
            var totalRooms = await _context.Rooms.CountAsync();
            return totalRooms - bookedRooms;
        }

        public async Task<IEnumerable<(string Reason, double Percentage)>> GetTopReasons(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();

            // Lấy tổng số booking trước
            var totalBookings = await _context.SubBookings
                .CountAsync(sb => sb.Date >= startDate && sb.Date <= endDate);

            // Lấy số lượng theo lý do
            var query = await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate && sb.Booking.Description.Name != null && sb.Booking.Description.Name != "")
                .GroupBy(sb => sb.Booking.Description.Name)
                .Select(g => new { Reason = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Tính phần trăm phía client
            return query.Select(x => new ValueTuple<string, double>(
                x.Reason,
                totalBookings > 0 ? (double)x.Count / totalBookings * 100 : 0
            ));
        }

        public async Task<double> GetOccupancyRate(DateTime date)
        {
            using var _context = new BookLabContext();
            var bookedRooms = await _context.SubBookings
                .Where(sb => sb.Date.Date == date.Date)
                .Select(sb => sb.Booking.RoomId)
                .Distinct()
                .CountAsync();
            var totalRooms = await _context.Rooms.CountAsync();
            return totalRooms > 0 ? (double)bookedRooms / totalRooms * 100 : 0;
        }

        public async Task<IEnumerable<(int Hour, int Count)>> GetBookingHeatmap(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            return await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .GroupBy(sb => sb.StartTime.Hour)
                .Select(g => new ValueTuple<int, int>(g.Key, g.Count()))
                .ToListAsync();
        }

        public async Task<IEnumerable<(string TeacherName, int Count)>> GetBookingsByTeacher(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();

            var query = await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .Join(_context.Bookings,
                      sb => sb.BookingId,
                      b => b.Id,
                      (sb, b) => new { SubBooking = sb, Booking = b })
                .Join(_context.Accounts.Where(a => a.RoleId == 4),
                      x => x.Booking.LectureId,
                      a => a.Id,
                      (x, a) => new { TeacherName = a.AccountName })
                .GroupBy(x => x.TeacherName)
                .Select(g => new { TeacherName = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            return query.Select(x => new ValueTuple<string, int>(x.TeacherName, x.Count));
        }

        public async Task<double> GetAverageLeadTime(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            var leadTimes = await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .Select(sb => SqlServerDbFunctionsExtensions.DateDiffDay(EF.Functions, sb.Booking.CreatedAt ?? sb.Date, sb.Date)) // Use SqlServer-specific DateDiffDay
                .ToListAsync();

            return leadTimes.Any() ? leadTimes.Average() : 0;
        }

        public async Task<IEnumerable<(string TimeSlot, int Count)>> GetBookingsByTimeSlot(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();

            // Lấy StartTime và EndTime dưới dạng Hour và Minute
            var query = await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .GroupBy(sb => new { StartHour = sb.StartTime.Hour, StartMinute = sb.StartTime.Minute, EndHour = sb.EndTime.Hour, EndMinute = sb.EndTime.Minute })
                .Select(g => new { Key = g.Key, Count = g.Count() })
                .ToListAsync();

            // Định dạng TimeSlot phía client
            return query.Select(x =>
            {
                var startTime = new TimeOnly(x.Key.StartHour, x.Key.StartMinute);
                var endTime = new TimeOnly(x.Key.EndHour, x.Key.EndMinute);
                return new ValueTuple<string, int>($"{startTime:HH:mm} - {endTime:HH:mm}", x.Count);
            });
        }

        public async Task<IEnumerable<(string CategoryName, int Count)>> GetBookingsByCategoryRoom(DateTime startDate, DateTime endDate)
        {
            using var _context = new BookLabContext();
            return await _context.SubBookings
                .Where(sb => sb.Date >= startDate && sb.Date <= endDate)
                .Join(_context.Rooms,
                      sb => sb.Booking.RoomId,
                      r => r.Id,
                      (sb, r) => new { Booking = sb, CategoryId = r.CategoryRoomId })
                .Join(_context.CategoryRooms,
                      x => x.CategoryId,
                      cr => cr.Id,
                      (x, cr) => new { CategoryName = cr.Name })
                .GroupBy(x => x.CategoryName)
                .Select(g => new ValueTuple<string, int>(g.Key, g.Count()))
                .ToListAsync();
        }
        private int CalculateSlot(TimeOnly startTime, TimeOnly endTime, int typeSlot)
        {
            TimeSpan startTimeSpan = startTime.ToTimeSpan();
            TimeSpan endTimeSpan = endTime.ToTimeSpan();

            if (typeSlot == 1)
            {
                // Oldslot: 6 slot
                if (startTimeSpan >= new TimeSpan(7, 0, 0) && endTimeSpan <= new TimeSpan(8, 30, 0)) return 1;
                if (startTimeSpan >= new TimeSpan(8, 45, 0) && endTimeSpan <= new TimeSpan(10, 15, 0)) return 2;
                if (startTimeSpan >= new TimeSpan(10, 30, 0) && endTimeSpan <= new TimeSpan(12, 0, 0)) return 3;
                if (startTimeSpan >= new TimeSpan(12, 30, 0) && endTimeSpan <= new TimeSpan(14, 0, 0)) return 4;
                if (startTimeSpan >= new TimeSpan(14, 15, 0) && endTimeSpan <= new TimeSpan(15, 45, 0)) return 5;
                if (startTimeSpan >= new TimeSpan(16, 0, 0) && endTimeSpan <= new TimeSpan(17, 30, 0)) return 6;
            }
            else if (typeSlot == 2)
            {
                // Newslot: 4 slot
                if (startTimeSpan >= new TimeSpan(7, 0, 0) && endTimeSpan <= new TimeSpan(9, 15, 0)) return 1;
                if (startTimeSpan >= new TimeSpan(9, 30, 0) && endTimeSpan <= new TimeSpan(11, 45, 0)) return 2;
                if (startTimeSpan >= new TimeSpan(12, 30, 0) && endTimeSpan <= new TimeSpan(14, 45, 0)) return 3;
                if (startTimeSpan >= new TimeSpan(15, 0, 0) && endTimeSpan <= new TimeSpan(17, 15, 0)) return 4;
            }

            return -1; // Return -1 if no slot matches (can handle error if needed)
        }

        public async Task<IEnumerable<RoomAvailabilityDto>> GetRoomAvailabilityAsync(DateTime date, string typeSlot)
        {
            int maxSlots = typeSlot == "Oldslot" ? 6 : 4; // Oldslot: 6 slot, Newslot: 4 slot
            int typeSlotInt = typeSlot == "Oldslot" ? 1 : 2; // Map string to corresponding integer value.

            var rooms = await _context.Rooms.ToListAsync();
            var bookings = await _context.SubBookings
                .Include(sb => sb.Booking.Room)
                .Where(sb => sb.Date.Date == date.Date && sb.TypeSlot == typeSlotInt) // Use integer comparison.
                .ToListAsync();

            var result = new List<RoomAvailabilityDto>();

            foreach (var room in rooms)
            {
                var roomBookings = bookings.Where(b => b.Booking.RoomId == room.Id).ToList();
                var bookedSlots = roomBookings
                    .Select(b => CalculateSlot(b.StartTime, b.EndTime, typeSlotInt)) // Pass integer typeSlot.
                    .Where(slot => slot != -1) // Exclude invalid slots.
                    .ToList();

                var allSlots = Enumerable.Range(1, maxSlots).ToList();
                var availableSlots = allSlots.Except(bookedSlots).ToList();

                result.Add(new RoomAvailabilityDto
                {
                    TypeSlot = typeSlot,
                    RoomNo = room.RoomNumber,
                    Capacity = room.Capacity,
                    Slot = string.Join(", ", availableSlots),
                    TotalSlot = availableSlots.Count,
                    Date = date.ToString("dd/MM/yyyy")
                });
            }

            return result.AsEnumerable();
        }
        public async Task<IEnumerable<BookingHistoryDto>> GetBookingHistoryAsync(DateTime startDate, DateTime endDate)
        {
            var bookings = await _context.SubBookings
                .Include(sb => sb.Booking.Room)
                .Include(sb => sb.Booking)
                .ThenInclude(b => b.Lecturer)
                .Include(sb => sb.Booking)
                .ThenInclude(b => b.Description)
                .Where(sb => sb.Date.Date >= startDate.Date && sb.Date.Date <= endDate.Date)
                .ToListAsync();

            var result = bookings.Select(booking =>
            {
                // Tính toán Slot
                int slot = CalculateSlot(booking.StartTime, booking.EndTime, booking.TypeSlot);

                // Xử lý Note từ Booking.Description.Name
                string note = "Không có mô tả";
                if (booking.Booking != null && booking.Booking.Description != null)
                {
                    note = booking.Booking.Description.Name ?? "Không có mô tả";
                }

                // Xử lý Slot và TimeRange
                string slotDisplay = slot == -1 ? "Out Slot" : slot.ToString();
                string timeRange = slot == -1
                    ? $"{booking.StartTime:hh\\:mm} - {booking.EndTime:hh\\:mm}"
                    : null; // Chỉ hiển thị TimeRange nếu Slot = -1

                return new
                {
                    Dto = new BookingHistoryDto
                    {
                        Booker = booking.Booking?.Lecturer?.AccountName ?? "Unknown",
                        RoomNo = booking.Booking.Room?.RoomNumber ?? "Unknown",
                        Date = booking.Date.ToString("dd/MM/yyyy"),
                        Note = note,
                        Slot = slotDisplay,
                        TimeRange = timeRange
                    },
                    SortKey = slot == -1 ? booking.StartTime.ToTimeSpan() : TimeSpan.FromHours(slot) // Sử dụng để sắp xếp
                };
            })
            .OrderBy(x => x.Dto.Date)
            .ThenBy(x => x.SortKey)
            .Select(x => x.Dto);

            return result;
        }
        public async Task<IEnumerable<UpcomingBookingDto>> GetUpcomingBookingsAsync(int limit = 7)
        {
            var currentDate = DateTime.Now.Date;

            var upcomingBookings = await _context.SubBookings
                .Include(sb => sb.Booking.Room)
                .Include(b => b.Booking.Description)
                .Include(sb => sb.Booking)
                .ThenInclude(b => b.Lecturer)
                .Include(sb => sb.Class)
                .Where(sb => sb.Date.Date >= currentDate && sb.Approve == 10) // Thêm điều kiện Approve = 10
                .OrderBy(sb => sb.Date)
                .ThenBy(sb => sb.StartTime)
                .Take(limit) // Giới hạn số lượng (mặc định 7)
                .ToListAsync();

            var result = upcomingBookings.Select(booking =>
            {
                // Xử lý Note
                string note = "Nothing";
                if (booking.Booking != null && booking.Booking.Description != null)
                {
                    note = booking.Booking.Description.Name ?? "Nothing";
                }
                if (booking.ClassId != null && booking.Class != null)
                {
                    note = $"{booking.Class.Name}_{booking.Class.SubjectCode}";
                }

                return new UpcomingBookingDto
                {
                    Booker = booking.Booking?.Lecturer?.AccountName ?? "Unknown",
                    RoomNo = booking.Booking.Room?.RoomNumber ?? "Unknown",
                    Note = note,
                    Date = booking.Date.ToString("dd/MM/yyyy"),
                    Status = booking.Approve,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                };
            });

            return result;
        }

        public async Task ChangeStatusAuto()
        {
            var allBooking = await _context.Bookings.Include(b => b.SubBookings).Where(b => b.Type == 0 && b.State == 5 && b.SubBookings.All(sb => sb.Approve == 12)).ToListAsync();

            foreach (var booking in allBooking)
            {
                booking.State = 7;
            }

            await _context.SaveChangesAsync();
        }
    }
}
