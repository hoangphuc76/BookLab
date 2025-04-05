using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class AccountDetailDAO : SingletonBase<AccountDetailDAO>
    {
        public async Task<IEnumerable<AccountDetail>> GetAllAccountDetails()
        {
            return await _context.AccountDetails.ToListAsync();
            /*return await _context.AccountDetails.Include(a => a.Account).ToListAsync();*/
        }
        public async Task<AccountDetail> GetAccountDetailsById(Guid id)
        {
            var accountDetails = await _context.AccountDetails.Include(a => a.Account).ThenInclude(s => s.Campus).FirstOrDefaultAsync(c => c.Id == id);
            if (accountDetails == null) return null;

            return accountDetails;
        }
        public async Task AddAccountDetail(AccountDetail accountDetails)
        {
            await _context.AccountDetails.AddAsync(accountDetails);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAccountDetail(AccountDetail accountDetails)
        {
            var existingItem = await GetAccountDetailsById(accountDetails.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(accountDetails);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAccountDetail(Guid id)
        {
            var accountDetails = await GetAccountDetailsById(id);

            if (accountDetails != null)
            {
                _context.AccountDetails.Remove(accountDetails);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<AccountDetail>> GetAllAccountDetailsByStudentCode(List<String> list, Guid lecturerId)
		{

            var lecturer = _context.Accounts.FirstOrDefault(a => a.Id == lecturerId);
			var student1 = _context.AccountDetails.Where(ad => list.Contains(ad.StudentId)).Include(ad => ad.Account).ToList();
            var student2 = student1.Where(s => s.Account.CampusId == lecturer.CampusId).ToList();
            var listAccountDetail = student2.Select(s => new AccountDetail
            {
                Id = s.Id,
                FullName = s.FullName,
                Telphone = s.Telphone,
                Avatar = s.Avatar,
                DOB = s.DOB,
                StudentId = s.StudentId


            });

            
			return listAccountDetail;
		}

        public async Task<IEnumerable<AccountDetail>> searchStudentByNameAndCode(string input)
        {
            var inputSearch = input.ToUpper();
            var result = await _context.AccountDetails.Where(ad => ad.StudentId != null && ad.StudentId.ToUpper().Contains(input)).Take(5).ToListAsync();
            return result;


        }

	}
}
