using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using System.Data;
using BookLabDTO;
using AutoMapper;
using BookLabServices;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.ComponentModel.DataAnnotations;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class BuildingController(IBuildingRepository _buildingRepository, ICampusRepository _campusRepository, ILogger<BuildingController> _logger, IMapper _mapper, IAwsS3Service _aws3Services) : ODataController
    {

        [HttpGet("[controller]")]
        [EnableQuery]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<BuildingDto>>> GetBuildings()
        {
            _logger.LogInformation("Getting all buildings");
            try
            {
                var buildings = await _buildingRepository.GetAllBuildings();
                var dtos = _mapper.Map<IEnumerable<BuildingDto>>(buildings);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting buildings");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("[controller]byCampus/{cid}")]
        [EnableQuery]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<BuildingDto>>> GetBuildingsByCampusId(Guid cid)
        {
            _logger.LogInformation("Getting all buildings By CampusId");
            try
            {
                var buildings = await _buildingRepository.GetAllBuildingsByCampusId(cid);
                return Ok(buildings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting buildings");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("[controller]/{id}")]
        //[Authorize]
        public async Task<ActionResult<BuildingDto>> GetBuilding(Guid id)
        {
            _logger.LogInformation("Getting building with ID: {BuildingId}", id);
            try
            {
                var building = await _buildingRepository.GetBuildingDtoById(id);
                if (building == null)
                {
                    _logger.LogWarning("Building not found with ID: {BuildingId}", id);
                    return NotFound();
                }
                return Ok(building);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building with ID: {BuildingId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("[controller]")]
        //[Authorize]
        public async Task<ActionResult> PostBuilding([FromForm] BuildingDto buildingDto, [FromForm] IFormFile? file)
        {
            _logger.LogInformation("Creating new building");
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                string imageUrl = null;

                if (file != null && file.Length > 0)
                {
                    using (var stream = file.OpenReadStream())
                    {
                        string fileName = $"{Guid.NewGuid()}_{file.FileName}"; // Đặt tên file ngẫu nhiên
                        imageUrl = await _aws3Services.UploadFileAsync(stream, fileName);
                    }
                }

                var building = _mapper.Map<Building>(buildingDto);
                building.Id = Guid.NewGuid();
                building.CampusId = buildingDto.CampusId;
                building.Avatar = imageUrl; // Gán URL ảnh vào entity
                building.CreatedAt = DateTime.Now;
                building.CreatedBy = Guid.Parse(userId);

                await _buildingRepository.AddBuilding(building);
                _logger.LogInformation("Created building with ID: {BuildingId}", building.Id);

                return Ok(new { message = "Insert success!", buildingId = building.Id, imageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating building");
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpPut("[controller]({id})")]
        //[Authorize]
        public async Task<ActionResult> PutBuilding(Guid id, [FromForm] BuildingDto buildingDto, [FromForm] IFormFile? file)
        {
            _logger.LogInformation("Updating building with ID: {BuildingId}", id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                string imageUrl = null;

                if (file != null && file.Length > 0)
                {
                    using (var stream = file.OpenReadStream())
                    {
                        string fileName = $"{Guid.NewGuid()}_{file.FileName}"; // Đặt tên file ngẫu nhiên
                        imageUrl = await _aws3Services.UploadFileAsync(stream, fileName);
                    }
                }
                var existing = await _buildingRepository.GetBuildingById(id);
                if (existing == null)
                {
                    _logger.LogWarning("Building not found with ID: {BuildingId}", id);
                    return NotFound();
                }
                var building = _mapper.Map<Building>(buildingDto);
                building.Id = id;
                building.CampusId = buildingDto.CampusId;
                building.UpdatedAt = DateTime.Now;
                building.UpdatedBy = Guid.Parse(userId);
                if (imageUrl != null)
                {
                    building.Avatar = imageUrl;
                }
                else
                {
                    building.Avatar = buildingDto.Avatar;
                }
                await _buildingRepository.UpdateBuilding(building);
                _logger.LogInformation("Updated building with ID: {BuildingId}", id);
                return Ok("Update success!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating building with ID: {BuildingId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("[controller]/{id}/Status")]
        //[Authorize]
        public async Task<ActionResult> PutBuildingChangeStatus(Guid id)
        {
            _logger.LogInformation("Changing status for building with ID: {BuildingId}", id);
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                var building = await _buildingRepository.GetBuildingById(id);
                if (building == null)
                {
                    _logger.LogWarning("Building not found with ID: {BuildingId}", id);
                    return NotFound();
                }
                building.UpdatedAt = DateTime.Now;
                building.UpdatedBy = Guid.Parse(userId);
                await _buildingRepository.UpdateBuilding(building);
                await _buildingRepository.ChangeStatus(id);
                _logger.LogInformation("Changed status to {Status} for building with ID: {BuildingId}",
                    building.Status, id);
                return Ok("Update success!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing status for building with ID: {BuildingId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("[controller]({id})")]
        //[Authorize]
        public async Task<ActionResult> DeleteBuilding(Guid id)
        {
            _logger.LogInformation("Deleting building with ID: {BuildingId}", id);
            try
            {
                var building = await _buildingRepository.GetBuildingById(id);
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (building == null)
                {
                    _logger.LogWarning("Building not found with ID: {BuildingId}", id);
                    return NotFound();
                }
                building.RemovedAt = DateTime.Now;
                building.RemovedBy = Guid.Parse(userId);
                await _buildingRepository.DeleteBuilding(id);
                _logger.LogInformation("Deleted building with ID: {BuildingId}", id);
                return Ok("Delete success!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting building with ID: {BuildingId}", id);
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpPost("[controller](upload-excel)")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please upload an Excel file");

            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Please upload a valid Excel file (.xlsx)");
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                var buildings = new List<BuildingDto>();

                // Cấu hình license cho EPPlus
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets[0]; // Lấy sheet đầu tiên
                        var rowCount = worksheet.Dimension.Rows;

                        // Giả sử dữ liệu bắt đầu từ row 2 (row 1 là header)
                        for (int row = 2; row <= rowCount; row++)
                        {
                            var campusName = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                            Guid? campusId = null;
                            if (!string.IsNullOrEmpty(campusName))
                            {
                                campusId = await _campusRepository.GetCampusIdByName(campusName);
                                if (!campusId.HasValue)
                                {
                                    continue;
                                }
                            }
                            var building = new BuildingDto
                            {
                                Id = Guid.NewGuid(),
                                Name = worksheet.Cells[row, 1].Value?.ToString()?.Trim(),
                                Avatar = worksheet.Cells[row, 2].Value?.ToString()?.Trim(),
                                Status = bool.TryParse(worksheet.Cells[row, 3].Value?.ToString(), out bool status) ? status : true,
                                CampusId = campusId
                            };

                            // Validate building data
                            var validationResults = new List<ValidationResult>();
                            var validationContext = new ValidationContext(building);
                            bool isValid = Validator.TryValidateObject(building, validationContext, validationResults, true);

                            if (isValid)
                            {
                                
                                buildings.Add(building);
                            }
                            // Bạn có thể xử lý lỗi validation ở đây nếu muốn
                        }
                    }
                }

                // Lưu vào database
                foreach (var building in buildings)
                {
                    var buildingEntity = new Building // Thay bằng entity của bạn
                    {
                        Id = building.Id,
                        Name = building.Name,
                        Avatar = building.Avatar,
                        Status = building.Status,
                        CampusId = building.CampusId,
                        CreatedAt = DateTime.Now,
                        CreatedBy = Guid.Parse(userId)
                    };
                    await _buildingRepository.AddBuilding(buildingEntity);
                    _logger.LogInformation("Building Created: {Building}", building.Name);
                }

                return Ok(new
                {
                    Message = "Buildings imported successfully",
                    Count = buildings.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing Excel file: {ex.Message}");
            }
        }

    }
}
