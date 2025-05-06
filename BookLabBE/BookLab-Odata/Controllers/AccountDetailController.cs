
using System.Web.Http;
using AutoMapper;
using BookLabDAO;
using BookLabDTO.GroupDetail;
using BookLabModel.Model;
using BookLabRepositories;
using BookLabServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace BookLab_Odata.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("odata")]
    [ApiController]
    public class AccountDetailController(
        IAccountDetailRepository _accountDetailRepository,
        IAwsS3Service _aws3Services,
		 IMapper _mapper,

		ILogger<AccountDetailController> _logger
        ) : ODataController
    {

        // GET: odata/<AccountDetailController>
        [Microsoft.AspNetCore.Mvc.HttpGet("[controller]")]
        [EnableQuery]
        [Authorize]
        public async Task<IEnumerable<AccountDetail>> GetAllAccountDetails()
        {
            var listAccountDetails = await _accountDetailRepository.GetAllAccountDetails();
            return listAccountDetails;
        }

        // GET odata/<AccountDetailController>/5
        [Microsoft.AspNetCore.Mvc.HttpGet("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult<AccountDetail>> GetAccountDetail(Guid id)
        {
            var accountDetail = await _accountDetailRepository.GetAccountDetailsById(id);
            if (accountDetail == null)
            {
                return NotFound();
            }
            return accountDetail;
        }

        //PUT odata/<AccountDetailController>/5
        [Microsoft.AspNetCore.Mvc.HttpPut("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> PutAccount(Guid id, [FromForm] AccountDetailDto accountDetail, [FromForm] IFormFile? file)
        {
            _logger.LogInformation("Updating AccountDetail with ID: {AccountDetailId}", id);
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

                var existing = await _accountDetailRepository.GetAccountDetailsById(id);
                if (existing == null)
                {
                    _logger.LogWarning("AccountDetail not found with ID: {AccountDetailId}", id);
                    return NotFound();
                }
                existing.FullName = accountDetail.FullName;
                existing.Telphone = accountDetail.Telphone;
                existing.DOB = accountDetail.DOB;
                existing.StudentId = accountDetail.StudentId;
                if (imageUrl != null)
                {
                    existing.Avatar = imageUrl;
                }
                else
                {
                    existing.Avatar = accountDetail.Avatar;
                }


                await _accountDetailRepository.UpdateAccountDetail(existing);
                _logger.LogInformation("Updated AccountDetail with ID: {AccountDetailId}", id);
                return Ok("Update success!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating AccountDetail with ID: {AccountDetailId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE odata/<AccountDetailController>/5
        [Microsoft.AspNetCore.Mvc.HttpDelete("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> DeleteAccount(Guid id)
        {
            var temp = await _accountDetailRepository.GetAccountDetailsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            await _accountDetailRepository.DeleteAccountDetail(id);
            return Content("Delete success!");
        }

    }
}
