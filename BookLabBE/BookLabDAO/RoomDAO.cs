using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO;

namespace BookLabDAO
{
    public class RoomDAO : SingletonBase<RoomDAO>
    {
        public async Task<IEnumerable<RoomAllDTO>> GetAllRooms()
        {
            return await _context.Rooms
                .AsNoTracking()
                .Select(r => new RoomAllDTO()
                {
                    Id = r.Id,
                    Name = r.Name,
                    RoomNumber = r.RoomNumber,
                    Avatar = r.Avatar,
                    Rating = r.Rating,
                    Capacity = r.Capacity,
                    GroupSize = r.GroupSize,
                    TypeSlot = r.TypeSlot,
                    OnlyGroupStatus = r.OnlyGroupStatus,
                    RoomStatus = r.RoomStatus,
                    ManagerId = r.ManagerId,
                    CategoryRoomId = r.CategoryRoomId,
                    BuildingId = r.BuildingId,
                })
                .ToListAsync();
        }
        public async Task<Room> GetRoomsById(Guid id)
        {
            var rooms = await _context.Rooms.Include(c => c.Manager).Include(c => c.Manager.AccountDetail).Include(c => c.CategoryRoom).Include(c => c.Building)
                .Include(c => c.Building.Campus).FirstOrDefaultAsync(c => c.Id == id);
            if (rooms == null) return null;

            return rooms;
        }
        
