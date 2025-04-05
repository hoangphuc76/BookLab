using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class AccountDetailRepository : IAccountDetailRepository
    {
        public async Task AddAccountDetail(AccountDetail accountDetails)
        {
            await AccountDetailDAO.Instance.AddAccountDetail(accountDetails);
        }

        public async Task DeleteAccountDetail(Guid id)
        {
            await AccountDetailDAO.Instance.DeleteAccountDetail(id);
        }

        public async Task<AccountDetail> GetAccountDetailsById(Guid id)
        {
            return await AccountDetailDAO.Instance.GetAccountDetailsById(id);
        }

        public async Task<IEnumerable<AccountDetail>> GetAllAccountDetails()
        {
            return await AccountDetailDAO.Instance.GetAllAccountDetails();
        }

        public async Task UpdateAccountDetail(AccountDetail accountDetails)
        {
            await AccountDetailDAO.Instance.UpdateAccountDetail(accountDetails);
        }
		public async Task<IEnumerable<AccountDetail>> GetAllAccountDetailsByStudentCode(List<String> list, Guid lecturerId)
        {
            return await AccountDetailDAO.Instance.GetAllAccountDetailsByStudentCode(list, lecturerId);
        }
		public async Task<IEnumerable<AccountDetail>> searchStudentByNameAndCode(string input)
        {
            return await AccountDetailDAO.Instance.searchStudentByNameAndCode(input);
        }


	}
}
