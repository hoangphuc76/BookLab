// using System.Web.Http;
// using BookLabModel.Model;
// using BookLabRepositories;
// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.OData.Query;
// using Microsoft.AspNetCore.OData.Routing.Controllers;
//
// namespace BookLab_Odata.Controllers
// {
// 	[Microsoft.AspNetCore.Mvc.Route("odata")]
// 	[ApiController]
// 	public class SlotController : ODataController
// 	{
// 		private readonly ISlotRepository _SlotRepository;
// 		public SlotController()
// 		{
// 			_SlotRepository = new SlotRepository();
// 		}
// 		// GET: odata/<SlotController>
// 		[Microsoft.AspNetCore.Mvc.HttpGet("[controller]")]
// 		[EnableQuery]
// 		[Authorize]
// 		public async Task<IEnumerable<Slot>> GetSlots()
// 		{
// 			var listSlot = await _SlotRepository.GetAllSlots();
// 			return listSlot;
// 		}
//
// 		// GET odata/<SlotController>/5
// 		[Microsoft.AspNetCore.Mvc.HttpGet("[controller]({id})")]
// 		[Authorize]
// 		public async Task<ActionResult<Slot>> GetSlot(Guid id)
// 		{
// 			var Slot = await _SlotRepository.GetSlotsById(id);
// 			if (Slot == null)
// 			{
// 				return NotFound();
// 			}
// 			return Slot;
// 		}
//
// 		// POST odata/<SlotController>
// 		[Microsoft.AspNetCore.Mvc.HttpPost("[controller]")]
// 		[Authorize]
// 		public async Task<ActionResult> PostSlot([Microsoft.AspNetCore.Mvc.FromBody] Slot Slot)
// 		{
// 			Slot.Id = Guid.NewGuid();
// 			await _SlotRepository.AddSlot(Slot);
// 			return Content("Insert success!");
// 		}
//
// 		// PUT odata/<SlotController>/5
// 		[Microsoft.AspNetCore.Mvc.HttpPut("[controller]({id})")]
// 		[Authorize]
// 		public async Task<ActionResult> PutSlot(Guid id, [Microsoft.AspNetCore.Mvc.FromBody] Slot Slot)
// 		{
// 			var temp = await _SlotRepository.GetSlotsById(id);
// 			if (temp == null)
// 			{
// 				return NoContent();
// 			}
// 			Slot.Id = id;
// 			await _SlotRepository.UpdateSlot(Slot);
// 			return Content("Update success!");
// 		}
//
//
// 		// DELETE odata/<SlotController>/5
// 		[Microsoft.AspNetCore.Mvc.HttpDelete("[controller]({id})")]
// 		[Authorize]
// 		public async Task<ActionResult> DeleteSlot(Guid id)
// 		{
// 			var temp = await _SlotRepository.GetSlotsById(id);
// 			if (temp == null)
// 			{
// 				return NoContent();
// 			}
// 			await _SlotRepository.DeleteSlot(id);
// 			return Content("Delete success!");
// 		}
// 	}
// }
