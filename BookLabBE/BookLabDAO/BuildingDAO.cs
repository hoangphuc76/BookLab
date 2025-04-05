using BookLabDTO;
using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class BuildingDAO : SingletonBase<BuildingDAO>
    {
        public async Task<IEnumerable<Building>> GetAllBuildings()
        {
            return await _context.Buildings.ToListAsync();
            /*return await _context.Buildings.Include(c => c.Campus).ToListAsync();*/
        }
        public async Task<IEnumerable<BuildingDto>> GetAllBuildingsByCampusId(Guid id)
        {
            var buildings = await _context.Buildings
                .Include(c => c.Campus)
                .Where(b => b.CampusId == id && b.IsDeleted == false)
                .Select(b => new BuildingDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Avatar = b.Avatar,
                    Status = b.Status,
                    CampusId = b.CampusId,
                    RoomCount = b.Rooms.Count()
                })
                .ToListAsync();
            return buildings;
        }
        public async Task<BuildingDto> GetBuildingDtoById(Guid id)
        {
            var buildings = await _context.Buildings.Include(r => r.Rooms).FirstOrDefaultAsync(x => x.Id == id);


            if (buildings == null) return null;

            return new BuildingDto
            {
                Id = buildings.Id,
                Name = buildings.Name,
                Avatar = buildings.Avatar,
                Status = buildings.Status,
                CampusId = buildings.CampusId,
                RoomCount = buildings.Rooms.Count()
            };
        }
        public async Task<Building> GetBuildingById(Guid id)
        {
            var buildings = await _context.Buildings.FirstOrDefaultAsync(x => x.Id == id);

            if (buildings == null) return null;

            return buildings;
        }
        public async Task<Guid?> GetBuildingIdByName(string buildingName)
        {
            var buildings = await _context.Buildings.FirstOrDefaultAsync(x => x.Name == buildingName);

            if (buildings == null) return null;

            return buildings.Id;
        }
        public async Task AddBuilding(Building buildings)
        {
            await _context.Buildings.AddAsync(buildings);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateBuilding(Building buildings)
        {
            var existingItem = await GetBuildingById(buildings.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(buildings);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> DeleteBuilding(Guid id)
        {
            var buildings = await GetBuildingById(id);

            if (buildings != null)
            {
                buildings.IsDeleted = true;
                buildings.Status = !buildings.Status;
                _context.SaveChanges();
                return (bool)buildings.IsDeleted;
            }
            return false;
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            var buildings = await GetBuildingById(id);
            buildings.Status = !buildings.Status;
            _context.SaveChanges();
            return buildings.Status;
        }
    }
}
