using BookLabModel.Model;
using BookLabRepositories;
using BookLabServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BookLab_Odata.Controllers
{
	[Route("odata")]
	[ApiController]
	public class FeedbackController(IFeedbackRepository _feedbackRepository,
		IBookingRepository _bookingRepository,
		IProfanityFilterService _profanityFilterService,
        ILogger<FeedbackController> _logger,
		ISubBookingRepository _subBookingRepository,
		IRoomRepository _roomRepository) : ODataController
	{
		// GET: odata/<RoleController>
		[HttpGet("[controller]")]
		[EnableQuery]
		[Authorize]
		public async Task<IEnumerable<Feedback>> GetFeedbacks()
		{
			var listrole = await _feedbackRepository.GetAllFeedbacks();
			return listrole;
		}

        // GET: odata/<FeedbackController>/Room
        [HttpGet("[controller]({id})/Room")]
        [EnableQuery]
        [Authorize]
        public async Task<IEnumerable<Feedback>> GetFeedbacksByRoomId(Guid id)
        {
            var feedbacks = await _feedbackRepository.GetFeedbacksByRoomId(id);
            return feedbacks;
        }

		[HttpGet("[controller]({id})/CanFeedback")]
		[Authorize]
		public async Task<bool> GetCanFeedback(Guid id)
		{

			try
			{
				// Lấy các claims từ token
				var lecturer = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				Guid lecturerID = Guid.Parse(lecturer);

				// Log thông tin người dùng
				_logger.LogInformation($"LecturerID : {lecturerID}");
				_logger.LogInformation("Check can feedback");

				return await _feedbackRepository.CanFeedback(lecturerID, id);
			}
			catch (Exception ex)
			{
				_logger.LogError($"Failed to process token: {ex.Message}");
				return false;
			}
		}

		// GET odata/<RoleController>/5
		[HttpGet("[controller]({id})")]
        [Authorize]
		public async Task<ActionResult<Feedback>> GetFeedback(Guid id)
		{
			var role = await _feedbackRepository.GetFeedbacksById(id);
			if (role == null)
			{
				return NotFound();
			}
			return role;
		}

		// POST odata/<RoleController>
		[HttpPost("[controller]")]
		[Authorize]
		public async Task<ActionResult> PostFeedback([FromBody] Feedback feedback)
		{
			try
			{
				// Lấy các claims từ token
				var lecturer = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				Guid lecturerID = Guid.Parse(lecturer);

				// Log thông tin người dùng
				_logger.LogInformation($"LecturerID : {lecturerID}");
				feedback.LecturerId = lecturerID;

				var description = feedback.FeedbackDescription;
				var result = await _profanityFilterService.CheckProfanityAsync(description);
				if (result.Censored.Contains("*"))
				{
					return BadRequest(new ProblemDetails
					{
						Title = "Forbidden",
						Detail = "Feedback contains sensitive language.",
						Status = 403
					});
				}

				var subBooking = await _subBookingRepository.GetSubBookingLatestByLectureId(lecturerID, feedback.RoomId.Value);
				feedback.SubBookingId = subBooking.Id;

				await _feedbackRepository.AddFeedback(feedback);

				var room = await _roomRepository.GetRoomsById(feedback.RoomId.Value);
				var ratingUpdate = await _feedbackRepository.GetRatingForRoom(room.Id);
				room.Rating = ratingUpdate;

				await _roomRepository.UpdateRoom(room);

				return Content("Insert success!");
			}
			catch (Exception ex)
			{
				_logger.LogError($"Failed to process token: {ex.Message}");
				return BadRequest("Invalid token format");
			}
		}

		// PUT odata/<RoleController>/5
		[HttpPut("[controller]({id})")]
		[Authorize]
		public async Task<ActionResult> PutFeedback(Guid id, [FromBody] Feedback feedback)
		{
			var temp = await _feedbackRepository.GetFeedbacksById(id);
			if (temp == null)
			{
				return NoContent();
			}
			feedback.Id = id;
			await _feedbackRepository.UpdateFeedback(feedback);
			return Content("Update success!");
		}

		// PUT odata/<RoleController>/5/status
		[HttpPut("[controller]({id})/Status")]
		[Authorize]
		public async Task<ActionResult> PutFeedbackChangeStatus(Guid id)
		{
			var temp = await _feedbackRepository.GetFeedbacksById(id);
			if (temp == null)
			{
				return NoContent();
			}
			temp.Status = !temp.Status;
			await _feedbackRepository.UpdateFeedback(temp);
			return Content("Update success!");
		}

		// DELETE odata/<RoleController>/5
		[HttpDelete("[controller]({id})")]
		[Authorize]
		public async Task<ActionResult> DeleteFeedback(Guid id)
		{
			var temp = await _feedbackRepository.GetFeedbacksById(id);
			if (temp == null)
			{
				return NoContent();
			}
			await _feedbackRepository.DeleteFeedback(id);
			return Content("Delete success!");
		}
	}
}
