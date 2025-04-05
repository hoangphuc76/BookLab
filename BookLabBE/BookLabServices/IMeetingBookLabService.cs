using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public interface IMeetingBookLabService
    {
        Task<EventResponse> CreateEventAsync(EventRequest eventRequest);

        Task DeleteEventAsync(string eventId);

        Task<EventResponse> GetEventByIdAsync(string eventId);

        Task<List<EventResponse>> GetEventesAsync();

        Task<EventResponse> UpdateEventAsync(string eventId, EventRequest eventRequest);


    }
}
