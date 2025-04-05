    using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class CampusDAO : SingletonBase<CampusDAO>
    {
        public async Task<IEnumerable<Campus>> GetAllCampuses()
        {
            return await _context.Campuses.ToListAsync();
        }
        public async Task<Campus> GetCampusById(Guid id)
        {
            var campus = await _context.Campuses.FirstOrDefaultAsync(c => c.Id == id);
            if (campus == null) return null;

            return campus;
        }
        public async Task AddCampus(Campus campus)
        {
            await _context.Campuses.AddAsync(campus);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateCampus(Campus campus)
        {
            var existingItem = await GetCampusById(campus.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(campus);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteCampus(Guid id)
        {
            var campus = await GetCampusById(id);

            if (campus != null)
            {
                _context.Campuses.Remove(campus);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            var campus = await GetCampusById(id);
            campus.Status = !campus.Status;
            _context.SaveChanges();
            return campus.Status;
        }
        public async Task<Guid?> GetCampusIdByName(string campusName)
        {
            var campus = await _context.Campuses.FirstOrDefaultAsync(c => c.Name == campusName);
            if (campus == null) return null;

            return campus.Id;
        }
    }
}
