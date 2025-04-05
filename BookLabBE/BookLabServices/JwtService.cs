
using System.Text.Json;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using BookLabRepositories;
using BookLabModel.Model;
using BookLabServices;
using Microsoft.Extensions.Configuration;
using BookLabDTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BookLab_Odata.Models;
using System.Security.Cryptography;
using BookLabDTO.GroupDetail;
using static System.Formats.Asn1.AsnWriter;
using static System.Net.WebRequestMethods;

public class JwtService(IRefreshTokenRepository _refreshTokenRepository, IAccountRepository _accountRepository, IConfiguration q, JwtSettings _jwtSettings) : IJwtService
{
    private readonly string _clientId = q["Authentication:Google:ClientId"],
                            _clientSecret = q["Authentication:Google:ClientSecret"],
                            _scope = q["Scope"],
                            _redirectUri = q["Authentication:Google:RedirectUri"];

    // Xác thực Google Token và trích xuất thông tin từ Google
    public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken)

    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
            return payload;
        }
        catch
        {
            return null;
        }
    }

    // Lấy Access Token từ Google
    public async Task<(TokenResponse, AccountDto)> ExchangeAuthorizationCodeForTokenAsync(string authorizationCode, string redirectUri)
    {
        using (var client = new HttpClient())
        {
            try
            {
                Console.WriteLine("client Id : " + _clientId);
                var values = new Dictionary<string, string>
                {
                    { "prompt", "consent" },
                    { "scope", _scope},
                    { "code", authorizationCode },
                    { "client_id", _clientId },
                    { "client_secret", _clientSecret },
                    { "redirect_uri", redirectUri},
                    { "grant_type", "authorization_code" }
                };

                var content = new FormUrlEncodedContent(values);
                var response = await client.PostAsync("https://oauth2.googleapis.com/token", content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Google OAuth Token Exchange Failed: {responseString}");
                }

                var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseString);
                if (tokenResponse == null)
                {
                    throw new Exception("Failed to deserialize token response");
                }
                /*System.IO.File.WriteAllText("D:\\.NET\\BookLab\\BookLabServices\\token.json", JsonSerializer.Serialize(tokenResponse));*/

                var payload = await VerifyGoogleTokenAsync(tokenResponse.IdToken);
                if (payload == null)
                {
                    throw new Exception("Failed to verify Google token");
                }

                var email = payload.Email;
                var name = payload.Name;
                var account = await _accountRepository.GetAccountByEmail(email);
                if (account == null)
                {
                    throw new Exception($"No account found for email: {email}");
                }

                tokenResponse.JwtToken = GenerateAccessToken(account);
                tokenResponse.JwtRefreshToken = GenerateRefreshToken().Token;
                var listRefreshToken = new List<RefreshToken>
                {
                    new RefreshToken()
                    {
                        AccountId = account.Id,
                        Token = tokenResponse.JwtRefreshToken,
                        Expires = DateTime.UtcNow.AddMonths(6), // Thời gian hết hạn theo Google
                        Created = DateTime.UtcNow
                    },
                    new RefreshToken()
                    {
                        AccountId = account.Id,
                        Token = tokenResponse.GoogleRefreshToken,
                        Expires = DateTime.UtcNow.AddMonths(6), // Thời gian hết hạn theo Google
                        Created = DateTime.UtcNow
                    }

                };
                await _refreshTokenRepository.Add(listRefreshToken);

                return (tokenResponse, account);
            }
            catch (HttpRequestException ex)
            {
                throw new Exception("Failed to communicate with Google OAuth service", ex);
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to process Google OAuth response", ex);
            }
        }
    }


    public async Task<TokenResponse> GetGoogleAccessTokenAsync(string refreshToken)
    {
        using (var client = new HttpClient())
        {
            var values = new Dictionary<string, string>
        {
            { "client_id", _clientId },
            { "client_secret", _clientSecret },
            { "refresh_token", refreshToken },
            { "grant_type", "refresh_token" }
        };

            var content = new FormUrlEncodedContent(values);
            var response = await client.PostAsync("https://oauth2.googleapis.com/token", content);
            var responseString = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<TokenResponse>(responseString);
        }
    }




    // Kiểm tra Refresh Token từ Google
    public async Task<RefreshToken> GetRefreshToken(string token)
    {
        return await _refreshTokenRepository.Get(token);
    }

    // Sinh Access Token
    public string GenerateAccessToken(AccountDto account)
    {
        var authClaims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, account.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, account.Gmail),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, account.RoleId.ToString())
            // Thêm các claims khác nếu cần
        };

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Sinh Refresh Token
    private RefreshToken GenerateRefreshToken()
    {
        var refreshToken = new RefreshToken
        {
            Token = GenerateRandomTokenString(),
            Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
            Created = DateTime.UtcNow
        };

        return refreshToken;
    }
    // Sinh chuỗi ngẫu nhiên cho Refresh Token
    private string GenerateRandomTokenString()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(64));
    }

    // Thu hồi Refresh Token từ Google
    public async Task RevokeRefreshToken(RefreshToken token)
    {
        _refreshTokenRepository.RevokeRefreshToken(token);
    }



    // Cấu hình đăng nhập thông qua Google Auth
    public AuthenticationProperties ConfigureExternalAuthenticationProperties(string provider, string redirectUrl)
    {
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        properties.Items["scheme"] = provider;
        return properties;
    }
}
