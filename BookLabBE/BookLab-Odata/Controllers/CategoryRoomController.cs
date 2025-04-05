using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using BookLabModel.Model;
using BookLabRepositories;
using System.Data;
using BookLabDTO;

namespace BookLab_Odata.Controllers
{
	[Route("odata")]
	[ApiController]
	public class CategoryRoomController(ICategoryRoomRepository _categoryRoomRepository) : ODataController
	{
		// GET: odata/<BuildingController>
		[HttpGet("[controller]")]
		[EnableQuery]
		public async Task<IEnumerable<CategoryRoomDto>> GetCategoryRoomes()
		{
			var list = await _categoryRoomRepository.GetAllCategoryRooms();
			var listdto = list.Select(x => new CategoryRoomDto()
			{
				Id = x.Id,
				Name = x.Name,
				Code = x.Code,
				Status = x.Status
			});
			return listdto;
		}

		// GET odata/<BuildingController>/5
		[HttpGet("[controller]({id})")]
		public async Task<ActionResult<CategoryRoom>> GetCategoryRoom(Guid id)
		{
			var booking = await _categoryRoomRepository.GetCategoryRoomsById(id);
			if (booking == null)
			{
				return NotFound();
			}
			return booking;
		}

		// POST odata/<BuildingController>
		[HttpPost("[controller]")]
		public async Task<ActionResult> PostCategoryRoom([FromBody] CategoryRoom categoryRoom)
		{
			categoryRoom.Id = Guid.NewGuid();
			await _categoryRoomRepository.AddCategoryRoom(categoryRoom);
			return Content("Insert success!");
		}

		// PUT odata/<BuildingController>/5
		[HttpPut("[controller]({id})")]
		public async Task<ActionResult> PutCategoryRoom(Guid id, [FromBody] CategoryRoom categoryRoom)
		{
			var temp = await _categoryRoomRepository.GetCategoryRoomsById(id);
			if (temp == null)
			{
				return NoContent();
			}
			categoryRoom.Id = id;
			await _categoryRoomRepository.UpdateCategoryRoom(categoryRoom);
			return Content("Update success!");
		}

		// PUT odata/<BuildingController>/5/status
		[HttpPut("[controller]({id})/Status")]
		public async Task<ActionResult> PutcategoryRoomChangeStatus(Guid id)
		{
			var temp = await _categoryRoomRepository.GetCategoryRoomsById(id);
			if (temp == null)
			{
				return NoContent();
			}
			temp.Status = !temp.Status;
			await _categoryRoomRepository.UpdateCategoryRoom(temp);
			return Content("Update success!");
		}

		// DELETE odata/<BuildingController>/5
		[HttpDelete("[controller]({id})")]
		public async Task<ActionResult> DeleteBooking(Guid id)
		{
			var temp = await _categoryRoomRepository.GetCategoryRoomsById(id);
			if (temp == null)
			{
				return NoContent();
			}
			await _categoryRoomRepository.DeleteCategoryRoom(id);
			return Content("Delete success!");
		}
	}
}
