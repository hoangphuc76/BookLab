using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO;

namespace BookLabRepositories
{
    public interface IRoomRepository
    {
        Task<PaginatedResult<RoomDTO>> GetAvailableRoom(Guid buildingId,
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
        );
        Task<IEnumerable<Room>> GetAllRooms();

        Task<Room> GetRoomsById(Guid id);

        Task AddRoom(Room rooms);

        Task UpdateRoom(Room rooms);

        Task DeleteRoom(Guid id);

        // Task<bool> ChangeStatus(Guid id);
        Task<Guid> GetRoomIdByRoomNo(string roomNo);
    }
}
