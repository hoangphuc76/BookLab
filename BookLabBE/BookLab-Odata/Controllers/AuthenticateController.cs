using BookLabRepositories;
using BookLabServices;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BookLabDTO.GroupDetail;
using BookLabDTO;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Caching.Memory;

namespace BookLab_Odata.Controllers
{
    [Route("odata/[controller]")]
    [ApiController]
    public class AuthenticateController(IJwtService _jwtService, ILogger<AuthenticateController> _logger, IAccountRepository _accountRepository, IAccountDetailRepository _accountDetailRepository ,IMemoryCache memoryCache) : ControllerBase
    {
        [HttpPost("google-response")]
        public async Task<IActionResult> GoogleResponse([FromBody] GoogleLoginRequest request)
        {
            Console.WriteLine("how to ---- : " + request.Token + " -------- " + request.RedirectUri);
        _logger.LogInformation("Processing Google authentication response.");

        if (string.IsNullOrEmpty(request.Token))
        {
            _logger.LogWarning("No token provided in request.");
            return BadRequest(new { message = "Token is required" });
        }
    
        try
        {
            var (responseToken, account) = await _jwtService.ExchangeAuthorizationCodeForTokenAsync(request.Token, request.RedirectUri);
            var accessToken = responseToken.AccessToken;
            if (!memoryCache.TryGetValue("AccessToken", out string AccessToken))
            {
                memoryCache.Set("AccessToken", accessToken, TimeSpan.FromMinutes(60));
            }
            
            Response.Cookies.Append("access_token", responseToken.JwtToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Chỉ gửi qua HTTPS
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(15) // Thời gian sống ngắn
            });
    
            Response.Cookies.Append("GoogleRefreshToken", responseToken.GoogleRefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMonths(6)
            });
            Response.Cookies.Append("JwtRefreshToken", responseToken.JwtRefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMonths(6)
            });
            _logger.LogInformation("Google authentication successful for email: {Email}", account.Gmail);
            return Ok(new
            {
                roleId = account.RoleId,
                campusId = account.CampusId,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during authentication");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred" });
        }
    }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            _logger.LogInformation("Processing refresh token request.");

            var refreshToken = Request.Cookies["JwtRefreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Refresh token not provided in request.");
                return Unauthorized(new { message = "Refresh token not provided" });
            }

            var existingRefreshToken = await _jwtService.GetRefreshToken(refreshToken);
            if (existingRefreshToken == null || existingRefreshToken.Expires <= DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid or expired refresh token.");
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }

            var account = existingRefreshToken.Account;
            var accountDto = new AccountDto  
            {
                Id = account.Id,
                Gmail = account.Gmail,
                QrCode = account.QrCode,
                Status = account.Status,
                RoleId = account.RoleId,
                AccountName = account.AccountName,
            };
            _logger.LogInformation("Refreshing tokens for account ID: {AccountId}", account.Id);

            // Lấy Access Token mới từ Google
            var newAccessToken = await _jwtService.GetGoogleAccessTokenAsync(existingRefreshToken.Token);
            if (!memoryCache.TryGetValue("AccessToken", out string AccessToken))
            {
                memoryCache.Set("AccessToken", newAccessToken, TimeSpan.FromMinutes(60));
            }

            var newJwtToken = _jwtService.GenerateAccessToken(accountDto);
            _logger.LogInformation("Refresh token process completed successfully.");
            Response.Cookies.Append("access_token", newJwtToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Chỉ gửi qua HTTPS
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(15) // Thời gian sống ngắn
            });
            return Ok();
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            // Lấy Id từ claim "sub"
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID not found in token.");
            }
            var accountDetail = await _accountRepository.GetAccountDetaiById(Guid.Parse(userId));

            // Trả về thông tin từ token
            return Ok(accountDetail);
        }
        
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            var cookieOptions = new CookieOptions
            {
                Expires = DateTime.UtcNow.AddDays(-1),
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            };

            Response.Cookies.Append("access_token", "", cookieOptions);
            Response.Cookies.Append("GoogleRefreshToken", "", cookieOptions);
            Response.Cookies.Append("JwtRefreshToken", "", cookieOptions);
            Response.Cookies.Append("refreshToken", "", cookieOptions);

            return Ok(new { message = "Logged out" });
        }
    }
}
