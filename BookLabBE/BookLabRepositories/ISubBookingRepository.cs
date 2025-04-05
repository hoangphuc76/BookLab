using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface ISubBookingRepository
    {
        Task AddSubBooking(SubBooking subBooking);

        Task<bool> LecturerFree(IEnumerable<Booking> listBookings, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<SubBooking> GetSubBookingById(Guid id);
        Task UpdateSubBooking(Guid id, int status, string reason, Guid userId);
        Task<IEnumerable<SubBooking>> GetAllSubBookings();

        Task BulkInsertSubBookings(IEnumerable<SubBooking> subBookings);

        Task<bool> checkAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, Room room, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<bool> checkPerfectAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, Guid[] studentIds, Room room, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<SubBooking> GetSubBookingLatestByLectureId(Guid id, Guid roomId);
    }
}
