using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        public async Task Add(List<RefreshToken> refreshToken) => await RefreshTokensDAO.Instance.Add(refreshToken);

        public async Task<RefreshToken> Get(string token) => await RefreshTokensDAO.Instance.Get(token);
        public async Task RevokeRefreshToken(RefreshToken token) => await RefreshTokensDAO.Instance.RevokeRefreshToken(token);
    }
}
