using BookLabModel.Model;
using BookLabServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookLab_Odata.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoogleCalendarAPIController : ControllerBase
    {
        private readonly ITokenService tokenService;
        private readonly IMeetingBookLabService meetingBookLabService;

        public GoogleCalendarAPIController(ITokenService tokenService, IMeetingBookLabService meetingBookLabService)
        {
            this.tokenService = tokenService;
            this.meetingBookLabService = meetingBookLabService;
        }

        [HttpGet("token")]
        public async Task<string> GetAccessTokenAsync()
        {
            return await this.tokenService.GetAccessTokenAsync();
        }

        /*{
  "start": {
    "dateTime": "2025-02-09T12:00:00",
    "timeZone": "Asia/Ho_Chi_Minh"
  },
  "end": {
    "dateTime": "2025-02-09T15:00:00",
    "timeZone": "Asia/Ho_Chi_Minh"
  },
  "summary": "Test",
  "description": "Đồng bộ hóa"
}*/
        [HttpPost("event/create")]
        public async Task<EventResponse> CreateEventAsync(EventRequest eventRequest)
        {
            return await this.meetingBookLabService.CreateEventAsync(eventRequest);
        }

        



    }
}
