using Amazon.S3.Model.Internal.MarshallTransformations;
using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using System.Security.Claims;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class StudentInGroupController : ODataController
    {
        private readonly IStudentInGroupRepository _StudentInGroupRepository;
        private readonly IStudentInBookingRepository _StudentInBookingRepository;
		private readonly IGroupRepository _groupRepository;
		public StudentInGroupController()
        {
            _StudentInGroupRepository = new StudentInGroupRepository();
            _StudentInBookingRepository = new StudentInBookingRepository();
            _groupRepository = new GroupRepository();

        }
        // GET: odata/<StudentInGroupController>
        [HttpGet("[controller]")]
        [EnableQuery]
        [Authorize]
        public async Task<IEnumerable<StudentInGroup>> GetStudentInGroups()
        {
            var listStudentInGroup = await _StudentInGroupRepository.GetAllStudentInGroups();
            return listStudentInGroup;
        }

        // GET odata/<StudentInGroupController>/5
        [HttpGet("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult<StudentInGroup>> GetStudentInGroup(Guid id)
        {
            var StudentInGroup = await _StudentInGroupRepository.GetStudentInGroupsById(id);
            if (StudentInGroup == null)
            {
                return NotFound();
            }
            return StudentInGroup;
        }

        // POST odata/<StudentInGroupController>
        [HttpPost("[controller]")]
        [Authorize]
        public async Task<ActionResult> PostStudentInGroup([FromBody] StudentInGroup StudentInGroup)
        {
            StudentInGroup.Id = Guid.NewGuid();
            await _StudentInGroupRepository.AddStudentInGroup(StudentInGroup);
            return Content("Insert success!");
        }

        // PUT odata/<StudentInGroupController>/5
        [HttpPut("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> PutStudentInGroup(Guid id, [FromBody] StudentInGroup StudentInGroup)
        {
            var temp = await _StudentInGroupRepository.GetStudentInGroupsById(id);
            if (temp == null)
            {
                return NoContent();
            }
            StudentInGroup.Id = id;
            await _StudentInGroupRepository.UpdateStudentInGroup(StudentInGroup);
            return Content("Update success!");
        }


        // DELETE odata/<StudentInGroupController>/5
        [HttpDelete("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> DeleteStudentInGroup(Guid id)
        {
            var temp = await _StudentInGroupRepository.GetStudentInGroupsById(id);
            var group = await _groupRepository.GetGroupsById(Guid.Parse(temp.GroupId.ToString()));
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (temp == null)
            {
                return NoContent();
            }
            if(group.LecturerId != Guid.Parse(userId))
            {
                return BadRequest("This student dont belong to you");
            }
            await _StudentInGroupRepository.DeleteStudentInGroup(id);
            return Content("Delete success!");



        }

        // POST odata/<StudentInGroupController>
        [HttpPost("[controller]/AddStudentsInGroup")]
        [Authorize]
        public async Task<ActionResult> PostStudentsInGroup([FromQuery] Guid groupId, [FromBody] List<Guid> ListStudentId)
        {
            Console.WriteLine("group id ne " + groupId);
            if (groupId == Guid.Empty)
            {
                return BadRequest("GroupId không hợp lệ.");
            }

            if (ListStudentId == null || !ListStudentId.Any())
            {
                return BadRequest("Danh sách studentId không hợp lệ.");
            }

            foreach (var studentId in ListStudentId)
            {
                var studentInGroup = new StudentInGroup
                {
                    Id = Guid.NewGuid(),
                    GroupId = groupId,
                    StudentId = studentId, 
                    Status = true
                };

                await _StudentInGroupRepository.AddStudentInGroup(studentInGroup);
            }
            return Ok("Insert success!");
        }
        [HttpGet("[controller]/getStudentInBooking")]
        [Authorize]
        [EnableQuery]
        public async Task<List<Guid>> getStudentInGroupOfBooking([FromQuery] Guid subBookingId)
        {
            var result = await _StudentInBookingRepository.getStudentInGroupOfBooking(subBookingId);
            return result;

        }

    }
}