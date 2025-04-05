using BookLabModel.Model;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class RoleDAO : SingletonBase<RoleDAO>
    {
        public async Task<IEnumerable<Role>> GetAllRoles()
        {
            return await _context.Roles.ToListAsync();
        }
        public async Task<Role> GetRolesById(int id)
        {
            var roles = await _context.Roles.FirstOrDefaultAsync(c => c.Id == id);
            if (roles == null) return null;

            return roles;
        }
        public async Task AddRole(Role roles)
        {
            await _context.Roles.AddAsync(roles);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateRole(Role roles)
        {
            var existingItem = await GetRolesById(roles.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(roles);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteRole(int id)
        {
            var roles = await GetRolesById(id);

            if (roles != null)
            {
                _context.Roles.Remove(roles);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<bool> ChangeStatus(int id)
        {
            var role = await GetRolesById(id);
            role.Status = !role.Status;
            _context.SaveChanges();
            return role.Status;
        }
        public async Task<int> GetRoleIdByName(string roleName)
        {
            var roles = await _context.Roles.FirstOrDefaultAsync(c => c.Name == roleName);
            if (roles == null) return 3;

            return roles.Id;
        }
    }
}
