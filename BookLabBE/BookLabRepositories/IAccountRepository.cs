using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO.GroupDetail;

namespace BookLabRepositories
{
    public interface IAccountRepository
    {
        Task<IEnumerable<Account>> GetAllAccounts();

        Task<Account> GetAccountsById(Guid id);

        Task AddAccount(Account accounts);

        Task UpdateAccount(Account accounts);
        Task<AccountDto> GetAccountDetaiById(Guid id);
        Task DeleteAccount(Guid id);

        Task ChangeStatus(Guid id);

        Task<AccountDto> GetAccountByEmail(string email);

        Task DeleteSoftAccount(Account accounts);

        Task<Guid> GetAccountIdByAccountName(string accountName);
    }
}
