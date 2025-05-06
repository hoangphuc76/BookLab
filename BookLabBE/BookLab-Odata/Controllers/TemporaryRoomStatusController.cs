using BookLabRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using BookLabDTO;
using System.Security.Claims;
namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class TemporaryRoomStatusController(ITemporaryRoomStatusRepsoitory _temporaryRoomStatusRepsoitory, ILogger<TemporaryRoomStatusController> _logger) : ODataController
    {
        [HttpGet("[controller]")]
        [Authorize]
        public async Task<IEnumerable<TemporaryRoomStatusDto>> GetTemporaryRoomStatuses()
        {
            _logger.LogInformation("GetTemporaryRoomStatuses called");
            var listTemporaryRoomStatus = await _temporaryRoomStatusRepsoitory.GetAll();
            return listTemporaryRoomStatus;
        }

        [HttpPut("[controller]/{id}")]
        [Authorize]
        public async Task<IActionResult> ChangeTemporaryStatus(Guid id, [FromBody] int temporaryStatus, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            _logger.LogInformation($"ChangeTemporaryStatus called with id: {id} and temporaryStatus: {temporaryStatus}");
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _temporaryRoomStatusRepsoitory.ChangeTemporaryStatus(id, temporaryStatus, startDate, endDate, Guid.Parse(userId));
            if (!result)
            {
                _logger.LogWarning($"Failed to change temporary status for roomId: {id}");
                return BadRequest();
            }
            return Ok();
        }

        [HttpDelete("[controller]/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTemporaryRoomStatus(Guid id)
        {
            _logger.LogInformation($"DeleteTemporaryRoomStatus called with id: {id}");
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roomId = id;
            var result = await _temporaryRoomStatusRepsoitory.Delete(roomId, Guid.Parse(userId));
            if (!result)
            {
                _logger.LogWarning($"Failed to delete temporary room status for roomId: {roomId}");
                return BadRequest();
            }
            return Ok();
        }
    }
}
