using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class CampusRepository : ICampusRepository
    {
        public async Task AddCampus(Campus campus)
        {
            await CampusDAO.Instance.AddCampus(campus);
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            return await CampusDAO.Instance.ChangeStatus(id);
        }

        public async Task DeleteCampus(Guid id)
        {
            await CampusDAO.Instance.DeleteCampus(id);
        }

        public async Task<IEnumerable<Campus>> GetAllCampuses()
        {
            return await CampusDAO.Instance.GetAllCampuses();
        }

        public async Task<Campus> GetCampusById(Guid id)
        {
            return await CampusDAO.Instance.GetCampusById(id);
        }

        public async Task UpdateCampus(Campus campus)
        {
            await CampusDAO.Instance.UpdateCampus(campus);
        }
        public async Task<Guid?> GetCampusIdByName(string campusName)
        {
            return await CampusDAO.Instance.GetCampusIdByName(campusName);
        }
    }
}
