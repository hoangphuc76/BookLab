using System.Collections.Concurrent;
using BookLabModel.Model;
namespace BookLabDTO;

public class CollectionContainer
{
    public ConcurrentBag<Booking> BookingsToInsert { get; set; }
    public ConcurrentBag<SubBooking> SubBookingsToInsert { get; set; }
    public ConcurrentBag<Class> ClassesToInsert { get; set; }
    public ConcurrentDictionary<string, Guid> ProcessedClasses { get; set; }
    public ConcurrentDictionary<string, Booking> ProcessedBookings { get; set; }
    public ConcurrentDictionary<string, SubBooking> ProcessedSubBookings { get; set; }
    public ConcurrentDictionary<string, ConcurrentBag<(TimeOnly Start, TimeOnly End, int TypeSlot, string BookingInfo, int RowNumber)>> RoomTimeSlots { get; set; }
}