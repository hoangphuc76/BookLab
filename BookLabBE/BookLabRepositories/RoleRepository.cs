using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class RoleRepository : IRoleRepository
    {
        public async Task AddRole(Role roles)
        {
            await RoleDAO.Instance.AddRole(roles);
        }

        public async Task<bool> ChangeStatus(int id)
        {
            return await RoleDAO.Instance.ChangeStatus(id);
        }

        public async Task DeleteRole(int id)
        {
            await RoleDAO.Instance.DeleteRole(id);
        }

        public async Task<IEnumerable<Role>> GetAllRoles()
        {
            return await RoleDAO.Instance.GetAllRoles();
        }

        public async Task<Role> GetRolesById(int id)
        {
            return await RoleDAO.Instance.GetRolesById(id);
        }

        public async Task UpdateRole(Role roles)
        {
            await RoleDAO.Instance.UpdateRole(roles);
        }
        public async Task<int> GetRoleIdByName(string roleName)
        {
            return await RoleDAO.Instance.GetRoleIdByName(roleName);
        }
    }
}
