using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IAccountDetailRepository
    {
        Task<IEnumerable<AccountDetail>> GetAllAccountDetails();

        Task<AccountDetail> GetAccountDetailsById(Guid id);

        Task AddAccountDetail(AccountDetail accountDetails);

        Task UpdateAccountDetail(AccountDetail accountDetails);

        Task DeleteAccountDetail(Guid id);
        Task<IEnumerable<AccountDetail>> GetAllAccountDetailsByStudentCode(List<String> list, Guid lecturerId);
        Task<IEnumerable<AccountDetail>> searchStudentByNameAndCode(string input);

	}
}
