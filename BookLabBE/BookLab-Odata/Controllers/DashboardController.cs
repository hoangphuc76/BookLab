using System.Text;
using AutoMapper;
using BookLabDAO;
using BookLabDTO;
using BookLabRepositories;
using BookLabServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class DashboardController(IBookingRepository _bookingRepository, ILogger<BuildingController> _logger) : ODataController
    {
        [HttpGet("summary")]
        //[Authorize]
        public async Task<IActionResult> GetSummary(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30);
            endDate ??= DateTime.Now;

            var summary = await _bookingRepository.GetDashboardSummary(startDate.Value, endDate.Value);
            return Ok(summary);
        }

        [HttpGet("reasons")]
        //[Authorize]
        public async Task<IActionResult> GetReasons(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30);
            endDate ??= DateTime.Now;

            var reasons = await _bookingRepository.GetReasonStats(startDate.Value, endDate.Value);
            return Ok(reasons);
        }

        [HttpGet("room-usage")]
        //[Authorize]
        public async Task<IActionResult> GetRoomUsage(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30);
            endDate ??= DateTime.Now;

            var roomUsage = await _bookingRepository.GetRoomUsageStats(startDate.Value, endDate.Value);
            return Ok(roomUsage);
        }
        [HttpGet("booking-trend")]
        //[Authorize]
        public async Task<IActionResult> GetBookingTrend(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetBookingTrend(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { Date = d.Date, Count = d.Count }));
        }

        [HttpGet("bookings-by-day")]
        //[Authorize]
        public async Task<IActionResult> GetBookingsByDayOfWeek(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetBookingsByDayOfWeek(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { DayOfWeek = d.DayOfWeek, Count = d.Count }));
        }

        [HttpGet("room-type-usage")]
        //[Authorize]
        public async Task<IActionResult> GetRoomTypeUsage(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetRoomTypeUsage(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { RoomType = d.RoomType, Count = d.Count }));
        }

        [HttpGet("available-rooms")]
        //[Authorize]
        public async Task<IActionResult> GetAvailableRooms(DateTime? date)
        {
            date ??= DateTime.Now;
            var count = await _bookingRepository.GetAvailableRooms(date.Value);
            return Ok(new { Date = date.Value, AvailableRooms = count });
        }

        [HttpGet("top-reasons")]
        //[Authorize]
        public async Task<IActionResult> GetTopReasons(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetTopReasons(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { Reason = d.Reason, Percentage = d.Percentage }));
        }

        [HttpGet("occupancy-rate")]
        //[Authorize]
        public async Task<IActionResult> GetOccupancyRate(DateTime? date)
        {
            date ??= DateTime.Now;
            var rate = await _bookingRepository.GetOccupancyRate(date.Value);
            return Ok(new { Date = date.Value, OccupancyRate = rate });
        }

        [HttpGet("booking-heatmap")]
        //[Authorize]
        public async Task<IActionResult> GetBookingHeatmap(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetBookingHeatmap(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { Hour = d.Hour, Count = d.Count }));
        }

        [HttpGet("bookings-by-teacher")]
        //[Authorize]
        public async Task<IActionResult> GetBookingsByTeacher(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetBookingsByTeacher(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { TeacherName = d.TeacherName, Count = d.Count }));
        }

        [HttpGet("average-lead-time")]
        //[Authorize]
        public async Task<IActionResult> GetAverageLeadTime(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var leadTime = await _bookingRepository.GetAverageLeadTime(startDate.Value, endDate.Value);
            return Ok(new { LeadTime = leadTime });
        }

        [HttpGet("bookings-by-time-slot")]
        //[Authorize]
        public async Task<IActionResult> GetBookingsByTimeSlot(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetBookingsByTimeSlot(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { TimeSlot = d.TimeSlot, Count = d.Count }));
        }

        [HttpGet("bookings-by-category-room")]
        //[Authorize]
        public async Task<IActionResult> GetBookingsByCategoryRoom(DateTime? startDate, DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddDays(-30); endDate ??= DateTime.Now;
            var data = await _bookingRepository.GetBookingsByCategoryRoom(startDate.Value, endDate.Value);
            return Ok(data.Select(d => new { CategoryName = d.CategoryName, Count = d.Count }));
        }

        [HttpGet("export-room-availability")]
        //[Authorize]
        public async Task<IActionResult> ExportRoomAvailability([FromQuery] DateTime date, [FromQuery] string typeSlot)
        {
            if (typeSlot != "Oldslot" && typeSlot != "Newslot")
            {
                return BadRequest("TypeSlot must be either 'Oldslot' or 'Newslot'.");
            }

            var data = await _bookingRepository.GetRoomAvailabilityAsync(date, typeSlot);

            var csv = new StringBuilder();
            csv.AppendLine("TypeSlot,RoomNo,Capacity,Slot,TotalSlot,Date");
            foreach (var item in data)
            {
                csv.AppendLine($"{item.TypeSlot},{item.RoomNo},{item.Capacity},\"{item.Slot}\",{item.TotalSlot},{item.Date}");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"room_availability_{typeSlot}_{date:yyyyMMdd}.csv");
        }

        [HttpGet("export-booking-history")]
        //[Authorize]
        public async Task<IActionResult> ExportBookingHistory([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var data = await _bookingRepository.GetBookingHistoryAsync(startDate, endDate);

            var csv = new StringBuilder();
            csv.AppendLine("Booker,RoomNo,date,Note,Slot,TimeRange");
            foreach (var item in data)
            {
                csv.AppendLine($"{item.Booker},{item.RoomNo},{item.Date},\"{item.Note}\",{item.Slot},{item.TimeRange ?? ""}");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"booking_history_{startDate:yyyyMMdd}_to_{endDate:yyyyMMdd}.csv");
        }

        [HttpGet("upcoming-bookings")]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<UpcomingBookingDto>>> GetUpcomingBookings([FromQuery] int limit = 7)
        {
            if (limit < 1)
            {
                return BadRequest("Limit must be a positive number.");
            }

            var data = await _bookingRepository.GetUpcomingBookingsAsync(limit);
            return Ok(data);
        }
    }
}
