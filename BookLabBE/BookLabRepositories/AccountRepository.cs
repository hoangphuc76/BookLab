using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO.GroupDetail;

namespace BookLabRepositories
{
    public class AccountRepository : IAccountRepository
    {
        public async Task AddAccount(Account accounts)
        {
            await AccountDAO.Instance.AddAccount(accounts);
        }

        public async Task<AccountDto> GetAccountByEmail(string email)
        {
            return await AccountDAO.Instance.GetAccountByEmail(email);
        }

        public Task<AccountDto> GetAccountDetaiById(Guid id)
        {
            return AccountDAO.Instance.GetAccountDetaiById(id);
        }

        public Task DeleteSoftAccount(Account accounts)
        {   
            return AccountDAO.Instance.DeleteSoftAccount(accounts);
        }
        public async Task ChangeStatus(Guid id)
        {
            await AccountDAO.Instance.ChangeStatus(id);
        }

        public async Task DeleteAccount(Guid id)
        {
            await AccountDAO.Instance.DeleteAccount(id);
        }

        public Task<Account> GetAccountsById(Guid id)
        {
            return AccountDAO.Instance.GetAccountsById(id);
        }

        public async Task<IEnumerable<Account>> GetAllAccounts()
        {
            return await AccountDAO.Instance.GetAllAccounts();
        }

        public async Task UpdateAccount(Account accounts)
        {
            await AccountDAO.Instance.UpdateAccount(accounts);
        }

        public async Task<Guid> GetAccountIdByAccountName(string accountName)
        {
            return await AccountDAO.Instance.GetAccountIdByAccountName(accountName);
        }
    }
}
