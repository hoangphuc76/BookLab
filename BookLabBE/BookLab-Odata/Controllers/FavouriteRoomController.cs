using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using BookLabModel.Model;
using BookLabRepositories;
using System.Text;
using System.Data;
namespace BookLab_Odata.Controllers
{
	[Route("odata")]
	[ApiController]
	public class FavouriteRoomController : ODataController
	{
		private readonly IFavouriteRoomRepository _favouriteRoomRepository;
		public FavouriteRoomController()
		{
			_favouriteRoomRepository = new FavouriteRoomRepository();
		}
		// GET: odata/<BuildingController>
		[HttpGet("[controller]")]
		[EnableQuery]
		public async Task<IEnumerable<FavouriteRoom>> GetFavouriteRoomes()
		{
			var list = await _favouriteRoomRepository.GetAllFavouriteRooms();
			return list;
		}

		// GET odata/<BuildingController>/5
		[HttpGet("[controller]({accid})({roomid})")]
		public async Task<ActionResult<FavouriteRoom>> GetFavouriteRoom(Guid accid, Guid roomid)
		{
			var booking = await _favouriteRoomRepository.GetFavouriteRoomsById(accid, roomid);
			if (booking == null)
			{
				return NotFound();
			}
			return booking;
		}

		// POST odata/<BuildingController>
		[HttpPost("[controller]")]
		public async Task<ActionResult> PostFavouriteRoom([FromBody] FavouriteRoom  favouriteRoom)
		{
			await _favouriteRoomRepository.AddFavouriteRoom(favouriteRoom);
			return Content("Insert success!");
		}

		// PUT odata/<BuildingController>/5
		[HttpPut("[controller]({accid})({roomid})")]
		public async Task<ActionResult> PutCategoryRoom(Guid accid, Guid roomid, [FromBody] FavouriteRoom favouriteRoom)
		{
			var temp = await _favouriteRoomRepository.GetFavouriteRoomsById(accid,roomid);
			if (temp == null)
			{
				return NoContent();
			}
			favouriteRoom.RoomId = roomid;
			favouriteRoom.AccountId = accid;
			await _favouriteRoomRepository.UpdateFavouriteRoom(favouriteRoom);
			return Content("Update success!");
		}

		// DELETE odata/<BuildingController>/5
		[HttpDelete("[controller]({accid})({roomid})")]
		public async Task<ActionResult> DeleteBooking(Guid accid, Guid roomid)
		{
			var temp = await _favouriteRoomRepository.GetFavouriteRoomsById(accid, roomid);
			if (temp == null)
			{
				return NoContent();
			}
			await _favouriteRoomRepository.DeleteFavouriteRoom(accid,roomid);
			return Content("Delete success!");
		}
	}
}
