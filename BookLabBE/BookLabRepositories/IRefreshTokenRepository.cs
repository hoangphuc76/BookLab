using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model;
namespace BookLabRepositories
{
    public interface IRefreshTokenRepository
    {
        Task Add(List<RefreshToken> refreshToken);
        Task<RefreshToken> Get(string token);
        Task RevokeRefreshToken(RefreshToken token);
    }
}
