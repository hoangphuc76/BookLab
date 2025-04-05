using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class CategoryRoomDAO : SingletonBase<CategoryRoomDAO>
    {
        public async Task<IEnumerable<CategoryRoom>> GetAllCategoryRooms()
        {
            return await _context.CategoryRooms.ToListAsync();
        }
        public async Task<CategoryRoom> GetCategoryRoomsById(Guid id)
        {
            var categoryRooms = await _context.CategoryRooms.FirstOrDefaultAsync(c => c.Id == id);
            if (categoryRooms == null) return null;

            return categoryRooms;
        }
        public async Task<Guid?> GetCategoryRoomIdByName(string categoryName)
        {
            var categoryRooms = await _context.CategoryRooms.FirstOrDefaultAsync(c => c.Name == categoryName);
            if (categoryRooms == null) return null;

            return categoryRooms.Id;
        }
        public async Task AddCategoryRoom(CategoryRoom categoryRooms)
        {
            await _context.CategoryRooms.AddAsync(categoryRooms);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateCategoryRoom(CategoryRoom categoryRooms)
        {
            var existingItem = await GetCategoryRoomsById(categoryRooms.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(categoryRooms);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteCategoryRoom(Guid id)
        {
            var categoryRooms = await GetCategoryRoomsById(id);

            if (categoryRooms != null)
            {
                _context.CategoryRooms.Remove(categoryRooms);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<bool> ChangeStatus(Guid id)
        {
            var categoryRooms = await GetCategoryRoomsById(id);
            categoryRooms.Status = !categoryRooms.Status;
            _context.SaveChanges();
            return categoryRooms.Status;
        }
    }
}
