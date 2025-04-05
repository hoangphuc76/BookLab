using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IImageRoomRepository
    {
        Task<IEnumerable<ImageRoom>> GetAllImageRooms();

        Task<IEnumerable<ImageRoom>> GetAllImageRoomsByRoomId(Guid id);

        Task<ImageRoom> GetImageRoomsById(Guid id);

        Task AddImageRoom(ImageRoom imageRooms);

        Task UpdateImageRoom(ImageRoom imageRooms);

        Task DeleteImageRoom(Guid id);
    }
}
