using System.Reflection;
using System.Text.Json;
using BookLabDTO;
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
        private readonly IEmailService _emailService;
        private readonly IWebHostEnvironment _env;

        public GoogleCalendarAPIController(IEmailService emailService, ITokenService tokenService, IMeetingBookLabService meetingBookLabService, IWebHostEnvironment env)
        {
            this.tokenService = tokenService;
            this.meetingBookLabService = meetingBookLabService;
            this._env = env;
            this._emailService = emailService;
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

        // Existing code...

        // GET: Lấy danh sách template và template được chọn
        [HttpGet("get-templates")]
        public IActionResult GetTemplates()
        {
            try
            {
                var templates = _emailService.GetTemplates();
                var selectedTemplateId = _emailService.GetSelectedTemplateId();
                return Ok(new { templates, selectedTemplateId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting templates: {ex.Message}");
            }
        }

        // POST: Cập nhật template được chọn
        [HttpPost("select-template")]
        public IActionResult SelectTemplate([FromBody] SelectTemplateRequest request)
        {
            try
            {
                _emailService.UpdateSelectedTemplate(request.TemplateId);
                return Ok("Template selected successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error selecting template: {ex.Message}");
            }
        }
        // GET: Lấy EmailConfiguration hiện tại
        [HttpGet("get-config")]
        public IActionResult GetConfig()
        {
            try
            {
                var config = _emailService.GetEmailConfiguration();
                return Ok(config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting email configuration: {ex.Message}");
            }
        }

        // POST: Cập nhật EmailConfiguration
        [HttpPost("update-config")]
        public IActionResult UpdateConfig([FromBody] EmailConfiguration newConfig)
        {
            try
            {
                _emailService.UpdateEmailConfiguration(newConfig);
                return Ok("Email configuration updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating email configuration: {ex.Message}");
            }
        }
    }
    public class SelectTemplateRequest
    {
        public int TemplateId { get; set; }
    }
}
