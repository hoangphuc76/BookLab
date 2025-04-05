using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface ICategoryRoomRepository
    {
        Task<IEnumerable<CategoryRoom>> GetAllCategoryRooms();

        Task<CategoryRoom> GetCategoryRoomsById(Guid id);
        Task<Guid?> GetCategoryRoomIdByName(string categoryName);

        Task AddCategoryRoom(CategoryRoom categoryRooms);

        Task UpdateCategoryRoom(CategoryRoom categoryRooms);

        Task DeleteCategoryRoom(Guid id);

        Task<bool> ChangeStatus(Guid id);
    }
}
