using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IFavouriteRoomRepository
    {
        Task<IEnumerable<FavouriteRoom>> GetAllFavouriteRooms();

        Task<IEnumerable<FavouriteRoom>> GetFavouriteRoomsByAccountId(Guid accountId);

        Task<FavouriteRoom> GetFavouriteRoomsById(Guid accountId, Guid roomId);

        Task AddFavouriteRoom(FavouriteRoom favouriteRooms);

        Task UpdateFavouriteRoom(FavouriteRoom favouriteRooms);

        Task DeleteFavouriteRoom(Guid accountId, Guid roomId);

    }
}
