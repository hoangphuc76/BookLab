using BookLabDTO;
using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using BookLabDTO.GroupDetail;
using BookLabModel;

namespace BookLabDAO
{
    public class AccountDAO : SingletonBase<AccountDAO>
    {
        public async Task<IEnumerable<Account>> GetAllAccounts()
        {
            return await _context.Accounts.AsNoTracking().Include(a => a.AccountDetail).ToListAsync();
            /*return await _context.Accounts.Include(a => a.Room).Include(a => a.Role).ToListAsync();*/
        }
        public async Task<Account> GetAccountsById(Guid id)
        {
            var accounts = await _context.Accounts.Include(a => a.AccountDetail).FirstOrDefaultAsync(a => a.Id.Equals(id));

            if (accounts == null) return null;

            return accounts;
        }

        public async Task<AccountDto> GetAccountDetaiById(Guid id)
        {
            var accounts = await _context.Accounts.AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new AccountDto
                {
                    Id = c.Id,
                    Gmail = c.Gmail,
                    QrCode = c.QrCode,
                    Status = c.Status,
                    AccountName = c.AccountName,
                    CampusId = c.CampusId,
                    CampusName = c.Campus == null ? null : c.Campus.Name,
                    AccountDetail = c.AccountDetail == null
                        ? null
                        : new AccountDetailDto
                        {
                            Id = c.AccountDetail.Id,
                            FullName = c.AccountDetail.FullName,
                            Telphone = c.AccountDetail.Telphone,
                            StudentId = c.AccountDetail.StudentId,
                            Avatar = c.AccountDetail.Avatar,
                            DOB = c.AccountDetail.DOB,
                        }
                }).FirstOrDefaultAsync();
            if (accounts == null) return null;

            return accounts;

        }
        public async Task<AccountDto> GetAccountByEmail(string email)
        {
            using (var context = new BookLabContext())
            {
                var accounts = await context.Accounts.AsNoTracking().
                    Where(c => c.Gmail == email).
                    Select(c => new AccountDto
                    {
                        Id = c.Id,
                        Gmail = c.Gmail,
                        QrCode = c.QrCode,
                        Status = c.Status,
                        RoleId = c.RoleId,
                        CampusId = c.CampusId,
                        AccountName = c.AccountName,
                    }).
                    FirstOrDefaultAsync();
                if (accounts == null) return null;

                return accounts;
            }

        }
        public async Task AddAccount(Account accounts)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    await _context.Accounts.AddAsync(accounts);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw ex;
                }
            }
        }
        public async Task UpdateAccount(Account accounts)
        {
            var existingItem = await GetAccountsById(accounts.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(accounts);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteSoftAccount(Account accounts)
        {
            await _context.Accounts.Where(x => x.Id == accounts.Id).
                  ExecuteUpdateAsync(set => set.SetProperty(a => a.IsDeleted, true));
        }
        public async Task DeleteAccount(Guid id)
        {
            var accounts = await GetAccountsById(id);

            if (accounts != null)
            {
                _context.Accounts.Remove(accounts);
                await _context.SaveChangesAsync();
            }
        }
        public async Task ChangeStatus(Guid id)
        {
            await _context.Accounts.Where(x => x.Id == id).
                ExecuteUpdateAsync(set => set.SetProperty(a => a.Status, b => !b.Status));
        }

        public async Task<Guid> GetAccountIdByAccountName(string accountName)
        {
            var accountId = await _context.Accounts.
                                Where(r => r.AccountName == accountName)
                                .Select(r => r.Id)
                                .FirstOrDefaultAsync();
            return accountId;
        }


    }
}
