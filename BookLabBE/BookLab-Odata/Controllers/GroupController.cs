using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using Microsoft.Extensions.Configuration.UserSecrets;
using BookLabDTO.GroupDetail;
using Microsoft.AspNetCore.Authorization;
using BookLabDTO;


namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class GroupController : ODataController
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IStudentInGroupRepository _studentInGroupRepository;
        private readonly IAccountDetailRepository _accountDetailRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IGroupInBookingRepository _groupInBookingRepository;
        public GroupController()
        {
            _groupRepository = new GroupRepository();
            _studentInGroupRepository = new StudentInGroupRepository();
            _accountDetailRepository = new AccountDetailRepository();
            _accountRepository = new AccountRepository();
            _groupInBookingRepository = new GroupInBookingRepository();
        }
        // GET: odata/<RoleController>
        [HttpGet("[controller]")]
        [EnableQuery]
        [Authorize]
        public async Task<IEnumerable<Group>> GetGroups()
        {
            var listrole = await _groupRepository.GetAllGroups();
            return listrole;
        }

        // GET odata/<RoleController>/5
        [HttpGet("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult<GroupDetailDto>> GetGroup(Guid id)
        {
            var role = await _groupRepository.GetGroupsById(id);

            if (role == null)
            {
                return NotFound();
            }
            var groupDto = new GroupDetailDto
            {
                Id = role.Id,
                Name = role.Name,
                StudentInGroups = role.StudentInGroups.Where(sig => sig.IsDeleted == false).Select(sig => new StudentInGroupDetailDto
                {
                    StudentInGroupId = sig.Id,
                    StudentInGroupStatus = sig.Status,
                    StudentId = sig.Student.Id,
                    StudentName = sig.Student.AccountDetail.FullName,
                    Gmail = sig.Student.Gmail,
                    StudentCode = sig.Student.AccountDetail.StudentId,
                    Avatar = sig.Student.AccountDetail.Avatar,
                    Telphone = sig.Student.AccountDetail.Telphone,
                }).ToList(),

                completedBooking = role.GroupInBookings.Count(sig => sig.IsDeleted == false && sig.Booking.IsDeleted != null && sig.Booking.Approve == 10 && new DateTime() > sig.Booking.Date.Date.Add(sig.Booking.EndTime.ToTimeSpan())),
                upcomingBooking = role.GroupInBookings.Count(sig => sig.IsDeleted == false && sig.Booking.IsDeleted != null && sig.Booking.Approve == 10 && new DateTime() < sig.Booking.Date.Date.Date.Add(sig.Booking.EndTime.ToTimeSpan())),
                pendingBooking = role.GroupInBookings.Count(sig => sig.IsDeleted == false && sig.Booking.IsDeleted != null && sig.Booking.Approve == 0 && new DateTime() < sig.Booking.Date.Date.Date.Add(sig.Booking.StartTime.ToTimeSpan())),


            };
            return groupDto;
        }

        // POST odata/<RoleController>
        [HttpPost("[controller]")]
        [Authorize]
        public async Task<ActionResult> PostGroup([FromBody] Group group)
        {
            group.Id = Guid.NewGuid();
            await _groupRepository.AddGroup(group);
            return Content("Insert success!");
        }

        // PUT odata/<RoleController>/5
        //[HttpPut("[controller]({id})")]
        //[Authorize]
        //public async Task<ActionResult> PutGroup(Guid id, [FromBody] Group group)
        //{
        //    var temp = await _groupRepository.GetGroupsById(id);
        //    if (temp == null)
        //    {
        //        return NoContent();
        //    }
        //    group.Id = id;
        //    await _groupRepository.UpdateGroup(group);
        //    return Content("Update success!");
        //}

        // PUT odata/<RoleController>/5/status
        //[HttpPut("[controller]({id})/Status")]
        //[Authorize]
        //public async Task<ActionResult> PutGroupChangeStatus(Guid id)
        //{
        //    var temp = await _groupRepository.GetGroupsById(id);
        //    if (temp == null)
        //    {
        //        return NoContent();
        //    }
        //    temp.Status = !temp.Status;
        //    await _groupRepository.UpdateGroup(temp);
        //    return Content("Update success!");
        //}

        // DELETE odata/<RoleController>/5
        [HttpDelete("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> DeleteGroup(Guid id)
        {
            var temp = await _groupRepository.GetGroupsById(id);
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (temp == null)
            {
                return NoContent();
            }
            if (temp.LecturerId != Guid.Parse(userId))
            {
                return BadRequest("This group dont belong to you");
            }
            await _groupRepository.DeleteGroup(id);
            return Content("Delete success!");
        }

        [HttpGet("[controller]/checkstudentcode")]
        [EnableQuery]
        [Authorize]

        public async Task<IActionResult> GetAllAccountDetailsByStudentCode([FromHeader(Name = "list")] string listJSON)
        {
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (string.IsNullOrEmpty(userId))
			{
				return BadRequest("User ID not found in token");
			}
            Guid lecturerId = Guid.Parse(userId);
            List<string> list = JsonConvert.DeserializeObject<List<string>>(listJSON);
            var student = await _accountDetailRepository.GetAllAccountDetailsByStudentCode(list, lecturerId);
            return Ok(student);
        }

        [HttpPost("[controller]/AddGroups")]
        [Authorize]
        public async Task<IActionResult> AddGroups([FromBody] Dictionary<string, List<string>> groupData)
        {
            
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
     

            List<Group> listGroups = new List<Group>();
            List<StudentInGroup> studentInGroups = new List<StudentInGroup>();

            Guid lecturerId = Guid.Parse(userId);


            if (lecturerId == Guid.Empty)
            {
                return Unauthorized(new { message = "invalid user" });
            }

            Console.WriteLine("lecturer id : ------------ ", lecturerId);

            foreach (KeyValuePair<string, List<string>> kvp in groupData)
            {

                var list = kvp.Value;
                Group group = new Group
                {
                    Name = kvp.Key,
                    LecturerId = lecturerId,
                    Status = true,
                    Id = Guid.NewGuid()
                };
                listGroups.Add(group);

                foreach (var studentId in list)
                {

                    StudentInGroup studentInGroup = new StudentInGroup
                    {
                        Id = Guid.NewGuid(),
                        StudentId = Guid.Parse(studentId),
                        GroupId = group.Id,
                        Status = true
                    };
                    studentInGroups.Add(studentInGroup);


                }

            }

            try
            {
                await _groupRepository.AddGroups(listGroups, studentInGroups);

                var studentInGroupsFromDb = await _studentInGroupRepository.getListStudentInGroupbyGroupId(studentInGroups);

                var dictionaryGroupResult = studentInGroupsFromDb
                    .GroupBy(sig => sig.GroupId)
                    .ToDictionary(
                        group => group.Key,
                        group => group.ToList()
                    );

                // Trả về kết quả dưới dạng JSON
                return Ok(dictionaryGroupResult);
            }
            catch (Exception e)
            {
                Debug.WriteLine(e.Message);
                return StatusCode(500, "An error occurred while processing the request.");
            }
        }


        [HttpGet("[controller]/GetGroupsOfLecturer")]
        [EnableQuery]
        [Authorize]
        public async Task<IActionResult> GetGroupsOfLecturer()
        {


            try
            {
				// Retrieve the user ID from the token's claims
				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
				if (userId == null)
                {
                    return BadRequest("User ID not found in token");
                }
            

                var studentInGroupOfLecturer = await _studentInGroupRepository.GetAllStudentInGroupByTeacherId(Guid.Parse(userId));
                var dictionaryGroupResult = studentInGroupOfLecturer
                    .GroupBy(sig => sig.GroupId)
                    .ToDictionary(
                        group => group.Key,
                        group => group.ToList()
                    );
                return Ok(dictionaryGroupResult);


            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to decode token: {ex.Message}");
            }





        }

        //[HttpPost("[controller]/UpdateGroupByLecturer")]
        //[Authorize]
        //public async Task<IActionResult> updateGroup([FromBody] Dictionary<string, object> groupData)
        //{
        //    try
        //    {
        //        Guid groupId = Guid.Parse(Convert.ToString(groupData["groupId"]));
        //        string groupName = Convert.ToString(groupData["groupName"]);


        //        List<string> studentIdList = ((JsonElement)groupData["studentIdList"])
        //                    .EnumerateArray()
        //                    .Select(x => x.GetString())
        //                    .ToList();
        //        var result = await _groupRepository.UpdateGroupByLecturer(groupId, groupName, studentIdList);
        //        return Ok(result);

        //    }
        //    catch (Exception e)
        //    {
        //        return BadRequest("invalid data");

        //    }
        //}

        [HttpGet("[controller]/GetGroupInBooking")]
        [EnableQuery]
        [Authorize]
        public async Task<IActionResult> GetBookingOfGroup(

            [FromQuery] Guid groupId,
            [FromQuery] DateTime firstDateOfMonth,
            [FromQuery] DateTime endDateOfMonth)
        {

            try
            {

				var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

				if (userId == null)
                {
                    return BadRequest("User ID not found in token");
                }

                var result = await _groupInBookingRepository.GetGroupInBookingsByGroupId(groupId);
                return Ok(result);


            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to decode token: {ex.Message}");
            }





        }




    }
}
