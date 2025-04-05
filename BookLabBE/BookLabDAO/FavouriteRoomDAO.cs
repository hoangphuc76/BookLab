using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class FavouriteRoomDAO : SingletonBase<FavouriteRoomDAO>
    {
        public async Task<IEnumerable<FavouriteRoom>> GetAllFavouriteRooms()
        {
            return await _context.FavouriteRooms.ToListAsync();
            /*return await _context.FavouriteRooms.Include(fr => fr.Room).Include(fr => fr.Account).ToListAsync();*/
        }
        public async Task<IEnumerable<FavouriteRoom>> GetFavouriteRoomsByAccountId(Guid accountId)
        {
            var favouriteRooms = await _context.FavouriteRooms.Where(fr => fr.AccountId == accountId).ToListAsync();
            if (favouriteRooms == null) return null;

            return favouriteRooms;
        }
        public async Task<FavouriteRoom> GetFavouriteRoomsById(Guid accountId, Guid roomId)
        {
            var favouriteRooms = await _context.FavouriteRooms.FirstOrDefaultAsync(fr => fr.AccountId == accountId && fr.RoomId == roomId);
            if (favouriteRooms == null) return null;

            return favouriteRooms;
        }
        public async Task AddFavouriteRoom(FavouriteRoom favouriteRooms)
        {
            await _context.FavouriteRooms.AddAsync(favouriteRooms);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateFavouriteRoom(FavouriteRoom favouriteRooms)
        {
            var existingItem = await GetFavouriteRoomsById(favouriteRooms.AccountId, favouriteRooms.RoomId);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(favouriteRooms);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteFavouriteRoom(Guid accountId, Guid roomId)
        {
            var favouriteRooms = await GetFavouriteRoomsById(accountId, roomId);

            if (favouriteRooms != null)
            {
                _context.FavouriteRooms.Remove(favouriteRooms);
                await _context.SaveChangesAsync();
            }
        }
    }
}
