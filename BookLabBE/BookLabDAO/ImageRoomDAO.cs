using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class ImageRoomDAO : SingletonBase<ImageRoomDAO>
    {
        public async Task<IEnumerable<ImageRoom>> GetAllImageRooms()
        {
            return await _context.ImageRooms.ToListAsync();
            /*return await _context.ImageRooms.Include(ir => ir.Room).ToListAsync();*/
        }

        public async Task<IEnumerable<ImageRoom>> GetAllImageRoomsByRoomId(Guid id)
        {
            return await _context.ImageRooms.Where(ir => ir.RoomId == id).ToListAsync();
            /*return await _context.ImageRooms.Include(ir => ir.Room).ToListAsync();*/
        }

        public async Task<ImageRoom> GetImageRoomsById(Guid id)
        {
            var imageRooms = await _context.ImageRooms.FirstOrDefaultAsync(c => c.Id == id);
            if (imageRooms == null) return null;

            return imageRooms;
        }
        public async Task AddImageRoom(ImageRoom imageRooms)
        {
            await _context.ImageRooms.AddAsync(imageRooms);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateImageRoom(ImageRoom imageRooms)
        {
            var existingItem = await GetImageRoomsById(imageRooms.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(imageRooms);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteImageRoom(Guid id)
        {
            var imageRooms = await GetImageRoomsById(id);

            if (imageRooms != null)
            {
                _context.ImageRooms.Remove(imageRooms);
                await _context.SaveChangesAsync();
            }
        }
    }
}
