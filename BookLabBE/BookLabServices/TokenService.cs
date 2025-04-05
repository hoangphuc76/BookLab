using BookLabModel;
using Microsoft.Extensions.Configuration;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BookLabServices
{
    public class TokenService : ITokenService
    {
        private readonly IRestClient restClient;
        private readonly string tokenFilePath = "D:\\.NET\\BookLab\\BookLabServices\\token.json";
        private readonly IConfiguration configuration;

        public TokenService(IConfiguration configuration)
        {
            this.restClient = new RestClient("https://oauth2.googleapis.com/token");   
            this.configuration = configuration;
        }

        public async Task<string> GetAccessTokenAsync()
        {
            var token = this.GetToken();
            if (token.IsTokenExpired)
            {
                token = await this.RefreshTokenAsync();
            }

            return token.access_token;
        }

        public async Task<Token> GetTokenAsync(string code)
        {
            var resRequest = new RestRequest();
            resRequest.AddQueryParameter("code", code);
            resRequest.AddQueryParameter("client_id", this.configuration.GetValue<string>("ClientId"));
            resRequest.AddQueryParameter("client_secret", this.configuration.GetValue<string>("ClientSecret"));
            resRequest.AddQueryParameter("redirect_uri", this.configuration.GetValue<string>("RedirectUrl"));
            resRequest.AddQueryParameter("grant_type", "authorization_code");

            var respose = await this.restClient.PostAsync<Token>(resRequest);
            this.SaveToken(respose);
            return respose;
        }

        private async Task<Token> RefreshTokenAsync()
        {
            var token = this.GetToken();
            var resRequest = new RestRequest();
            resRequest.AddQueryParameter("refresh_token", token.refresh_token);
            resRequest.AddQueryParameter("client_id", this.configuration.GetValue<string>("ClientId"));
            resRequest.AddQueryParameter("client_secret", this.configuration.GetValue<string>("ClientSecret"));
            resRequest.AddQueryParameter("grant_type", "refresh_token");

            var respose = await this.restClient.PostAsync<Token>(resRequest);
            respose.refresh_token = token.refresh_token;
            this.SaveToken(respose);
            return respose;
        }

        private void SaveToken(Token token)
        {
            System.IO.File.WriteAllText(this.tokenFilePath, JsonSerializer.Serialize(token));
        }

        private Token GetToken()
        {
            var tokenContent = System.IO.File.ReadAllText(this.tokenFilePath);
            return JsonSerializer.Deserialize<Token>(tokenContent);
        }
    }
}