        public async Task<RoomDetailDTO> GetRoomDetailById(Guid id)
        {
            var rooms = await _context.Rooms.Where(r => r.Id == id).Select(r => new RoomDetailDTO()
                {
                    Id = r.Id,
                    Name = r.Name,
                    CategoryName = r.CategoryRoom.Name,
                    CampusName = r.Building.Campus.Name,
                    ManagerAvatar = r.Manager.AccountDetail.Avatar,
                    ManagerName = r.Manager.AccountDetail.FullName,
                    Rating = r.Rating,
                    Capacity = r.Capacity,
                    GroupSize = r.GroupSize,
                    OnlyGroupStatus = r.OnlyGroupStatus,
                }
            ).FirstOrDefaultAsync();
               
            if (rooms == null) return null;

            return rooms;
        }
        public async Task<PaginatedResult<RoomDTO>> GetAvailableRoom(Guid buildingId,
                                                                         DateTime? date,
                                                                         TimeOnly? startTime,
                                                                         TimeOnly? endTime,
                                                                         int? capacity,
                                                                         int? groupSize,
                                                                         Guid? categoryRoomId,
                                                                         string? sortOrder = "asc",
                                                                         int pageNumber = 1,
                                                                         int pageSize = 10
                                                                         )
        {

            var query = _context.Rooms
                .AsNoTracking()
                .Where(r => r.BuildingId == buildingId && r.IsDeleted == false);
            
            var conflictRoom = new List<Guid>();

            if (date.HasValue)
            {
                query = query.Where(r => r.Bookings.Any(b => b.SubBookings.Any(sb =>
                    (sb.Date.Date == date) &&
                    (
                        (startTime.HasValue && sb.StartTime < endTime) || // Nếu có startTime, kiểm tra khoảng thời gian
                        (endTime.HasValue && sb.EndTime > startTime) // Nếu có endTime, kiểm tra khoảng thời gian
                    )
                )));
                conflictRoom = query
                    .Select(r => new
                    {
                        Room = r,
                        CapacityCount = r.Capacity - r.Bookings.SelectMany(sb => sb.SubBookings.Where(sb =>
                                (sb.Date.Date == date) &&
                                (
                                    (startTime.HasValue && sb.StartTime < endTime) || // Nếu có startTime, kiểm tra khoảng thời gian
                                    (endTime.HasValue && sb.EndTime > startTime) // Nếu có endTime, kiểm tra khoảng thời gian
                                )))
                            .SelectMany(gb => gb.GroupInBookings).Count(),
                        GroupCount = r.GroupSize -  r.Bookings.SelectMany(sb => sb.SubBookings.Where(sb =>
                                (sb.Date.Date == date) &&
                                (
                                    (startTime.HasValue && sb.StartTime < endTime) || // Nếu có startTime, kiểm tra khoảng thời gian
                                    (endTime.HasValue && sb.EndTime > startTime) // Nếu có endTime, kiểm tra khoảng thời gian
                                )))
                            .SelectMany(gb => gb.GroupInBookings)
                            .SelectMany(s => s.StudentInBookings)
                            .Count(),
                    })
                    .Where(x => x.CapacityCount < capacity || x.GroupCount < groupSize)
                    .Select(x => x.Room.Id).ToList();
            }

            

            var resultQuery = _context.Rooms.AsNoTracking()
                .Where(r => r.BuildingId == buildingId)
                .Where(r => !conflictRoom.Contains(r.Id));


            if (categoryRoomId.HasValue)
            {
                resultQuery = resultQuery.Where(c => c.CategoryRoomId == categoryRoomId);
            }

            if (capacity.HasValue || groupSize.HasValue)
            {
                resultQuery = resultQuery.Where(c => c.Capacity >= capacity || c.GroupSize >= groupSize);
            }

            var feedbacks = await _context.Feedbacks
                            .Where(f => f.Status == true)
                            .GroupBy(f => f.RoomId)
                            .Select(g => new { RoomId = g.Key, Count = g.Count() })
                            .ToDictionaryAsync(x => x.RoomId, x => x.Count);

            var result = resultQuery.Select(r => new RoomDTO()
            {
                Id = r.Id,
                Name = r.Name,
                ImageUrls = r.ImageRooms.Select(x => x.ImageURL).ToList(),
                Capacity = r.Capacity,
                Rating = r.Rating,
                CategoryRoom = r.CategoryRoom.Name,
                Status = r.RoomStatus,
                ReviewCount = feedbacks.ContainsKey(r.Id) ? feedbacks[r.Id] : 0
            });

            result = sortOrder.ToLower() == "desc"
                            ? result.OrderByDescending(r => r.Rating)
                            : result.OrderBy(r => r.Rating);
            var totalItems = await resultQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await result
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginatedResult<RoomDTO>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }
        public async Task AddRoom(Room rooms)
        {
            await _context.Rooms.AddAsync(rooms);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateRoom(Room rooms)
        {
            var existingItem = await GetRoomsById(rooms.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(rooms);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteRoom(Guid id)
        {
            var rooms = await GetRoomsById(id);

            if (rooms != null)
            {
                _context.Rooms.Remove(rooms);
                await _context.SaveChangesAsync();
            }
        }
        // public async Task<bool> ChangeStatus(Guid id)
        // {
        //     var rooms = await GetRoomsById(id);
        //     rooms.Status = !rooms.Status;
        //     _context.SaveChanges();
        //     return rooms.Status;
        // }

        public async Task<Guid> GetRoomIdByRoomNo(string roomNo)
        {
            var roomId = await _context.Rooms.Where(r => r.RoomNumber == roomNo)
                                    .Select(r => r.Id).FirstOrDefaultAsync();
            if (roomId == Guid.Empty) return Guid.Empty;
            return roomId;
        }

        public async Task<bool> ChangeRoomStatus(Guid id, int status)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return false;

            room.RoomStatus = status;
            _context.Entry(room).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeRoomStatusTemporarily(Guid roomId, int newStatus, DateTime startDate, DateTime endDate)
        {
            // Validate input
            if (startDate >= endDate)
                throw new Exception("Start date must be before end date.");

            if (startDate < DateTime.Now)
                throw new Exception("Start date not be in the past.");

            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null)
                return false;

            // Store original status
            int originalStatus = room.RoomStatus;

            // Create a temporary status record
            var tempStatus = new TemporaryRoomStatus
            {
                Id = Guid.NewGuid(),
                RoomId = roomId,
                TemporaryStatus = newStatus,
                OriginalStatus = originalStatus,
                StartDate = startDate,
                EndDate = endDate,
            };

            // If start date is now or in the past, apply status immediately
            if (startDate <= DateTime.Now)
            {
                room.RoomStatus = newStatus;
                _context.Entry(room).State = EntityState.Modified;

                var subBookings = await _context.Bookings.Where(b => b.RoomId == roomId && b.IsDeleted == false)
                    .SelectMany(b => b.SubBookings.Where(sb => sb.IsDeleted == false && sb.Approve != 11 && sb.Date.Date == DateTime.Now.Date &&
                        (sb.StartTime <= TimeOnly.FromTimeSpan(DateTime.Now.TimeOfDay) || sb.EndTime >=  TimeOnly.FromTimeSpan(DateTime.Now.TimeOfDay))))
                    .ToListAsync();

                foreach (var subBooking in subBookings)
                {
                    // Cập nhật trạng thái - áp dụng trạng thái mới của phòng
                    subBooking.Approve = newStatus;
                    _context.Entry(subBooking).State = EntityState.Modified;
                }
            }

            // Save the temporary status record
            await _context.TemporaryRoomStatus.AddAsync(tempStatus);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task ProcessPendingRoomStatusChanges()
        {
            var now = DateTime.Now;

            // Lấy tất cả các thay đổi trạng thái cần xử lý trong một lần truy vấn (và include Room luôn)
            var allStatusChanges = await _context.TemporaryRoomStatus
                .Where(trs => trs.IsDeleted == false &&
                             ((trs.StartDate <= now && trs.EndDate > now) || // Đang hoạt động
                              (trs.EndDate <= now))) // Đã hết hạn
                .Include(trs => trs.Room) // Lấy luôn thông tin phòng để giảm query
                .ToListAsync();

            if (!allStatusChanges.Any())
                return;

            // Lấy danh sách các phòng cần xử lý
            var roomIds = allStatusChanges.Select(s => s.RoomId).Distinct().ToList();

            // Lấy các booking và sub-booking với một query tối ưu
            var bookingsWithSubBookings = await _context.Bookings
                .Where(b => roomIds.Contains((Guid)b.RoomId) && b.IsDeleted == false)
                .Select(b => new
                {
                    Booking = b,
                    SubBookings = b.SubBookings
                        .Where(sb => sb.IsDeleted == false && sb.Approve != 11 && sb.Date.Date == now.Date &&
                                    (sb.StartTime <= TimeOnly.FromTimeSpan(now.TimeOfDay) ||
                                     sb.EndTime >= TimeOnly.FromTimeSpan(now.TimeOfDay)))
                        .ToList()
                })
                .ToListAsync();

            // Dictionary để truy cập nhanh các sub-bookings theo room ID
            var subBookingsByRoomId = bookingsWithSubBookings
                .GroupBy(b => b.Booking.RoomId)
                .ToDictionary(
                    g => g.Key,
                    g => g.SelectMany(b => b.SubBookings).ToList()
                );

            // Xử lý từng thay đổi trạng thái
            foreach (var status in allStatusChanges)
            {
                var room = status.Room;
                if (room == null) continue;

                if (status.EndDate <= now)
                {
                    // Trạng thái đã hết hạn - khôi phục về trạng thái ban đầu
                    room.RoomStatus = status.OriginalStatus;
                    status.IsDeleted = true;
                }
                else if (status.StartDate <= now && room.RoomStatus != status.TemporaryStatus)
                {
                    // Áp dụng trạng thái tạm thời
                    room.RoomStatus = status.TemporaryStatus;

                    // Cập nhật các sub-booking liên quan
                    if (subBookingsByRoomId.TryGetValue(status.RoomId, out var affectedSubs))
                    {
                        foreach (var subBooking in affectedSubs)
                        {
                            // Cập nhật trạng thái dựa trên loại thay đổi
                            subBooking.Approve = status.TemporaryStatus == 7 ? 7 :
                                                (status.TemporaryStatus == 8 ? 8 : subBooking.Approve);
                            _context.Entry(subBooking).State = EntityState.Modified;
                        }
                    }
                }

                // Đánh dấu các thay đổi
                _context.Entry(room).State = EntityState.Modified;
                _context.Entry(status).State = EntityState.Modified;
            }

            // Lưu tất cả thay đổi trong một giao dịch
            if (_context.ChangeTracker.HasChanges())
            {
                // Sử dụng SaveChangesAsync với CancellationToken nếu cần thiết
                await _context.SaveChangesAsync();
            }
        }

    }
}
