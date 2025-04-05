using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class SubBookingRepository : ISubBookingRepository
    {
        public async Task AddSubBooking(SubBooking subBooking)
        {
            await SubBookingDAO.Instance.AddSubBooking(subBooking);
        }

        public async Task<bool> LecturerFree(IEnumerable<Booking> listBookings, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await SubBookingDAO.Instance.LecturerFree(listBookings, startTime, endTime, date);
        }

        public Task<SubBooking> GetSubBookingById(Guid id) => SubBookingDAO.Instance.GetSubBookingById(id);
        
        public Task BulkInsertSubBookings(IEnumerable<SubBooking> subBookings) {
            return SubBookingDAO.Instance.BulkInsertSubBookings(subBookings);
        }
        
        public Task UpdateSubBooking(Guid id, int status, string reason, Guid userId) => SubBookingDAO.Instance.UpdateSubBooking(id, status, reason, userId);
        public Task<IEnumerable<SubBooking>> GetAllSubBookings() => SubBookingDAO.Instance.GetAllSubBookings();

        public async Task<bool> checkAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, Room room, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await SubBookingDAO.Instance.checkAvaliableBookging(bookingIds, groupIds, room, startTime, endTime, date);
        }

        public async Task<bool> checkPerfectAvaliableBookging(Guid[] bookingIds, Guid[] groupIds, Guid[] studentIds, Room room, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await SubBookingDAO.Instance.checkPerfectAvaliableBookging(bookingIds, groupIds, studentIds, room, startTime, endTime, date);
        }

        public async Task<SubBooking> GetSubBookingLatestByLectureId(Guid id, Guid roomId)
        {
            return await SubBookingDAO.Instance.GetSubBookingLatestByLectureId(id, roomId);
        }
    }
}
