using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IBookingRepository
    {
        //Task<BookingDto> GetBookingDetailById(Guid id);
        Task<IEnumerable<BookingDto>> GetAllBookings(int pageNumber, int pageSize);

        //Task<IEnumerable<Booking>> GetAllBookingsByRoomId(Guid id);

        Task<Booking> GetBookingsById(Guid id);

        Task AddBooking(Booking bookings);

        Task UpdateBooking(Booking bookings);

        //Task DeleteBooking(Guid id);

        //Task<bool> ChangeStatus(Guid id);
        //Task<BookingDto> GetBookingsForSendEmail(Guid id);

        //Task<bool> LecturerFree(Guid id, Dictionary<string, Guid[]> timesOfBookings);

        //Task<Booking> GetBookingLatestByLectureId(Guid id);

        //Task<IEnumerable<ScheduleDto>> GetBookingInWeek(DateTime firstDateOfWeek, DateTime endDateOfWeek, Guid lectureId);
        Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeek(DateTime StartTime, DateTime EndTime, Guid RoomId, Guid LectureId);

        Task<IEnumerable<Booking>> GetBookingSuccessful(Guid lecturerId);
        Task<IEnumerable<CategoryDescription>> GetAllCategoryDescription();

        Task BulkInsertBookings(IEnumerable<Booking> bookings);

        Task<bool> GetBookingByRoomId(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<Guid[]> GetAllBookingsByRoom(Guid roomId);

        Task<bool> CheckRoomAvaliable(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<bool> CheckRoomNoPrivate(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<IEnumerable<SubBookingDto>> GetUpcomingBookingsInWeekOfLecturer(DateTime StartTime, DateTime EndTime, Guid LectureId);

    }
}
