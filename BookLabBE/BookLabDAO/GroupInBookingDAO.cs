using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Microsoft.SqlServer.Server;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO;

namespace BookLabDAO
{
    public class GroupInBookingDAO : SingletonBase<GroupInBookingDAO>
    {
        public async Task<IEnumerable<GroupInBooking>> GetAllGroupInBookings()
        {
            return await _context.GroupInBookings.Where(gib => gib.IsDeleted == false).ToListAsync();
            /*return await _context.GroupInBookings.Include(c => c.Group).Include(c => c.Booking).Include(c => c.Slot).ToListAsync();*/
        }
        public async Task<IEnumerable<AttendanceRequestGetDto>> GetAllGroupInBookingsById(Guid bookingId)
        {
            return await _context.SubBookings
                .AsNoTracking()
                .Where(b => b.Id == bookingId)
                .SelectMany(b => b.GroupInBookings.Where(gib => gib.IsDeleted == false).Select(g => new { GroupInBooking = g, Group = g.Group }))
                .SelectMany(x => x.Group.StudentInGroups.Where(sig => sig.IsDeleted == false).Select(sig => new 
                {
                    x.GroupInBooking,
                    StudentInGroup = sig,
                    Student = sig.Student,
                    AccountDetail = sig.Student.AccountDetail,
                    Status = sig.StudentInBookings
                        .Where(sib =>sib.IsDeleted == false && sib.GroupInBookingId == x.GroupInBooking.Id)
                        .Select(sib => sib.Status)
                        .FirstOrDefault()
                }))
                .Select(x => new AttendanceRequestGetDto
                {
                    groupInBookingId = x.GroupInBooking.Id,
                    studentInGroupId = x.StudentInGroup.Id,
                    FullName = x.AccountDetail.FullName,
                    Avatar = x.AccountDetail.Avatar, 
                    StudentId = x.AccountDetail.StudentId,
                    Status = x.Status,
                    Dob = x.AccountDetail.DOB,
                    TelPhone = x.AccountDetail.Telphone
                })
                .ToListAsync();
        }
        public async Task AddGroupInBooking(GroupInBooking groupInBookings)
        {
            await _context.GroupInBookings.AddAsync(groupInBookings);
            await _context.SaveChangesAsync();
        }

        public async Task<GroupInBooking> GetGroupInBookingsById(Guid id)
        {
            var groupInBookings = await _context.GroupInBookings.FirstOrDefaultAsync(c =>c.IsDeleted == false && c.Id == id);
            if (groupInBookings == null) return null;

            return groupInBookings;
        }

