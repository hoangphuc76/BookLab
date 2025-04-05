using BookLabDAO;
using BookLabModel.Model;
using BookLabDTO;
namespace BookLabRepositories
{
    public class BuildingRepository : IBuildingRepository
    {
        public async Task AddBuilding(Building buildings)
        {
            await BuildingDAO.Instance.AddBuilding(buildings);
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            return await BuildingDAO.Instance.ChangeStatus(id);
        }

        public async Task<bool> DeleteBuilding(Guid id)
        {
            return await BuildingDAO.Instance.DeleteBuilding(id);
        }
        public Task<Building> GetBuildingById(Guid id) => BuildingDAO.Instance.GetBuildingById(id);

        public async Task<IEnumerable<Building>> GetAllBuildings()
        {
            return await BuildingDAO.Instance.GetAllBuildings();
        }
        public async Task<IEnumerable<BuildingDto>> GetAllBuildingsByCampusId(Guid id)
        {
            return await BuildingDAO.Instance.GetAllBuildingsByCampusId(id);
        }
        public async Task<BuildingDto> GetBuildingDtoById(Guid id)
        {
            return await BuildingDAO.Instance.GetBuildingDtoById(id);
        }

        public async Task UpdateBuilding(Building buildings)
        {
            await BuildingDAO.Instance.UpdateBuilding(buildings);
        }
        public async Task<Guid?> GetBuildingIdByName(string buildingName)
        {
            return await BuildingDAO.Instance.GetBuildingIdByName(buildingName);
        }
    }
}
