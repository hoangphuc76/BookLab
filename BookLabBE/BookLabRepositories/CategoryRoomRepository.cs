using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class CategoryRoomRepository : ICategoryRoomRepository
    {
        public async Task AddCategoryRoom(CategoryRoom categoryRooms)
        {
            await CategoryRoomDAO.Instance.AddCategoryRoom(categoryRooms);
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            return await CategoryRoomDAO.Instance.ChangeStatus(id);
        }

        public async Task DeleteCategoryRoom(Guid id)
        {
            await CategoryRoomDAO.Instance.DeleteCategoryRoom(id);
        }

        public async Task<IEnumerable<CategoryRoom>> GetAllCategoryRooms()
        {
            return await CategoryRoomDAO.Instance.GetAllCategoryRooms();
        }

        public async Task<CategoryRoom> GetCategoryRoomsById(Guid id)
        {
            return await CategoryRoomDAO.Instance.GetCategoryRoomsById(id);
        }
        public async Task<Guid?> GetCategoryRoomIdByName(string categoryName)
        {
            return await CategoryRoomDAO.Instance.GetCategoryRoomIdByName(categoryName);
        }
        public async Task UpdateCategoryRoom(CategoryRoom categoryRooms)
        {
            await CategoryRoomDAO.Instance.UpdateCategoryRoom(categoryRooms);
        }
    }
}
