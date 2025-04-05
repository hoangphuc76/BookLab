using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class RefreshTokensDAO : SingletonBase<RefreshTokensDAO>
    {
        public async Task Add(List<RefreshToken> refreshToken)
        {
            await _context.RefreshTokens.AddRangeAsync(refreshToken);
            await _context.SaveChangesAsync();
        }
        public async Task<RefreshToken> Get(string token)
        {
            return await _context.RefreshTokens
                            .Include(rt => rt.Account)
                            .ThenInclude(a => a.AccountDetail)
                           .Where(r => r.Token == token && r.Expires > DateTime.UtcNow)
                           .FirstOrDefaultAsync();
        }
        public async Task RevokeRefreshToken(RefreshToken token)
        {
            var existingItem = await Get(token.Token);
            if (existingItem == null) return;
            token.Revoked = DateTime.UtcNow;
            _context.Entry(existingItem).CurrentValues.SetValues(token);
            await _context.SaveChangesAsync();
        }
    }
}
