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
        public async Task<bool> Undo(List<Guid> bookingIds)
        {
            return await BookingDAO.Instance.Undo(bookingIds);
        }
        public async Task<DashboardSummaryDto> GetDashboardSummary(DateTime startDate, DateTime endDate)
        {
            var subBookings = await BookingDAO.Instance.GetSubBookingsByDateRange(startDate, endDate);

            return new DashboardSummaryDto
            {
                TotalBookings = subBookings.Count(),
                ApprovedBookings = subBookings.Count(sb => sb.Approve == 10),
                CancelledBookings = subBookings.Count(sb => sb.Approve == 11),
                UniqueTeachers = await BookingDAO.Instance.GetUniqueTeachersCount(startDate, endDate)
            };
        }

        public async Task<IEnumerable<ReasonStatsDto>> GetReasonStats(DateTime startDate, DateTime endDate)
        {
            var subBookings = await BookingDAO.Instance.GetSubBookingsByDateRange(startDate, endDate);
            return subBookings
                .Where(sb => !string.IsNullOrEmpty(sb.Reason))
                .GroupBy(sb => sb.Reason)
                .Select(g => new ReasonStatsDto
                {
                    Reason = g.Key,
                    Count = g.Count()
                });
        }

        public async Task<IEnumerable<RoomUsageDto>> GetRoomUsageStats(DateTime startDate, DateTime endDate)
        {
            var subBookings = await BookingDAO.Instance.GetSubBookingsByDateRange(startDate, endDate);
            return subBookings
                .GroupBy(sb => sb.Booking.Room)
                .Select(g => new RoomUsageDto
                {
                    RoomName = g.Key.Name,
                    RoomNumber = g.Key.RoomNumber,
                    UsageCount = g.Count(),
                    Capacity = g.Key.Capacity
                });
        }
        public async Task<IEnumerable<(DateTime Date, int Count)>> GetBookingTrend(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingTrend(startDate, endDate);
        }

        public async Task<IEnumerable<(string DayOfWeek, int Count)>> GetBookingsByDayOfWeek(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingsByDayOfWeek(startDate, endDate);
        }

        public async Task<IEnumerable<(string RoomType, int Count)>> GetRoomTypeUsage(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetRoomTypeUsage(startDate, endDate);
        }

        public async Task<int> GetAvailableRooms(DateTime date)
        {
            return await BookingDAO.Instance.GetAvailableRooms(date);
        }

        public async Task<IEnumerable<(string Reason, double Percentage)>> GetTopReasons(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetTopReasons(startDate, endDate);
        }

        public async Task<double> GetOccupancyRate(DateTime date)
        {
            return await BookingDAO.Instance.GetOccupancyRate(date);
        }

        public async Task<IEnumerable<(int Hour, int Count)>> GetBookingHeatmap(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingHeatmap(startDate, endDate);
        }

        public async Task<IEnumerable<(string TeacherName, int Count)>> GetBookingsByTeacher(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingsByTeacher(startDate, endDate);
        }

        public async Task<double> GetAverageLeadTime(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetAverageLeadTime(startDate, endDate);
        }

        public async Task<IEnumerable<(string TimeSlot, int Count)>> GetBookingsByTimeSlot(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingsByTimeSlot(startDate, endDate);
        }

        public async Task<IEnumerable<(string CategoryName, int Count)>> GetBookingsByCategoryRoom(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingsByCategoryRoom(startDate, endDate);
        }

        public async Task<IEnumerable<RoomAvailabilityDto>> GetRoomAvailabilityAsync(DateTime date, string typeSlot)
        {
            return await BookingDAO.Instance.GetRoomAvailabilityAsync(date, typeSlot);
        }
        public async Task<IEnumerable<BookingHistoryDto>> GetBookingHistoryAsync(DateTime startDate, DateTime endDate)
        {
            return await BookingDAO.Instance.GetBookingHistoryAsync(startDate, endDate);
        }
        public async Task<IEnumerable<UpcomingBookingDto>> GetUpcomingBookingsAsync(int limit)
        {
            return await BookingDAO.Instance.GetUpcomingBookingsAsync(limit);
        }

        public async Task<bool> IsRoomAvailableByType(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date, int bookingType, bool requirePrivate = false)
        {
            return await BookingDAO.Instance.IsRoomAvailableByType(roomId, startTime, endTime, date, bookingType, requirePrivate);
        }

        public async Task ChangeStatusAuto()
        {
            await BookingDAO.Instance.ChangeStatusAuto();
        }

        public async Task<Guid[]> GetBookingSuccessfulId(Guid lecturerId)
        {
            return await BookingDAO.Instance.GetBookingSuccessfulId(lecturerId);
        }

        public async Task<List<SubBooking>> GetRoomSubBookingsInRange(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await BookingDAO.Instance.GetRoomSubBookingsInRange(roomId, startTime, endTime, date);
        }

        public async Task<List<SubBooking>> GetRoomSubBookingsInRangeCached(Guid roomId, TimeOnly startTime, TimeOnly endTime, DateTime date)
        {
            return await BookingDAO.Instance.GetRoomSubBookingsInRangeCached(roomId, startTime, endTime, date);
        }

        public async Task<Guid[]> GetAllBookingsByRoomId(Guid roomId)
        {
            return await BookingDAO.Instance.GetAllBookingsByRoomId(roomId);
        }

        public async Task AddBookingWithCache(Booking bookings)
        {
            await BookingDAO.Instance.AddBookingWithCache(bookings);
        }
    }
}
