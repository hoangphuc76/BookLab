using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace BookLab_Odata.Controllers
{
	[Route("odata")]
	[ApiController]
	public class ImageRoomController(IImageRoomRepository _imageRoomRepository) : ODataController
	{

		// GET: odata/<RoleController>
		[HttpGet("[controller]")]
		[EnableQuery]
		public async Task<IEnumerable<ImageRoom>> GetImageRooms()
		{
			var listrole = await _imageRoomRepository.GetAllImageRooms();
			return listrole;
		}

		// GET odata/<RoleController>/5
		[HttpGet("[controller]({id})")]
		public async Task<ActionResult<ImageRoom>> GetImageRoom(Guid id)
		{
			var role = await _imageRoomRepository.GetImageRoomsById(id);
			if (role == null)
			{
				return NotFound();
			}
			return role;
		}

        // GET odata/<ImageRoomController>/5/Room
        [HttpGet("[controller]({id})/Room")]
        public async Task<IEnumerable<ImageRoom>> GetImageRoomsByRoomId(Guid id)
        {
            var imgs = await _imageRoomRepository.GetAllImageRoomsByRoomId(id);
            return imgs;
        }

        // POST odata/<RoleController>
        [HttpPost("[controller]")]
		public async Task<ActionResult> PostImageBuilding([FromBody] ImageRoom imageRoom)
		{
			imageRoom.Id = Guid.NewGuid();
			await _imageRoomRepository.AddImageRoom(imageRoom);
			return Content("Insert success!");
		}

		// PUT odata/<RoleController>/5
		[HttpPut("[controller]({id})")]
		public async Task<ActionResult> PutImageRoom(Guid id, [FromBody] ImageRoom imageRoom)
		{
			var temp = await _imageRoomRepository.GetImageRoomsById(id);
			if (temp == null)
			{
				return NoContent();
			}
			imageRoom.Id = id;
			await _imageRoomRepository.UpdateImageRoom(imageRoom);
			return Content("Update success!");
		}

		// DELETE odata/<RoleController>/5
		[HttpDelete("[controller]({id})")]
		public async Task<ActionResult> DeleteImageRoom(Guid id)
		{
			var temp = await _imageRoomRepository.GetImageRoomsById(id);
			if (temp == null)
			{
				return NoContent();
			}
			await _imageRoomRepository.DeleteImageRoom(id);
			return Content("Delete success!");
		}
	}
}
