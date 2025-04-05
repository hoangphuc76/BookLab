using BookLabModel.Model;
using BookLabDTO;

namespace BookLabRepositories
{
    public interface IGroupInBookingRepository
    {
		//Task<IEnumerable<GroupInBooking>> GetAllGroupInBookings();

		Task<GroupInBooking> GetGroupInBookingsById(Guid id);

		Task AddGroupInBooking(GroupInBooking groupInBookings);

		//Task UpdateGroupInBooking(GroupInBooking groupInBookings);

		//Task DeleteGroupInBooking(Guid id);

		//Task<bool> ChangeStatus(Guid id);

		//Task<Object> CustomDataForSlot(IEnumerable<Booking> bookings, string dateString);

		Task<IEnumerable<AttendanceRequestGetDto>> GetAllGroupInBookingsByBookingId(Guid id);

		Task<IEnumerable<GroupInBookingCompreDto>> GetGroupInBookingsByGroupId(Guid id);
		//Task<IEnumerable<AttendanceRequestGetDto>> GetAllGroupInBookingsById(Guid id);


		Task<IEnumerable<GroupInBooking>> GetGroupInBookingsBySubBookingId(Guid subBookingId);

        Task DeleteAllGroupInBooking(Guid subBookingId);

    }
}
