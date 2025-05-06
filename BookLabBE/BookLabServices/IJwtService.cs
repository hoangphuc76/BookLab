using BookLabDAO;
using BookLabModel.Model;
using Microsoft.AspNetCore.Authentication;
using Google.Apis.Auth;
using BookLabDTO;
using BookLabDTO.GroupDetail;

namespace BookLabServices
{
    public interface IJwtService
    {
        Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken);
        Task<(TokenResponse, AccountDto)> ExchangeAuthorizationCodeForTokenAsync(string authorizationCode, string redirectUri);
        Task<RefreshToken> GetRefreshToken(string token);
        string GenerateAccessToken(AccountDto account);
        Task RevokeRefreshToken(RefreshToken token);
        AuthenticationProperties ConfigureExternalAuthenticationProperties(string provider, string redirectUrl);
        Task<TokenResponse> GetGoogleAccessTokenAsync(string refreshToken);
    }
}
