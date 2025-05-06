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
        Task<bool> Undo(List<Guid> bookingIds);
        Task<DashboardSummaryDto> GetDashboardSummary(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ReasonStatsDto>> GetReasonStats(DateTime startDate, DateTime endDate);
        Task<IEnumerable<RoomUsageDto>> GetRoomUsageStats(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(DateTime Date, int Count)>> GetBookingTrend(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(string DayOfWeek, int Count)>> GetBookingsByDayOfWeek(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(string RoomType, int Count)>> GetRoomTypeUsage(DateTime startDate, DateTime endDate);
        Task<int> GetAvailableRooms(DateTime date);
        Task<IEnumerable<(string Reason, double Percentage)>> GetTopReasons(DateTime startDate, DateTime endDate);
        Task<double> GetOccupancyRate(DateTime date);
        Task<IEnumerable<(int Hour, int Count)>> GetBookingHeatmap(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(string TeacherName, int Count)>> GetBookingsByTeacher(DateTime startDate, DateTime endDate);
        Task<double> GetAverageLeadTime(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(string TimeSlot, int Count)>> GetBookingsByTimeSlot(DateTime startDate, DateTime endDate);
        Task<IEnumerable<(string CategoryName, int Count)>> GetBookingsByCategoryRoom(DateTime startDate, DateTime endDate);
        Task<IEnumerable<RoomAvailabilityDto>> GetRoomAvailabilityAsync(DateTime date, string typeSlot);
        Task<IEnumerable<BookingHistoryDto>> GetBookingHistoryAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<UpcomingBookingDto>> GetUpcomingBookingsAsync(int limit);

        Task<bool> IsRoomAvailableByType(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date, int bookingType, bool requirePrivate = false);

        Task ChangeStatusAuto();

        Task<Guid[]> GetBookingSuccessfulId(Guid lecturerId);

        Task<List<SubBooking>> GetRoomSubBookingsInRange(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<List<SubBooking>> GetRoomSubBookingsInRangeCached(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date);

        Task<Guid[]> GetAllBookingsByRoomId(Guid roomId);

        Task AddBookingWithCache(Booking bookings);
    }
}
