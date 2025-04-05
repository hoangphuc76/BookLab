using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class ImageRoomRepository : IImageRoomRepository
    {
        public async Task AddImageRoom(ImageRoom imageRooms)
        {
            await ImageRoomDAO.Instance.AddImageRoom(imageRooms);
        }

        public async Task DeleteImageRoom(Guid id)
        {
            await ImageRoomDAO.Instance.DeleteImageRoom(id);
        }

        public async Task<IEnumerable<ImageRoom>> GetAllImageRooms()
        {
            return await ImageRoomDAO.Instance.GetAllImageRooms();
        }

        public async Task<IEnumerable<ImageRoom>> GetAllImageRoomsByRoomId(Guid id)
        {
            return await ImageRoomDAO.Instance.GetAllImageRoomsByRoomId(id);
        }

        public async Task<ImageRoom> GetImageRoomsById(Guid id)
        {
            return await ImageRoomDAO.Instance.GetImageRoomsById(id);
        }

        public async Task UpdateImageRoom(ImageRoom imageRooms)
        {
            await ImageRoomDAO.Instance.UpdateImageRoom(imageRooms);
        }
    }
}
