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
            DateTime? date,
            TimeOnly? startTime,
            TimeOnly? endTime,
            int? capacity,
            int? groupSize,
            Guid? categoryRoomId,
            string? sortOrder = "asc",
            int pageNumber = 1,
            int pageSize = 10
        );
        Task<IEnumerable<RoomAllDTO>> GetAllRooms();

        Task<RoomDetailDTO> GetRoomDetailById(Guid id);

        Task<Room> GetRoomsById(Guid id);

        Task AddRoom(Room rooms);

        Task UpdateRoom(Room rooms);

        Task DeleteRoom(Guid id);

        // Task<bool> ChangeStatus(Guid id);
        Task<Guid> GetRoomIdByRoomNo(string roomNo);
        
        Task<bool> ChangeRoomStatus(Guid id, int status);

        Task ProcessPendingRoomStatusChanges();

        Task<bool> ChangeRoomStatusTemporarily(Guid roomId, int newStatus, DateTime startDate, DateTime endDate);
    }
}
