using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO;

namespace BookLabDAO
{
    public class RoomDAO : SingletonBase<RoomDAO>
    {
        public async Task<IEnumerable<Room>> GetAllRooms()
        {
            /*return await _context.Rooms.ToListAsync();*/
            return await _context.Rooms.Include(c => c.Manager).Include(c => c.CategoryRoom).Include(c => c.Building).ToListAsync();
        }
        public async Task<Room> GetRoomsById(Guid id)
        {
            var rooms = await _context.Rooms.Include(c => c.Manager).Include(c => c.Manager.AccountDetail).Include(c => c.CategoryRoom).Include(c => c.Building)
                .Include(c => c.Building.Campus).FirstOrDefaultAsync(c => c.Id == id);
            if (rooms == null) return null;

            return rooms;
        }

        public async Task<PaginatedResult<RoomDTO>> GetAvailableRoom(Guid buildingId,
                                                                      DateTime? startDate,
                                                                      DateTime? endDate,
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
            startDate ??= DateTime.Now;
            endDate ??= DateTime.Now;
            capacity ??= 0;
            groupSize ??= 0;

            var query = _context.Rooms
                .AsNoTracking()
                .Where(r => r.BuildingId == buildingId && r.IsDeleted == false)
                .Where(r => r.Bookings.Any(b => b.SubBookings.Any(sb =>
                    (sb.Date >= startDate && sb.Date <= endDate) &&
                    (
                        (startTime.HasValue && sb.StartTime < endTime) || // Nếu có startTime, kiểm tra khoảng thời gian
                        (endTime.HasValue && sb.EndTime > startTime) // Nếu có endTime, kiểm tra khoảng thời gian
                    )
                )));
;             // var query = _context.Rooms
             //            .AsNoTracking()
             //            .Where(r => r.BuildingId == buildingId)
             //            .Where(r => !roomsWithConflicts.Contains(r.Id));    
            if (categoryRoomId.HasValue)
            {
                query = query.Where(c => c.CategoryRoomId == categoryRoomId);
            }


            var conflictRoom = query
                .Select(r => new
                {
                    Room = r,
                    CapacityCount = r.Bookings.SelectMany(sb => sb.SubBookings)
                        .SelectMany(gb => gb.GroupInBookings).Count(),
                    GroupCount = r.Bookings.SelectMany(sb => sb.SubBookings)
                        .SelectMany(gb => gb.GroupInBookings)
                        .SelectMany(s => s.StudentInBookings)
                        .Count(),
                })
                .Where(x => x.CapacityCount < capacity || x.GroupCount < groupSize)
                .Select(x => x.Room.Id).ToList();

            var resultQuery = _context.Rooms.AsNoTracking()
                .Where(r => r.BuildingId == buildingId)
                .Where(r => !conflictRoom.Contains(r.Id))
                .Select(r => new RoomDTO()
                {
                    Id = r.Id,
                    Name = r.Name,
                    ImageUrls = r.ImageRooms.Select(x => x.ImageURL).ToList(),
                    Capacity = r.Capacity,
                    Rating = r.Rating,
                    CategoryRoom = r.CategoryRoom.Name,
                    Status = r.RoomStatus
                });

            resultQuery = sortOrder.ToLower() == "desc"
                            ? resultQuery.OrderByDescending(r => r.Rating)
                            : resultQuery.OrderBy(r => r.Rating);
            var totalItems = await resultQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await resultQuery
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
    }
}
