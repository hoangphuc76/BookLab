using BookLabServices;
using Microsoft.AspNetCore.Mvc;

namespace BookLab_Odata.Controllers
{
    public class OauthController : Controller
    {
        private readonly IConfiguration configuration;
        private readonly ITokenService tokenService;

        public OauthController(IConfiguration configuration, ITokenService tokenService)
        {

            this.configuration = configuration;
            this.tokenService = tokenService;

        }

        public IActionResult Authorize()
        {
            var url = "https://accounts.google.com/o/oauth2/v2/auth?" +
                $"scope={this.configuration.GetValue<string>("Scope")}" +
                $"&access_type=offline" +
                $"&response_type=code" +
                $"&state=tridien121" +
                $"&redirect_uri={this.configuration.GetValue<string>("RedirectUrl")}" +
                $"&client_id={this.configuration.GetValue<string>("ClientId")}";

            return Redirect(url);
        }

        public async Task Callback (string code, string state)
        {
            await this.tokenService.GetTokenAsync(code);
        }
    }
}
