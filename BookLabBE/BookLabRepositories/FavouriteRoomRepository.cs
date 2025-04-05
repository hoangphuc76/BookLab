using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class FavouriteRoomRepository : IFavouriteRoomRepository
    {
        public async Task AddFavouriteRoom(FavouriteRoom favouriteRooms)
        {
            await FavouriteRoomDAO.Instance.AddFavouriteRoom(favouriteRooms);
        }

        public async Task DeleteFavouriteRoom(Guid accountId, Guid roomId)
        {
            await FavouriteRoomDAO.Instance.DeleteFavouriteRoom(accountId, roomId);
        }

        public async Task<IEnumerable<FavouriteRoom>> GetAllFavouriteRooms()
        {
            return await FavouriteRoomDAO.Instance.GetAllFavouriteRooms();
        }

        public async Task<IEnumerable<FavouriteRoom>> GetFavouriteRoomsByAccountId(Guid accountId)
        {
            return await FavouriteRoomDAO.Instance.GetFavouriteRoomsByAccountId(accountId);
        }

        public async Task<FavouriteRoom> GetFavouriteRoomsById(Guid accountId, Guid roomId)
        {
            return await FavouriteRoomDAO.Instance.GetFavouriteRoomsById(accountId, roomId);
        }

        public async Task UpdateFavouriteRoom(FavouriteRoom favouriteRooms)
        {
            await FavouriteRoomDAO.Instance.UpdateFavouriteRoom(favouriteRooms);
        }
    }
}
