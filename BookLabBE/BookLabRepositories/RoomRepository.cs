using BookLabDAO;
using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class RoomRepository : IRoomRepository
    {
        public async Task AddRoom(Room rooms)
        {
            await RoomDAO.Instance.AddRoom(rooms);
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
            return await RoomDAO.Instance.GetAvailableRoom(buildingId, date, startTime, endTime, capacity, groupSize, categoryRoomId, sortOrder, pageNumber, pageSize);
        }

        // public async Task<bool> ChangeStatus(Guid id)
        // {
        //     return await RoomDAO.Instance.ChangeStatus(id);
        // }
        
        public async Task<RoomDetailDTO> GetRoomDetailById(Guid id)
        {
            return await RoomDAO.Instance.GetRoomDetailById(id);
        }

        public async Task DeleteRoom(Guid id)
        {
            await RoomDAO.Instance.DeleteRoom(id);
        }

        public async Task<IEnumerable<RoomAllDTO>> GetAllRooms()
        {
            return await RoomDAO.Instance.GetAllRooms();
        }

        public async Task<Room> GetRoomsById(Guid id)
        {
            return await RoomDAO.Instance.GetRoomsById(id);
        }

        public async Task UpdateRoom(Room rooms)
        {
            await RoomDAO.Instance.UpdateRoom(rooms);
        }
        public async Task<Guid> GetRoomIdByRoomNo(string roomNo)
        {
            return await RoomDAO.Instance.GetRoomIdByRoomNo(roomNo);
        }
        
        public async Task<bool> ChangeRoomStatus(Guid id, int status)
        {
            return await RoomDAO.Instance.ChangeRoomStatus(id, status);
        }
        
        public async Task ProcessPendingRoomStatusChanges()
        {
             await RoomDAO.Instance.ProcessPendingRoomStatusChanges();
        }

        public async Task<bool> ChangeRoomStatusTemporarily(Guid roomId, int newStatus, DateTime startDate,
            DateTime endDate)
        {
            return await RoomDAO.Instance.ChangeRoomStatusTemporarily(roomId, newStatus, startDate, endDate);
        }

        public async Task<RoomBookingDTO> GetRoomBookingById(Guid id)
        {
            return await RoomDAO.Instance.GetRoomBookingById(id);
        }

        public async Task ResetStatus(Guid id)
        {
            await RoomDAO.Instance.ResetStatus(id);
        }
    }
}
