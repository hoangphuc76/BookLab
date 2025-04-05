using Microsoft.AspNetCore.Mvc;
using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.OData.Edm;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using BookLabDTO.GroupDetail;
using BookLabServices;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class AccountController(IAccountRepository _accountRepository, IAwsS3Service _aws3Services, IAccountDetailRepository _accountDetailRepository, ICampusRepository _campusRepository, IRoleRepository _roleRepository, ILogger<BuildingController> _logger) : ODataController
    {
        // GET: odata/<RoleController>
        [HttpGet("[controller]")]
        [EnableQuery]
        public async Task<IEnumerable<Account>> GetAllAccounts()
        {
            var listrole = await _accountRepository.GetAllAccounts();
            return listrole;
        }
        [HttpGet("[controller]/gmail")]
        [EnableQuery]
        public async Task<AccountDto> GetAccounts(string gmail)
        {
            var listrole = await _accountRepository.GetAccountByEmail(gmail);
            return listrole;
        }

        // GET odata/<RoleController>/5
        [HttpGet("[controller]({id})")]
        public async Task<ActionResult<Account>> GetAccount(Guid id)
        {
            var role = await _accountRepository.GetAccountsById(id);
            if (role == null)
            {
                return NotFound();
            }
            return role;
        }

        // POST odata/<RoleController>
        [HttpPost("[controller]")]
        public async Task<ActionResult> PostAccount([FromForm] Account account, [FromForm] AccountDetail accountDetail, [FromForm] IFormFile? file)
        {
            account.Id = Guid.NewGuid();
            accountDetail.Id = account.Id; // Gán Id từ account để đồng bộ

            string imageUrl = null;

            if (file != null && file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    string fileName = $"{Guid.NewGuid()}_{file.FileName}"; // Đặt tên file ngẫu nhiên
                    imageUrl = await _aws3Services.UploadFileAsync(stream, fileName);
                }
                accountDetail.Avatar = imageUrl; // Gán URL ảnh vào accountDetail
            }

            // Save to database
            await _accountRepository.AddAccount(account);
            await _accountDetailRepository.AddAccountDetail(accountDetail);

            return Content("Insert success!");
        }

        // PUT odata/<RoleController>/5
        [HttpPut("[controller]({id})")]
        public async Task<ActionResult> PutAccount(Guid id, [FromBody] Account account)
        {
            var temp = await _accountRepository.GetAccountsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            account.Id = id;
            await _accountRepository.UpdateAccount(account);
            return Content("Update success!");
        }

        // PUT odata/<RoleController>/5/status
        [HttpPut("[controller]({id})/Status")]
        public async Task<ActionResult> PutAccountChangeStatus(Guid id)
        {
            var temp = await _accountRepository.GetAccountsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            temp.Status = !temp.Status;
            await _accountRepository.UpdateAccount(temp);
            return Content("Update success!");
        }

        // DELETE odata/<RoleController>/5
        [HttpDelete("[controller]({id})")]
        public async Task<ActionResult> DeleteAccount(Guid id)
        {
            var temp = await _accountRepository.GetAccountsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            await _accountRepository.DeleteAccount(id);
            return Content("Delete success!");
        }
        [HttpGet("[controller]/searchStudent")]
        //[Authorize]
        public async Task<IActionResult> searchStudentByNameAndCode([FromQuery] string input)
        {
            var result = await _accountDetailRepository.searchStudentByNameAndCode(input);
            return Ok(result);

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
                var accounts = new List<Account>();
                var duplicateEmails = new List<string>();
                var invalidRoles = new List<string>();
                var invalidCampuses = new List<string>();
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
                            var gmailCell = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                            if (string.IsNullOrEmpty(gmailCell)) // Nếu cột Gmail trống, dừng lại
                            {
                                _logger.LogInformation("Stopped at row {Row} due to empty data", row);
                                break; // Thoát vòng lặp
                            }
                            var accountId = Guid.NewGuid();
                            var roleName = worksheet.Cells[row, 8].Value?.ToString()?.Trim();
                            var campusName = worksheet.Cells[row, 9].Value?.ToString()?.Trim();
                            int roleId;
                            try
                            {
                                roleId = await _roleRepository.GetRoleIdByName(roleName);
                            }
                            catch (Exception)
                            {
                                invalidRoles.Add(roleName);
                                continue;
                            }
                            Guid? campusId = null;
                            if (!string.IsNullOrEmpty(campusName))
                            {
                                campusId = await _campusRepository.GetCampusIdByName(campusName);
                                if (!campusId.HasValue)
                                {
                                    invalidCampuses.Add(campusName);
                                    continue;
                                }
                            }
                            var account = new Account
                            {
                                Id = accountId,
                                Gmail = worksheet.Cells[row, 1].Value?.ToString()?.Trim(),
                                AccountName = worksheet.Cells[row, 6].Value?.ToString()?.Trim(),
                                Status = bool.TryParse(worksheet.Cells[row, 7].Value?.ToString(), out bool status) ? status : true,
                                RoleId = roleId,
                                CampusId = campusId,
                                CreatedAt = DateTime.Now,
                                CreatedBy = Guid.Parse(userId)
                            };

                            var accountDetail = new AccountDetail
                            {
                                Id = accountId,
                                FullName = worksheet.Cells[row, 2].Value?.ToString()?.Trim(),
                                Telphone = worksheet.Cells[row, 3].Value?.ToString()?.Trim(),
                                StudentId = worksheet.Cells[row, 4].Value?.ToString()?.Trim(),
                                DOB = DateTime.TryParse(worksheet.Cells[row, 5].Value?.ToString(), out DateTime dob) ? dob : DateTime.Now,
                                CreatedAt = DateTime.Now,
                                CreatedBy = Guid.Parse(userId)
                            };

                            // Validation
                            var accountValidationResults = new List<ValidationResult>();
                            var detailValidationResults = new List<ValidationResult>();

                            var accountContext = new ValidationContext(account);
                            var detailContext = new ValidationContext(accountDetail);

                            bool isAccountValid = Validator.TryValidateObject(account, accountContext, accountValidationResults, true);
                            bool isDetailValid = Validator.TryValidateObject(accountDetail, detailContext, detailValidationResults, true);

                            if (isAccountValid && isDetailValid)
                            {
                                var existingAccount = await _accountRepository.GetAccountByEmail(account.Gmail);
                                if (existingAccount != null)
                                {
                                    _logger.LogInformation("Account Exist: {Email}", account.Gmail);
                                    duplicateEmails.Add(account.Gmail);
                                    continue; // Bỏ qua record này
                                }
                                await _accountRepository.AddAccount(account);
                                _logger.LogInformation("Account Created: {Email}", account.Gmail);
                                await _accountDetailRepository.AddAccountDetail(accountDetail);
                                _logger.LogInformation("AccountDetail Created: {Email}", accountDetail.FullName);
                                accounts.Add(account);
                            }
                            // Bạn có thể lưu lỗi validation nếu muốn
                        }
                    }
                }
                if (duplicateEmails.Any() || invalidRoles.Any() || invalidCampuses.Any())
                {
                    return Ok(new
                    {
                        Message = "Accounts imported with some issues",
                        Count = accounts.Count,
                        DuplicateEmails = duplicateEmails,
                        InvalidRoles = invalidRoles,
                        InvalidCampuses = invalidCampuses
                    });
                }

                return Ok(new
                {
                    Message = "Accounts imported successfully",
                    Count = accounts.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error at:", ex.InnerException);
                return StatusCode(500, $"Error processing Excel file: {ex.Message}");
            }
        }
    }
}
