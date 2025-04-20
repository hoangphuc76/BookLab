using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using BookLabModel.Model;
using BookLabRepositories;
using System.Text;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace BookLab_Odata.Controllers
{
	[Route("odata")]
	[ApiController]
	public class FavouriteRoomController(
        IFavouriteRoomRepository _favouriteRoomRepository,
		ILogger<FavouriteRoomController> _logger
        ) : ODataController
	{
		// GET: odata/<BuildingController>
		[HttpGet("[controller]")]
		[EnableQuery]
		public async Task<IEnumerable<FavouriteRoom>> GetFavouriteRoomes()
		{
			var list = await _favouriteRoomRepository.GetAllFavouriteRooms();
			return list;
		}

        // GET: odata/<FavouriteRoomController>
        [HttpGet("[controller]/person")]
        [Authorize]
        public async Task<IActionResult> GetFavouriteRoomesByPerson()
        {
            try
            {
                // Lấy các claims từ token
                var lecturer = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Guid lecturerID = Guid.Parse(lecturer);

                // Log thông tin người dùng
                _logger.LogInformation($"LecturerID : {lecturerID}");

                var list = await _favouriteRoomRepository.GetFavouriteRoomsByAccountId(lecturerID);
				var result = list.Where(f => f.IsDeleted == false).ToList();
                return Ok(result);
            }
            catch (FormatException ex)
            {
                _logger.LogError($"Failed to process token: {ex.Message}");
                return BadRequest("Invalid token format"); ;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error: {ex.Message}");
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }

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
        [Authorize]
        public async Task<ActionResult> PostFavouriteRoom([FromBody] FavouriteRoom  favouriteRoom)
		{
            try
            {
                // Lấy các claims từ token
                var lecturer = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Guid lecturerID = Guid.Parse(lecturer);

                // Log thông tin người dùng
                _logger.LogInformation($"LecturerID : {lecturerID}");
                favouriteRoom.CreatedBy = lecturerID;
                favouriteRoom.CreatedAt = DateTime.Now;
                favouriteRoom.IsDeleted = false;

                await _favouriteRoomRepository.AddFavouriteRoom(favouriteRoom);
                return Content("Insert success!");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to process token: {ex.Message}");
                return BadRequest("Invalid token format");
            }
            
		}

		// PUT odata/<BuildingController>/5
		[HttpPut("[controller]({roomid})")]
		public async Task<ActionResult> PutFavouriteRoom(Guid roomid, [FromBody] FavouriteRoom favouriteRoom)
		{
            try
            {
                // Lấy các claims từ token
                var lecturer = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Guid lecturerID = Guid.Parse(lecturer);

                // Log thông tin người dùng
                _logger.LogInformation($"LecturerID : {lecturerID}");

                var temp = await _favouriteRoomRepository.GetFavouriteRoomsById(lecturerID, roomid);
                if (temp == null)
                {
                    return NoContent();
                }
                temp.UpdatedAt = DateTime.Now;
                temp.UpdatedBy = lecturerID;
                temp.IsDeleted = !temp.IsDeleted;

                await _favouriteRoomRepository.UpdateFavouriteRoom(temp);
                return Content("Update success!");

            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to process token: {ex.Message}");
                return BadRequest("Invalid token format");
            }       
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
