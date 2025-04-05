using BookLabDTO;
using BookLabModel;
using BookLabModel.Model;
using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using System;

namespace BookLabDAO
{
    public class BookingDAO : SingletonBase<BookingDAO>
    {
        public async Task<IEnumerable<BookingDto>> GetAllBookings(int pageNumber, int pageSize)
        {
            var bookingsData = await _context.SubBookings
                .Where(x =>x.IsDeleted == false && x.Approve == 0)
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
            var bookings = await _context.Bookings.Include(b => b.Room).Include(b => b.Room.Building).
                            Include(b => b.Room.Building.Campus).FirstOrDefaultAsync(c => c.Id == id);
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
        public async Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeek(DateTime StartTime, DateTime EndTime, Guid RoomId, Guid LectureId)
        {
            using (var context = new BookLabContext())
            {


                DateTime nowUtc7 = DateTime.UtcNow.AddHours(7);
                Console.WriteLine("Current Time in UTC+7:" + nowUtc7);
                if (StartTime < nowUtc7)
                {
                    StartTime = nowUtc7;

                }
                var subBookings = await context.SubBookings.Include(sb => sb.Booking).Include(sb => sb.GroupInBookings).ThenInclude(gib => gib.StudentInBookings).Where(sb => sb.Booking.RoomId == RoomId && sb.Date.Date >= StartTime.Date && sb.Date.Date <= EndTime.Date && (sb.Approve == 10 || (sb.Booking.LectureId == LectureId && sb.Approve == 0))).ToListAsync();
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
                    Reason = sb.Reason,
                    Type = sb.Booking.Type,
                    State = sb.Booking.State,
                    EndTime = sb.EndTime,
                    Date = sb.Date,
                    StudentQuantity = sb.ClassId == null ? (sb.GroupInBookings?.Sum(gib => gib.StudentInBookings?.Count ?? 0) ?? 0) : 0,
                    GroupQuantity = sb.GroupInBookings?.Count ?? 0,
                });



                return subBookingsDto;
            }
        }

        public async Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeekOfLecturer(DateTime StartTime, DateTime EndTime, Guid LectureId)
        {


            var subBookings = await _context.SubBookings.AsNoTracking().Include(sb => sb.Booking).Include(sb => sb.GroupInBookings).ThenInclude(gib => gib.StudentInBookings).Where(sb => sb.Booking.LectureId == LectureId && sb.IsDeleted == false && sb.Date.Date >= StartTime.Date && sb.Date.Date <= EndTime.Date).ToListAsync();
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
                StudentQuantity = sb.ClassId == null ? (sb.GroupInBookings?.Where(gib => gib.IsDeleted == false).Sum(gib => gib.StudentInBookings?.Count(sib => sib.IsDeleted == false) ?? 0) ?? 0) : 0,
                GroupQuantity = sb.GroupInBookings?.Count(gib => gib.IsDeleted == false) ?? 0,
            });



            return subBookingsDto;

        }

        public async Task<IEnumerable<Booking>> GetBookingSuccessful(Guid lecturerId)
        {
            var listBooking = await _context.Bookings.Where(b => b.LectureId.Equals(lecturerId) && b.State == 5).ToListAsync();
            if (listBooking == null)
            {
                return null;
            }
            return listBooking;
        }


        public async Task BulkInsertBookings(IEnumerable<Booking> bookings)
        {
            if (bookings == null || !bookings.Any())
                return;

            await _context.BulkInsertAsync(bookings);
        }
    
		public async Task<IEnumerable<CategoryDescription>> GetAllCategoryDescription()
        {
			var listCategoryDescription =  await _context.CategoryDescriptions.ToListAsync();
            return listCategoryDescription;
        }

        public async Task<bool> GetBookingByRoomId(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var bookings = await _context.Bookings
                .Where(b => b.RoomId == roomId)
                .SelectMany(b => b.SubBookings) // Lấy tất cả SubBookings
                .Where(s => s.Date == date && // Lọc theo ngày trước
                            (startTime < s.EndTime && endTime > s.StartTime)) // Điều kiện xung đột thời gian đầy đủ
                .ToListAsync();

            return bookings.Any();
        }

        public async Task<Guid[]> GetAllBookingsByRoom(Guid roomId)
        {
            var listBookings = await _context.Bookings.Where(b => b.RoomId.Equals(roomId) && b.State == 5).ToListAsync();
            if (listBookings == null)
            {
                return null;
            }
            return listBookings.Select(s => s.Id).ToArray();
        }

        public async Task<bool> CheckRoomAvaliable(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var listBookings = await _context.Bookings.Where(b => b.RoomId.Equals(roomId) && b.Type == 6).Select(s => s.Id).ToListAsync();
            var subBookings = await _context.SubBookings.Where(sb => sb.BookingId != null && listBookings.Contains(sb.BookingId.Value)
                             && sb.Date.Equals(date) && !(sb.EndTime <= startTime || sb.StartTime >= endTime)).ToListAsync();
            
            return !subBookings.Any();
        }

        public async Task<bool> CheckRoomNoPrivate(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var listBookings = await _context.Bookings.Where(b => b.RoomId.Equals(roomId) && b.Type == 5).Select(s => s.Id).ToListAsync();
            var subBookings = await _context.SubBookings.Where(sb => sb.BookingId != null && listBookings.Contains(sb.BookingId.Value) && sb.Private
                             && sb.Date.Equals(date) && !(sb.EndTime <= startTime || sb.StartTime >= endTime)).ToListAsync();

            return !subBookings.Any();
        }
	}
    
}
