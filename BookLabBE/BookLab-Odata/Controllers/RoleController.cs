using BookLabModel.Model;
using BookLabRepositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class RoleController (IRoleRepository _roleRepository) : ODataController
    {
        // GET: odata/<RoleController>
        [HttpGet("[controller]")]
        [EnableQuery]
        //[Authorize]
        public async Task<IEnumerable<Role>> GetRoles()
        {
            var listrole = await _roleRepository.GetAllRoles();
            return listrole;
        }

        // GET odata/<RoleController>/5
        [HttpGet("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult<Role>> GetRole(int id)
        {
            var role = await _roleRepository.GetRolesById(id);
            if (role == null)
            {
                return NotFound();
            }
            return role;
        }
        
        // POST odata/<RoleController>
        [HttpPost("[controller]")]
        [Authorize]
        public async Task<ActionResult> PostRole([FromBody] Role role)
        {
            await _roleRepository.AddRole(role);
            return Content("Insert success!");
        }

        // PUT odata/<RoleController>/5
        [HttpPut("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> PutRole(int id, [FromBody] Role role)
        {
            var temp = await _roleRepository.GetRolesById(id);
            if (temp == null)
            {
                return NoContent();
            }
            role.Id = id;
            await _roleRepository.UpdateRole(role);
            return Content("Update success!");
        }

        // PUT odata/<RoleController>/5/status
        [HttpPut("[controller]({id})/Status")]
        [Authorize]
        public async Task<ActionResult> PutRoleChangeStatus(int id)
        {
            var temp = await _roleRepository.GetRolesById(id);
            if (temp == null)
            {
                return NoContent();
            }
            temp.Status = !temp.Status;
            await _roleRepository.UpdateRole(temp);
            return Content("Update success!");
        }

        // DELETE odata/<RoleController>/5
        [HttpDelete("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> DeleteRole(int id)
        {
            var temp = await _roleRepository.GetRolesById(id);
            if (temp == null)
            {
                return NoContent();
            }
            await _roleRepository.DeleteRole(id);
            return Content("Delete success!");
        }
    }
}
