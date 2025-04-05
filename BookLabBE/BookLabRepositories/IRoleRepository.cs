using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IRoleRepository
    {
        Task<IEnumerable<Role>> GetAllRoles();

        Task<Role> GetRolesById(int id);

        Task AddRole(Role roles);

        Task UpdateRole(Role roles);

        Task DeleteRole(int id);

        Task<bool> ChangeStatus(int id);
        Task<int> GetRoleIdByName(string roleName);
    }
}
