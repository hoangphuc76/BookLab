using BookLabDTO;
using BookLabModel.Model;
using BookLabRepositories;
using BookLabServices;
using Microsoft.AspNetCore.Authorization;
using OfficeOpenXml;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class RoomController(IRoomRepository _RoomRepository, ILogger<RoomController> _logger, IAwsS3Service _aws3Services
                                , IBuildingRepository _BuildingRepository, IAccountRepository _AccountRepository, ICategoryRoomRepository _CategoryRoomRepository
    ) : ODataController
    {

        // GET: odata/<RoomController>
        [HttpGet("[controller]")]
        [EnableQuery]
        [Authorize]
        public async Task<IEnumerable<Room>> GetRooms()
        {
            var listRoom = await _RoomRepository.GetAllRooms();
            return listRoom;
        }



        // GET odata/<RoomController>/5
        [HttpGet("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult<Room>> GetRoom(Guid id)
        {
            var Room = await _RoomRepository.GetRoomsById(id);
            if (Room == null)
            {
                return NotFound();
            }
            return Room;
        }
        [HttpGet("[controller]/available")]
        [Authorize]
        public async Task<ActionResult<PaginatedResult<Room>>> GetAvailableRooms(
       [FromQuery] Guid buildingId,
       [FromQuery] DateTime? startDate,
       [FromQuery] DateTime? endDate,
       [FromQuery] TimeOnly? startTime,
       [FromQuery] TimeOnly? endTime,
       [FromQuery] int? capacity,
       [FromQuery] int? groupSize,
       [FromQuery] Guid? categoryRoomId,
       [FromQuery] string sortOrder = "asc",
       [FromQuery] int pageNumber = 1,
       [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation(
                     $"Getting available rooms with parameters: CampusId={{CampusId}}, StartDate={{StartDate}}, EndDate={{EndDate}}, StartTime={{StartTime}}, EndTime = {{EndTime}}, Capacity={{Capacity}}, GroupSize={{GroupSize}}, CategoryRoomId={{CategoryRoomId}}, PageNumber={{PageNumber}}, PageSize={{PageSize}}, sortOrder={{sortOrder}}",
                     buildingId, startDate, endDate, startTime, endTime, capacity, groupSize, categoryRoomId, pageNumber, pageSize, sortOrder);

                if (buildingId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid buildingId provided");
                    return BadRequest("Invalid campusId");
                }

                if (pageNumber < 1 || pageSize < 1)
                {
                    _logger.LogWarning("Invalid pagination parameters: PageNumber={PageNumber}, PageSize={PageSize}",
                        pageNumber, pageSize);
                    return BadRequest("Invalid pagination parameters");
                }

                var result = await _RoomRepository.GetAvailableRoom(
                    buildingId,
                    startDate,
                    endDate,
                    startTime,
                    endTime,
                    capacity,
                    groupSize,
                    categoryRoomId,
                    sortOrder,
                    pageNumber,
                    pageSize);

                _logger.LogInformation(
                    "Successfully retrieved {Count} rooms. Total items: {TotalItems}",
                    result.Items.Count(), result.TotalItems);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting available rooms");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }
        // POST odata/<RoomController>
        /*[HttpPost("[controller]")]
		public async Task<ActionResult> PostRoom([FromForm] IFormFile? file)
		{
			string imageUrl = null;
			if (file != null && file.Length > 0)

			{
				using (var stream = file.OpenReadStream())
				{
					string fileName = $"{file.FileName}";
					imageUrl = await _aws3Services.UploadFileAsync(stream, fileName);
					// Assuming Room has an ImageUrl property
				}
			}
			return Ok(imageUrl);
		}*/

        // PUT odata/<RoomController>/5
        [HttpPut("[controller]({id})")]
        [Authorize] // Bỏ comment nếu cần xác thực
        public async Task<ActionResult> PutRoom(Guid id, [FromForm] Room room, [FromForm] IFormFile? file)
        {
            _logger.LogInformation("Updating room with ID: {RoomId}", id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                string imageUrl = null;

                // Kiểm tra và upload file ảnh nếu có
                if (file != null && file.Length > 0)
                {
                    using (var stream = file.OpenReadStream())
                    {
                        string fileName = $"{Guid.NewGuid()}_{file.FileName}"; // Đặt tên file ngẫu nhiên
                        imageUrl = await _aws3Services.UploadFileAsync(stream, fileName);
                    }
                }

                // Lấy thông tin phòng hiện tại từ repository
                var existing = await _RoomRepository.GetRoomsById(id);
                if (existing == null)
                {
                    _logger.LogWarning("Room not found with ID: {RoomId}", id);
                    return NotFound();
                }

                // Cập nhật thông tin phòng
                room.Id = id;
                room.UpdatedAt = DateTime.Now;
                room.UpdatedBy = Guid.Parse(userId);

                // Nếu có file ảnh mới, cập nhật URL ảnh
                if (imageUrl != null)
                {
                    room.Avatar = imageUrl;
                }
                // Nếu không có file ảnh mới, giữ nguyên URL ảnh hiện tại (nếu có trong form)
                else if (!string.IsNullOrEmpty(room.Avatar))
                {
                    room.Avatar = room.Avatar;
                }
                else
                {
                    // Nếu không có file mới và không có avatar trong form, giữ nguyên avatar cũ
                    room.Avatar = existing.Avatar;
                }

                // Cập nhật phòng trong database
                await _RoomRepository.UpdateRoom(room);
                _logger.LogInformation("Updated room with ID: {RoomId}", id);
                return Ok("Update success!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating room with ID: {RoomId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT odata/<RoomController>/5/status
        [HttpPut("[controller]({id})/Status")]
        [Authorize]
        public async Task<ActionResult> PutRoomChangeStatus(Guid id)
        {
            var temp = await _RoomRepository.GetRoomsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            // temp.Status = !temp.Status;
            await _RoomRepository.UpdateRoom(temp);
            return Content("Update success!");
        }

        // DELETE odata/<RoomController>/5
        [HttpDelete("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> DeleteRoom(Guid id)
        {
            var temp = await _RoomRepository.GetRoomsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            await _RoomRepository.DeleteRoom(id);
            return Content("Delete success!");
        }
        [HttpPost("[controller](upload-excel)")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {

            if (file == null || file.Length == 0)
                return BadRequest("Please upload an Excel file");

            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Please upload a valid Excel file (.xlsx)");

            try
            {
                var roomsCreated = new List<Room>();
                var duplicateRoomNumbers = new List<string>();
                var invalidBuildings = new List<string>();
                var invalidCategories = new List<string>();
                var invalidManagers = new List<string>();
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets[0];
                        var rowCount = worksheet.Dimension.Rows;

                        for (int row = 2; row <= rowCount; row++)
                        {
                            var roomId = Guid.NewGuid();

                            // Mapping từ tên sang Id
                            var buildingName = worksheet.Cells[row, 9].Value?.ToString()?.Trim();
                            var categoryName = worksheet.Cells[row, 10].Value?.ToString()?.Trim();
                            var managerEmail = worksheet.Cells[row, 11].Value?.ToString()?.Trim();

                            Guid? buildingId = await _BuildingRepository.GetBuildingIdByName(buildingName);
                            if (!string.IsNullOrEmpty(buildingName) && !buildingId.HasValue)
                            {
                                invalidBuildings.Add(buildingName);
                                continue;
                            }

                            Guid? categoryId = await _CategoryRoomRepository.GetCategoryRoomIdByName(categoryName);
                            if (!string.IsNullOrEmpty(categoryName) && !categoryId.HasValue)
                            {
                                invalidCategories.Add(categoryName);
                                continue;
                            }

                            Guid? managerId = null;
                            if (!string.IsNullOrEmpty(managerEmail))
                            {
                                var manager = await _AccountRepository.GetAccountByEmail(managerEmail);
                                managerId = manager?.Id;
                                if (!managerId.HasValue)
                                {
                                    invalidManagers.Add(managerEmail);
                                    continue;
                                }
                            }


                            var room = new Room
                            {
                                Id = roomId,
                                Name = worksheet.Cells[row, 1].Value?.ToString()?.Trim(),
                                RoomNumber = worksheet.Cells[row, 2].Value?.ToString()?.Trim(),
                                Avatar = worksheet.Cells[row, 3].Value?.ToString()?.Trim(),
                                Rating = double.TryParse(worksheet.Cells[row, 4].Value?.ToString(), out double rating) ? rating : 0,
                                Capacity = int.TryParse(worksheet.Cells[row, 5].Value?.ToString(), out int capacity) ? capacity : 1,
                                GroupSize = int.TryParse(worksheet.Cells[row, 6].Value?.ToString(), out int groupSize) ? groupSize : 1,
                                TypeSlot = worksheet.Cells[row, 7].Value?.ToString()?.Trim(),
                                OnlyGroupStatus = bool.TryParse(worksheet.Cells[row, 8].Value?.ToString(), out bool onlyGroup) ? onlyGroup : false,
                                RoomStatus = 1,
                                BuildingId = buildingId,
                                CategoryRoomId = categoryId,
                                ManagerId = managerId
                            };

                            // Validation
                            var validationResults = new List<ValidationResult>();
                            var validationContext = new ValidationContext(room);
                            bool isValid = Validator.TryValidateObject(room, validationContext, validationResults, true);

                            if (isValid)
                            {
                                var roomExist = await _RoomRepository.GetRoomsById(roomId);
                                if (roomExist != null)
                                {
                                    _logger.LogInformation("Room Exist: {Room}", room.Name);
                                    duplicateRoomNumbers.Add(room.Name);
                                    continue;
                                }

                                await _RoomRepository.AddRoom(room);
                                _logger.LogInformation("Room Created: {Room}", room.Name);
                                roomsCreated.Add(room);
                            }
                        }
                    }
                }

                if (duplicateRoomNumbers.Any() || invalidBuildings.Any() || invalidCategories.Any() || invalidManagers.Any())
                {
                    return Ok(new
                    {
                        Message = "Rooms imported with some issues",
                        Count = roomsCreated.Count,
                        DuplicateRoomNumbers = duplicateRoomNumbers,
                        InvalidBuildings = invalidBuildings,
                        InvalidCategories = invalidCategories,
                        InvalidManagers = invalidManagers
                    });
                }

                return Ok(new
                {
                    Message = "Rooms imported successfully",
                    Count = roomsCreated.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing Excel file: {ex.Message}");
            }
        }
    }
}
