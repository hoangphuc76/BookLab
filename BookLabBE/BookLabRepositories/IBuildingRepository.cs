using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO;
namespace BookLabRepositories
{
    public interface IBuildingRepository
    {
        Task<IEnumerable<Building>> GetAllBuildings();
        Task<IEnumerable<BuildingDto>> GetAllBuildingsByCampusId(Guid id);
        Task<BuildingDto> GetBuildingDtoById(Guid id);
        Task<Guid?> GetBuildingIdByName(string buildingName);
        Task<Building> GetBuildingById(Guid id);

        Task AddBuilding(Building buildings);

        Task UpdateBuilding(Building buildings);

        Task<bool> DeleteBuilding(Guid id);

        Task<bool> ChangeStatus(Guid id);
    }
}