        public async Task UpdateGroupInBooking(GroupInBooking groupInBookings)
        {
            var existingItem = await GetGroupInBookingsById(groupInBookings.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(groupInBookings);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteGroupInBooking(Guid id)
        {
            var groupInBookings = await GetGroupInBookingsById(id);

            if (groupInBookings != null)
            {
                groupInBookings.IsDeleted = true;
                groupInBookings.RemovedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }
        // public async Task<bool> ChangeStatus(Guid id)
        // {
        //     var groupInBookings = await GetGroupInBookingsById(id);
        //     groupInBookings.Status = !groupInBookings.Status;
        //     _context.SaveChanges();
        //     return groupInBookings.Status;
        // }
        //
        // public async Task<IEnumerable<GroupInBooking>> GetAllGroupInBookingsByBookingId(Guid id)
        // {
        //     var groupInBookings = await _context.GroupInBookings.Where(c => c.BookingId == id).Include(gip => gip.Slot).ToListAsync();
        //     if (groupInBookings == null) return null;
        //
        //     return groupInBookings;
        // }

        public async Task<int> CountStudentInGroup(Guid id)
        {
            int count = await _context.StudentInGroups.CountAsync(student =>student.IsDeleted == false && student.GroupId == id);
            return count;
        }

        // public async Task<Object> CustomDataForSlot(IEnumerable<Booking> bookings, string dateString)
        // {
        //     string format = "yyyy-MM-dd";
        //     DateTime date;
        //     try
        //     {
        //         date = DateTime.ParseExact(dateString, format, System.Globalization.CultureInfo.InvariantCulture);
        //     }
        //     catch (FormatException)
        //     {
        //         return null;
        //     }
        //
        //     int month = date.Month;
        //     int year = date.Year;
        //
        //     Dictionary<string, int[]> daysObject = new Dictionary<string, int[]>();
        //
        //     int daysInMonth = DateTime.DaysInMonth(year, month);
        //
        //     for (int day = 1; day <= daysInMonth; day++)
        //     {
        //         string key = $"{year}-{month:D2}-{day:D2}";
        //         daysObject[key] = new int[4] { 0, 0, 0, 0 };
        //     }
        //
        //     foreach (Booking booking in bookings)
        //     {
        //         var groupInBookings = await GetAllGroupInBookingsByBookingId(booking.Id);
        //         foreach (var group in groupInBookings)
        //         {
        //             if (group.DateTimeInBooking.Month == month)
        //             {
        //                 string dateBook = group.DateTimeInBooking.ToString(format);
        //                 string name = group.Slot.Name;
        //                 int slot = int.Parse(name[name.Length - 1].ToString());
        //                 int count = await CountStudentInGroup(group.GroupId);
        //                 daysObject[dateBook][slot - 1] += count;
        //             }
        //         }
        //
        //     }
        //
        //     return daysObject;
        // }

        public async Task<IEnumerable<GroupInBookingCompreDto>> GetGroupInBookingsByGroupId(Guid id)
        {

            var groupInBookings = await _context.GroupInBookings.Where(gib => gib.IsDeleted == false && gib.GroupId == id).Include(gib => gib.StudentInBookings).Include(gib => gib.Booking).ThenInclude(subbooking => subbooking.Booking).ThenInclude(booking => booking.Room).ToListAsync();
            var result = groupInBookings.Select(gib => new GroupInBookingCompreDto
            {
                GroupId = gib.GroupId,
                GroupInSubBookingId = gib.Id,
                Date = gib.Booking.Date,
                StartTime = gib.Booking.StartTime,
                EndTime = gib.Booking.EndTime,
                Approve = gib.Booking.Approve,
                RoomId = Guid.Parse(gib.Booking.Booking.RoomId.ToString()),
                RoomName = gib.Booking.Booking.Room.Name,
                SubBookingId = gib.SubBookingId,
                StudentInGroupIds = gib.StudentInBookings.Where(sib => sib.IsDeleted == false).Select(sib => sib.StudentInGroupId).ToList()

            });
            return result;
        }
        //         public async Task<IEnumerable<GroupInBooking>> GetAllGroupInBookings()
        //         {
        //             return await _context.GroupInBookings.ToListAsync();
        //             /*return await _context.GroupInBookings.Include(c => c.Group).Include(c => c.Booking).Include(c => c.Slot).ToListAsync();*/
        //         }
        //         public async Task<IEnumerable<AttendanceRequestGetDto>> GetAllGroupInBookingsById(Guid bookingId)
        //         {
        //             var attendanceRequests = await _context.Bookings
        //                 .Where(b => b.Id == bookingId)
        //                 .SelectMany(b => b.GroupInBookings)
        //                 .SelectMany(g => g.Group.StudentInGroups
        //                     .Select(s => new AttendanceRequestGetDto
        //                     {
        //                         groupInBookingId = g.Id,
        //                         studentInGroupId = s.Id,
        //                         FullName = s.Student.AccountDetail.FullName,
        //                         Avatar = s.Student.AccountDetail.Avatar,
        //                         StudentId = s.Student.AccountDetail.StudentId,
        //                         Status = s.StudentInBookings
        //                             .Where(sb => sb.GroupInBookingId == g.Id)
        //                             .Select(sb => sb.Status)
        //                             .FirstOrDefault(),
        //                         Dob = s.Student.AccountDetail.DOB,
        //                         TelPhone = s.Student.AccountDetail.Telphone
        //                     }))
        //                 .ToListAsync();
        //
        //             return attendanceRequests;
        //         }

        //
        //         public async Task<GroupInBooking> GetGroupInBookingsById(Guid id)
        //         {
        //             var groupInBookings = await _context.GroupInBookings.FirstOrDefaultAsync(c => c.Id == id);
        //             if (groupInBookings == null) return null;
        //
        //             return groupInBookings;
        //         }
        //
        //         public async Task UpdateGroupInBooking(GroupInBooking groupInBookings)
        //         {
        //             var existingItem = await GetGroupInBookingsById(groupInBookings.Id);
        //             if (existingItem == null) return;
        //             _context.Entry(existingItem).CurrentValues.SetValues(groupInBookings);
        //             await _context.SaveChangesAsync();
        //         }
        //         public async Task DeleteGroupInBooking(Guid id)
        //         {
        //             var groupInBookings = await GetGroupInBookingsById(id);
        //
        //             if (groupInBookings != null)
        //             {
        //                 _context.GroupInBookings.Remove(groupInBookings);
        //                 await _context.SaveChangesAsync();
        //             }
        //         }
        //         public async Task<bool> ChangeStatus(Guid id)
        //         {
        //             var groupInBookings = await GetGroupInBookingsById(id);
        //             groupInBookings.Status = !groupInBookings.Status;
        //             _context.SaveChanges();
        //             return groupInBookings.Status;
        //         }
        //
        //         public async Task<IEnumerable<GroupInBooking>> GetAllGroupInBookingsByBookingId(Guid id)
        //         {
        //             var groupInBookings = await _context.GroupInBookings.Where(c => c.BookingId == id).Include(gip => gip.Slot).ToListAsync();
        //             if (groupInBookings == null) return null;
        //
        //             return groupInBookings;
        //         }
        //
        //         public async Task<int> CountStudentInGroup(Guid id)
        //         {
        //             int count = await _context.StudentInGroups.CountAsync(student => student.GroupId == id);
        //             return count;
        //         }
        //
        //         public async Task<Object> CustomDataForSlot(IEnumerable<Booking> bookings, string dateString)
        //         {
        //             string format = "yyyy-MM-dd";
        //             DateTime date;
        //             try
        //             {
        //                 date = DateTime.ParseExact(dateString, format, System.Globalization.CultureInfo.InvariantCulture);
        //             }
        //             catch (FormatException)
        //             {
        //                 return null;
        //             }
        //
        //             int month = date.Month;
        //             int year = date.Year;
        //
        //             Dictionary<string, int[]> daysObject = new Dictionary<string, int[]>();
        //
        //             int daysInMonth = DateTime.DaysInMonth(year, month);
        //
        //             for (int day = 1; day <= daysInMonth; day++)
        //             {
        //                 string key = $"{year}-{month:D2}-{day:D2}";
        //                 daysObject[key] = new int[4] { 0, 0, 0, 0 };
        //             }
        //
        //             foreach (Booking booking in bookings)
        //             {
        //                 var groupInBookings = await GetAllGroupInBookingsByBookingId(booking.Id);
        //                 foreach (var group in groupInBookings)
        //                 {
        //                     if (group.DateTimeInBooking.Month == month)
        //                     {
        //                         string dateBook = group.DateTimeInBooking.ToString(format);
        //                         string name = group.Slot.Name;
        //                         int slot = int.Parse(name[name.Length - 1].ToString());
        //                         int count = await CountStudentInGroup(group.GroupId);
        //                         daysObject[dateBook][slot - 1] += count;
        //                     }
        //                 }
        //
        //             }
        //
        //             return daysObject;
        //         }
        //
        //         public async Task<IEnumerable<GroupInBooking>> GetGroupInBookingsByGroupId(Guid id)
        //         {
        //             var groupInBookings = await _context.GroupInBookings.Where(gib => gib.GroupId == id).Include(gib => gib.Slot).Include(gib => gib.Booking.Room).ToListAsync();
        //             if (groupInBookings == null) return null;
        //
        //             return groupInBookings;
        //         }

        public async Task<IEnumerable<GroupInBooking>> GetGroupInBookingsBySubBookingId(Guid subBookingId)
        {
            var groupInBookings = await _context.GroupInBookings.Where(gip =>gip.IsDeleted == false && gip.SubBookingId.Equals(subBookingId)).ToListAsync();
            if(groupInBookings == null)
            {
                return null;
            }
            return groupInBookings;
        }

        public async Task DeleteAllGroupInBooking(Guid subBookingId)
        {
            var groupInBookings = await _context.GroupInBookings.Where(gib =>gib.IsDeleted == false && gib.SubBookingId == subBookingId).ToListAsync();

            if (groupInBookings != null)
            {
                foreach(var groupInBooking in groupInBookings)
                {
                    groupInBooking.IsDeleted = true;
                    groupInBooking.RemovedAt = DateTime.Now;
					await _context.SaveChangesAsync();
				}
                
            }

        }
    }
}
