using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface ICampusRepository
    {
        Task<IEnumerable<Campus>> GetAllCampuses();

        Task<Campus> GetCampusById(Guid id);

        Task AddCampus(Campus campus);

        Task UpdateCampus(Campus campus);

        Task DeleteCampus(Guid id);

        Task<bool> ChangeStatus(Guid id);
        Task<Guid?> GetCampusIdByName(string campusName);
    }
}
