using BookLabModel.Model;
using Microsoft.Extensions.Caching.Memory;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public class MeetingBookLabService : IMeetingBookLabService
    {
        private readonly IRestClient restClient;
        private readonly ITokenService tokenService;
        private readonly IMemoryCache memoryCache;

        public MeetingBookLabService(ITokenService tokenService, IMemoryCache memoryCache)
        {
            this.restClient = new RestClient("https://www.googleapis.com/calendar/v3/calendars/");
            this.tokenService = tokenService;
            this.memoryCache = memoryCache;
        }

        public async Task<EventResponse> CreateEventAsync(EventRequest eventRequest)
        {
            var restRequest = new RestRequest("primary/events");

            // Lấy Access Token từ MemoryCache
            if (!memoryCache.TryGetValue("AccessToken", out string accessToken))
            {
                return null;
            }

/*            var accessToken = await tokenService.GetAccessTokenAsync();*/

            restRequest.AddJsonBody(eventRequest);
            restRequest.AddHeader("Authorization", $"Bearer {accessToken}");
            var response = await this.restClient.PostAsync<EventResponse>(restRequest);
            return response;
        }

        public Task DeleteEventAsync(string eventId)
        {
            throw new NotImplementedException();
        }

        public Task<EventResponse> GetEventByIdAsync(string eventId)
        {
            throw new NotImplementedException();
        }

        public Task<List<EventResponse>> GetEventesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<EventResponse> UpdateEventAsync(string eventId, EventRequest eventRequest)
        {
            throw new NotImplementedException();
        }
    }
}
