using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace BookLab_Odata.Controllers
{
	[Route("odata")]
	[ApiController]
	public class CampusController : ODataController
	{
		private readonly ICampusRepository _campusRepository;
		public CampusController()
		{
			_campusRepository = new CampusRepository();
		}
		// GET: odata/<CampusController>
		[HttpGet("[controller]")]
		[EnableQuery]
		//[Authorize]
		public async Task<IEnumerable<Campus>> GetCampuses()
		{
			var list = await _campusRepository.GetAllCampuses();
			return list;
		}

		// GET odata/<CampusController>/5
		[HttpGet("[controller]({id})")]
		public async Task<ActionResult<Campus>> GetCampuses(Guid id)
		{
			var campus = await _campusRepository.GetCampusById(id);
			if (campus == null)
			{
				return NotFound();
			}
			return campus;
		}

		// POST odata/<CampusController>
		[HttpPost("[controller]")]
		[Authorize]
		public async Task<ActionResult> PostCampus([FromBody] Campus campus)
		{
			campus.Id = Guid.NewGuid();
			await _campusRepository.AddCampus(campus);
			return Content("Insert success!");
		}

		// PUT odata/<CampusController>/5
		[HttpPut("[controller]({id})")]
		[Authorize]
		public async Task<ActionResult> PutCampus(Guid id, [FromBody] Campus campus)
		{
			var temp = await _campusRepository.GetCampusById(id);
			if (temp == null)
			{
				return NoContent();
			}
			campus.Id = id;
			await _campusRepository.UpdateCampus(campus);
			return Content("Update success!");
		}

		// PUT odata/<CampusController>/5/status
		[HttpPut("[controller]({id})/Status")]
		[Authorize]
		public async Task<ActionResult> PutCampusChangeStatus(Guid id)
		{
			var temp = await _campusRepository.GetCampusById(id);
			if (temp == null)
			{
				return NoContent();
			}
			temp.Status = !temp.Status;
			await _campusRepository.UpdateCampus(temp);
			return Content("Update success!");
		}

		// DELETE odata/<CampusController>/5
		[HttpDelete("[controller]({id})")]
		[Authorize]
		public async Task<ActionResult> DeleteCampus(Guid id)
		{
			var temp = await _campusRepository.GetCampusById(id);
			if (temp == null)
			{
				return NoContent();
			}
			await _campusRepository.DeleteCampus(id);
			return Content("Delete success!");
		}
	}
}
