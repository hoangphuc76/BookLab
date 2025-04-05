using BookLabDAO;
using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class BookingRepository : IBookingRepository
    {
        public async Task<IEnumerable<Booking>> GetBookingSuccessful(Guid lecturerId)
        {
            return await BookingDAO.Instance.GetBookingSuccessful(lecturerId);
        }

        public async Task AddBooking(Booking bookings)
        {
            await BookingDAO.Instance.AddBooking(bookings);
        }

        //public async Task<bool> ChangeStatus(Guid id)
        //{
        //	return await BookingDAO.Instance.ChangeStatus(id);
        //}
        //public async Task<BookingDto> GetBookingDetailById(Guid id)
        //{
        //	return await BookingDAO.Instance.GetBookingDetailById(id);
        //}
        //public async Task DeleteBooking(Guid id)
        //{
        //	await BookingDAO.Instance.DeleteBooking(id);
        //}

        public async Task<IEnumerable<BookingDto>> GetAllBookings(int pageNumber, int pageSize)
        {
        	return await BookingDAO.Instance.GetAllBookings(pageNumber, pageSize);
        }

        //public async Task<IEnumerable<Booking>> GetAllBookingsByRoomId(Guid id)
        //{
        //	return await BookingDAO.Instance.GetAllBookingsByRoomId(id);
        //}

        public async Task<Booking> GetBookingsById(Guid id)
        {
        	return await BookingDAO.Instance.GetBookingsById(id);
        }

        //public async Task<bool> LecturerFree(Guid id, Dictionary<string, Guid[]> timesOfBookings)
        //{
        //	return await BookingDAO.Instance.LecturerFree(id, timesOfBookings);
        //}

        public async Task UpdateBooking(Booking bookings)
        {
        	await BookingDAO.Instance.UpdateBooking(bookings);
        }

        //public async Task<BookingDto> GetBookingsForSendEmail(Guid id)
        //{
        //	return await BookingDAO.Instance.GetBookingsForSendEmail(id);
        //}

        //public async Task<Booking> GetBookingLatestByLectureId(Guid id)
        //{
        //	return await BookingDAO.Instance.GetBookingLatestByLectureId(id);
        //}
        //public async Task<IEnumerable<ScheduleDto>> GetBookingInWeek(DateTime firstDateOfWeek, DateTime endDateOfWeek, Guid lectureId)
        //{
        //	return await BookingDAO.Instance.GetBookingInWeek(firstDateOfWeek, endDateOfWeek, lectureId);
        //}
        public async Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeek(DateTime StartTime, DateTime EndTime, Guid RoomId, Guid LectureId)
		{
			return await BookingDAO.Instance.GetUpcomingBookingsInWeek(StartTime, EndTime, RoomId, LectureId);
		}

        public async Task BulkInsertBookings(IEnumerable<Booking> bookings)
        {
        	await BookingDAO.Instance.BulkInsertBookings(bookings);
        }
        public async Task<IEnumerable<CategoryDescription>> GetAllCategoryDescription()
        {
            return await BookingDAO.Instance.GetAllCategoryDescription();

		}

        public async Task<bool> GetBookingByRoomId(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
	        return await BookingDAO.Instance.GetBookingByRoomId(roomId, startTime, endTime, date);
        }
        
        public async Task<Guid[]> GetAllBookingsByRoom(Guid roomId)
        {
            return await BookingDAO.Instance.GetAllBookingsByRoom(roomId);
        }

        public async Task<bool> CheckRoomAvaliable(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await BookingDAO.Instance.CheckRoomAvaliable(roomId, startTime, endTime, date);
        }

        public async Task<bool> CheckRoomNoPrivate(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await BookingDAO.Instance.CheckRoomNoPrivate(roomId, startTime, endTime, date);
        }

        public async Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeekOfLecturer(DateTime StartTime, DateTime EndTime, Guid LectureId)
        {
            return await BookingDAO.Instance.GetUpcomingBookingsInWeekOfLecturer(StartTime, EndTime, LectureId);

        }
    }
}
