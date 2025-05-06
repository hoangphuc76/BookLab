using BookLabModel;
using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public static class CacheHelper
    {
        private static readonly IMemoryCache _cache = SingletonBase<object>.MemoryCache;
        private static readonly BookLabContext _context = new BookLabContext();

        public static async Task<List<SubBooking>> GetSuccessfulSubBookingsFromCache()
        {
            if (!_cache.TryGetValue(Common.SuccessfulSubBookings, out List<SubBooking> subBookings))
            {
                subBookings = await (
                    from sb in _context.SubBookings
                    join b in _context.Bookings on sb.BookingId equals b.Id
                    where b.State == 5
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
                            RoomId = b.RoomId,
                            Type = b.Type,
                            State = b.State,
                            LectureId = b.LectureId
                        }
                    }
                ).ToListAsync();

                _cache.Set(Common.SuccessfulSubBookings, subBookings, TimeSpan.FromMinutes(1));
            }

            return subBookings;
        }

        public static async Task<IEnumerable<Booking>> GetSuccessfulBookingsFromCache()
        {
            if (!_cache.TryGetValue(Common.SuccessfulBookings, out IEnumerable<Booking> bookings))
            {
                bookings = await _context.Bookings
                    .Where(b => b.State == 5 && b.Type == 0)
                    .ToListAsync();

                _cache.Set(Common.SuccessfulBookings, bookings, TimeSpan.FromMinutes(1));
            }

            return bookings;
        }

        public static async Task<IEnumerable<StudentInGroup>> GetActiveStudentInGroupsFromCache()
        {
            if (!_cache.TryGetValue(Common.ActiveStudentInGroups, out IEnumerable<StudentInGroup> studentGroups))
            {
                studentGroups = await _context.StudentInGroups
                    .Where(s => s.IsDeleted == false && s.GroupId != null)
                    .ToListAsync();

                _cache.Set(Common.ActiveStudentInGroups, studentGroups, TimeSpan.FromMinutes(5));
            }

            return studentGroups;
        }

        public static async Task<IEnumerable<StudentInBooking>> GetActiveStudentInBookingsFromCache()
        {

            if (!_cache.TryGetValue(Common.ActiveStudentInBookings, out List<StudentInBooking> students))
            {
                students = await _context.StudentInBookings
                    .Where(sib => sib.IsDeleted == false)
                    .ToListAsync();

                _cache.Set(Common.ActiveStudentInBookings, students, TimeSpan.FromMinutes(1));
            }

            return students;
        }

        public static async Task<IEnumerable<GroupInBooking>> GetActiveGroupInBookingsFromCache()
        {
            if (!_cache.TryGetValue(Common.ActiveGroupInBookings, out IEnumerable<GroupInBooking> groupInBookings))
            {
                groupInBookings = await _context.GroupInBookings
                    .Where(gip => gip.IsDeleted == false && gip.SubBookingId != null)
                    .ToListAsync();

                _cache.Set(Common.ActiveGroupInBookings, groupInBookings, TimeSpan.FromMinutes(1));
            }

            return groupInBookings;
        }

        public static void Remove(string key)
        {
            _cache.Remove(key);
        }
    }
}
