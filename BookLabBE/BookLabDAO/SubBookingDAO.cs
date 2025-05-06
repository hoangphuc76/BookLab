using BookLabDTO;
using BookLabModel.Model;
using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class SubBookingDAO : SingletonBase<SubBookingDAO>
    {
        public async Task AddSubBooking(SubBooking subBooking)
        {
            await _context.SubBookings.AddAsync(subBooking);
            await _context.SaveChangesAsync();
        }

        public async Task AddSubBookingWithCache(SubBooking subBooking)
        {
            _context.Attach(subBooking.Booking); // đảm bảo EF biết nó đã tồn tại
            await _context.SubBookings.AddAsync(subBooking);
            await _context.SaveChangesAsync();

            var cacheSubBookings = _memoryCache.Get<List<SubBooking>>(Common.SuccessfulSubBookings);
            if (cacheSubBookings != null)
            {
                cacheSubBookings.Add(subBooking);
                _memoryCache.Set(Common.SuccessfulSubBookings, cacheSubBookings, TimeSpan.FromMinutes(1));
            }
        }

        public async Task<bool> LecturerFree(IEnumerable<Booking> listBookings, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var listBookingsId = listBookings.Select(x => x.Id).ToList();
            return !await _context.SubBookings.AnyAsync(sb =>
                sb.BookingId != null &&
                listBookingsId.Contains(sb.BookingId.Value) &&
                sb.Approve != 11 && sb.Approve != 12 &&
                sb.Date == date &&
                !(sb.EndTime <= startTime || sb.StartTime >= endTime));
        }

        public async Task<bool> LecturerFree(Guid[] listBookingsId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return !await _context.SubBookings.AnyAsync(sb =>
                sb.BookingId != null &&
                listBookingsId.Contains(sb.BookingId.Value) &&
                sb.Approve != 11 && sb.Approve != 12 &&
                sb.Date == date &&
                !(sb.EndTime <= startTime || sb.StartTime >= endTime));
        }

        public async Task<bool> LecturerFreeFromCache(Guid[] listBookingsId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var allSubBookings = await CacheHelper.GetSuccessfulSubBookingsFromCache();

            return !allSubBookings.Any(sb =>
                sb.BookingId != null &&
                listBookingsId.Contains(sb.BookingId.Value) &&
                sb.Approve != 11 && sb.Approve != 12 &&
                sb.Date == date &&
                !(sb.EndTime <= startTime || sb.StartTime >= endTime));
        }

        public async Task<SubBooking> GetSubBookingById(Guid id)
        {
            return await _context.SubBookings.Include(sb => sb.Booking).FirstOrDefaultAsync(sb => sb.Id.Equals(id));
        }

        public async Task UpdateSubBooking(Guid id, int status, string reason, Guid userId)
        {

            // Cập nhật các trường cần thiết mà không cần phải tải đối tượng vào bộ nhớ
            await _context.SubBookings
                .Where(sb => sb.Id == id)  // Điều kiện xác định bản ghi cần cập nhật
                .ExecuteUpdateAsync(upd => upd
                        .SetProperty(sb => sb.Approve, status) // Cập nhật Property1
                        .SetProperty(sb => sb.Reason, reason)  // Thêm các trường khác nếu cần
                        .SetProperty(sb => sb.UpdatedAt, DateTime.Now)
                        .SetProperty(sb => sb.UpdatedBy, userId)
                );
        }

        public async Task<IEnumerable<SubBooking>> GetAllSubBookings()
        {
            return await _context.SubBookings
                .AsNoTracking()
                .Include(sb => sb.Booking)
                .ThenInclude(b => b.Room)
                .Include(sb => sb.Booking)
                .ThenInclude(b => b.Lecturer)
                .ThenInclude(a => a.AccountDetail)
                .ToListAsync();
        }

        public async Task BulkInsertSubBookings(IEnumerable<SubBooking> subBookings)
        {
            if (subBookings == null || !subBookings.Any())
                return;

            await _context.BulkInsertAsync(subBookings);
        }

        public async Task<bool> checkAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, Room room, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var typeOfRoom = room.OnlyGroupStatus;
            var studentCapacity = await _context.StudentInGroups.Where(sig => !sig.IsDeleted.Value && groupIds != null && sig.GroupId != null &&  groupIds.Contains(sig.GroupId.Value)).CountAsync();
            var capacity = typeOfRoom ? room.GroupSize : room.Capacity;
            var subBookingData = await _context.SubBookings
                 .Where(sb => bookingIds != null && sb.BookingId != null && bookingIds.Contains(sb.BookingId.Value) && sb.Approve == 10 &&
                              sb.Date.Equals(date) && !(sb.EndTime <= startTime || sb.StartTime >= endTime))
                 .Select(sb => new
                 {
                     sb.Id,
                     GroupInBookingIds = _context.GroupInBookings
                         .Where(gip => gip.SubBookingId == sb.Id && !gip.IsDeleted.Value)
                         .Select(gip => gip.Id)
                         .ToList()
                 })
                 .ToListAsync();

            var groupInBookingIds = subBookingData.SelectMany(x => x.GroupInBookingIds).ToList();
            var capacityUse = typeOfRoom ? groupInBookingIds.Count : await _context.StudentInBookings.Where(sip => !sip.IsDeleted.Value && groupInBookingIds.Contains(sip.GroupInBookingId)).CountAsync();
            if (typeOfRoom)
            {
                return capacity - capacityUse >= groupIds.Length;
            }else
            {
                return capacity - capacityUse - subBookingData.Count >= studentCapacity + 1;
            }
        }

        public async Task<bool> checkAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, RoomBookingDTO room, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var typeOfRoom = room.OnlyGroupStatus;
            var studentInGroups = await CacheHelper.GetActiveStudentInGroupsFromCache();
            var studentCapacity = studentInGroups.Count(sig =>
                sig.GroupId != null && groupIds.Contains(sig.GroupId.Value));
            var capacity = typeOfRoom ? room.GroupSize : room.Capacity;
            var allSubBookings = await CacheHelper.GetSuccessfulSubBookingsFromCache();
            var allGroupInBookings = await CacheHelper.GetActiveGroupInBookingsFromCache();
            var subBookingData = allSubBookings.Where(sb => bookingIds != null && sb.BookingId != null && bookingIds.Contains(sb.BookingId.Value) && sb.Approve == 10 &&
                              sb.Date.Equals(date) && !(sb.EndTime <= startTime || sb.StartTime >= endTime))
                 .Select(sb => new
                 {
                     sb.Id,
                     GroupInBookingIds = allGroupInBookings
                         .Where(gip => gip.SubBookingId == sb.Id && !gip.IsDeleted.Value)
                         .Select(gip => gip.Id)
                         .ToList()
                 })
                 .ToList();

            var groupInBookingIds = subBookingData.SelectMany(x => x.GroupInBookingIds).ToList();
            var studentInBookings = await CacheHelper.GetActiveStudentInBookingsFromCache();
            var capacityUse = typeOfRoom ? groupInBookingIds.Count : studentInBookings.Count(sib => groupInBookingIds.Contains(sib.GroupInBookingId));
            if (typeOfRoom)
            {
                return capacity - capacityUse >= groupIds.Length;
            }
            else
            {
                return capacity - capacityUse - subBookingData.Count >= studentCapacity + 1;
            }
        }

        public async Task<bool> checkPerfectAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, Guid[] studentIds , Room room, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            var typeOfRoom = room.OnlyGroupStatus;
            var capacity = typeOfRoom ? room.GroupSize : room.Capacity;
            var subBookingIds = await _context.SubBookings.Where(sb => bookingIds != null && sb.BookingId != null && bookingIds.Contains(sb.BookingId.Value) && sb.Approve == 10 &&
                    sb.Date.Equals(date) && !(sb.EndTime <= startTime || sb.StartTime >= endTime)).Select(sb => sb.Id).ToArrayAsync();
            var groupInBookingIds = await _context.GroupInBookings.Where(gip => gip.IsDeleted == false && subBookingIds.Contains(gip.SubBookingId)).Select(gip => gip.Id).ToArrayAsync();
            var capacityUse = typeOfRoom ? groupInBookingIds.Length : await _context.StudentInBookings.Where(sip => sip.IsDeleted == false && groupInBookingIds.Contains(sip.GroupInBookingId)).CountAsync();
            if (typeOfRoom)
            {
                return capacity - capacityUse >= groupIds.Length;
            }
            else
            {
                return capacity - capacityUse >= studentIds.Length + 1;
            }
        }

        public async Task<SubBooking> GetSubBookingLatestByLectureId(Guid id, Guid roomId)
        {
            var bookingIds = await _context.Bookings.Where(b => b.State == 5 && b.Type != 6 && b.LectureId.Equals(id) && b.RoomId.Equals(roomId)).Select(b => b.Id).ToArrayAsync();
            var subBooking = await _context.SubBookings.Where(sb => sb.BookingId != null && bookingIds.Contains(sb.BookingId.Value) && sb.Approve == 10)
                            .OrderByDescending(sb => sb.Date).ThenByDescending(s => s.EndTime).FirstAsync();
            if(subBooking == null)
            {
                return null;
            }

            return subBooking;
        }

        public async Task ChangeStatusAuto()
        {
            DateTime today = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0);

            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE SubBookings SET Approve = 12 WHERE Approve = 10 AND Date < {0}", today);
        }
    }
}
