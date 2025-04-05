using AutoMapper;
using BookLabRepositories;
using BookLabServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class DashboardController(IBookingRepository _bookingRepository, ISubBookingRepository _subbookingRepository, IRoomRepository _roomRepository, IBuildingRepository _buildingRepository, IRoleRepository _roleRepository,
        ILogger<BuildingController> _logger, IAccountRepository _accountRepository) : ODataController
    {
        [HttpGet("initial-data")]
        public async Task<IActionResult> GetInitialDashboardData()
        {
            try
            {
                // Lấy dữ liệu thô từ các repository
                var accounts = await _accountRepository.GetAllAccounts();
                var buildings = await _buildingRepository.GetAllBuildings();
                var rooms = await _roomRepository.GetAllRooms();
                var roles = await _roleRepository.GetAllRoles();
                var bookings = await _bookingRepository.GetAllBookings(1,100); // Lấy tất cả bookings
                var subBookings = await _subbookingRepository.GetAllSubBookings(); // Lấy tất cả subBookings

                var result = new
                {
                    Accounts = accounts,
                    Buildings = buildings,
                    Rooms = rooms,
                    Roles = roles,
                    Bookings = bookings,
                    SubBookings = subBookings
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting initial dashboard data");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
