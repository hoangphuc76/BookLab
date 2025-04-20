
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
using BookLabDAO;

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
                var formattedName = FormatVietnameseName(name); // Format the name
                var account = await _accountRepository.GetAccountByEmail(email);
                if (account == null)
                {
                    // Create new account with role ID 4
                    var acc = new Account()
                    {
                        Gmail = email,
                        AccountName = formattedName, // Use the formatted name
                        RoleId = 7,
                        CampusId = Guid.Parse("deef5929-7bba-46d8-ad05-f0c31ecefe15"), // Assuming 4 is the role ID for a new user
                        CreatedAt = DateTime.UtcNow,
                    };
                    account = new AccountDto()
                    {
                        Id = acc.Id,
                        Gmail = acc.Gmail,
                        AccountName = acc.AccountName,
                        RoleId = acc.RoleId,
                        CampusId = acc.CampusId,
                        CreatedAt = acc.CreatedAt ?? DateTime.UtcNow,
                    };

                    // Save the new account to the repository
                    await _accountRepository.AddAccount(acc);

                }


                tokenResponse.JwtToken = GenerateRandomTokenString();
                tokenResponse.JwtRefreshToken = GenerateRandomTokenString();
                var listRefreshToken = new List<RefreshToken>
                {
                    new RefreshToken()
                    {
                        AccountId = account.Id,
                        Token = tokenResponse.JwtRefreshToken,
                        Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays), // Thời gian hết hạn theo Google
                        Created = DateTime.UtcNow
                    },
                    new RefreshToken()
                    {
                        AccountId = account.Id,
                        Token = tokenResponse.GoogleRefreshToken,
                        Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays), // Thời gian hết hạn theo Google
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

    public async Task<(TokenResponse, AccountDto)> DemoLogin(string email)
    {
        try
        {
            // Find account by email
            var account = await _accountRepository.GetAccountByEmail(email);
            if (account == null)
            {
                throw new Exception($"Account with email {email} not found");
            }

            // Generate tokens
            var tokenResponse = new TokenResponse
            {
                JwtToken = GenerateAccessToken(account),
                JwtRefreshToken = GenerateRandomTokenString(),
                ExpiresIn = _jwtSettings.ExpiryInMinutes * 60, // Convert minutes to seconds
                TokenType = "Bearer"
            };

            // Save refresh token
            var refreshToken = new RefreshToken
            {
                AccountId = account.Id,
                Token = tokenResponse.JwtRefreshToken,
                Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
                Created = DateTime.UtcNow
            };

            await _refreshTokenRepository.Add(new List<RefreshToken> { refreshToken });

            return (tokenResponse, account);
        }
        catch (Exception ex)
        {
            throw new Exception($"Demo login failed: {ex.Message}", ex);
        }
    }

    private string FormatVietnameseName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return string.Empty;

        string[] nameParts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (nameParts.Length == 0)
            return string.Empty;

        if (nameParts.Length == 1)
            return nameParts[0]; // Just return the single name part

        // Get last name (last part of the full name)
        string lastName = nameParts[nameParts.Length - 1];

        // Build the initials from all other parts
        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < nameParts.Length - 1; i++)
        {
            if (!string.IsNullOrEmpty(nameParts[i]))
                initials.Append(char.ToUpper(nameParts[i][0]));
        }

        // Format: LastName + Initials
        return lastName + initials.ToString();
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
