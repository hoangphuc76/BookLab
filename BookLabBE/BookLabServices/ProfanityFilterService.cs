using BookLabDTO;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public class ProfanityFilterService : IProfanityFilterService
    {
        private readonly HttpClient _httpClient;

        public ProfanityFilterService()
        {
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("X-Api-Key", "1wBakvP3y3hLKEj1f9oNnQ==dE5FLVIfUEeurEpd");
        }

        public async Task<ProfanityFilterResponse> CheckProfanityAsync(string text)
        {
            var response = await _httpClient.GetAsync($"https://api.api-ninjas.com/v1/profanityfilter?text={Uri.EscapeDataString(text)}");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ProfanityFilterResponse>(jsonResponse);
        }
    }
}
