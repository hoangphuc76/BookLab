using BookLabDAO;
using BookLabModel.Model;
using BookLabDTO;

namespace BookLabRepositories
{
    public class GroupInBookingRepository : IGroupInBookingRepository
    {
        public async Task AddGroupInBooking(GroupInBooking groupInBookings)
        {
            await GroupInBookingDAO.Instance.AddGroupInBooking(groupInBookings);
        }

        public Task<IEnumerable<GroupInBooking>> GetGroupInBookingsBySubBookingId(Guid subBookingId)
        {
            return GroupInBookingDAO.Instance.GetGroupInBookingsBySubBookingId(subBookingId);
        }

        //
        //         public async Task<bool> ChangeStatus(Guid id)
        //         {
        //             return await GroupInBookingDAO.Instance.ChangeStatus(id);
        //         }
        //
        //         public async Task<object> CustomDataForSlot(IEnumerable<Booking> bookings, string dateString)
        //         {
        //             return await GroupInBookingDAO.Instance.CustomDataForSlot(bookings, dateString);
        //         }
        //
        //         public async Task DeleteGroupInBooking(Guid id)
        //         {
        //             await GroupInBookingDAO.Instance.DeleteGroupInBooking(id);
        //         }
        //
        //         public async Task<IEnumerable<GroupInBooking>> GetAllGroupInBookings()
        //         {
        //             return await GroupInBookingDAO.Instance.GetAllGroupInBookings();
        //         }
        //
        public async Task<IEnumerable<AttendanceRequestGetDto>> GetAllGroupInBookingsByBookingId(Guid id)
        {
            return await GroupInBookingDAO.Instance.GetAllGroupInBookingsById(id);
        }
        //
        public async Task<GroupInBooking> GetGroupInBookingsById(Guid id)
        {
            return await GroupInBookingDAO.Instance.GetGroupInBookingsById(id);
        }
        //
        //         public async Task UpdateGroupInBooking(GroupInBooking groupInBookings)
        //         {
        //             await GroupInBookingDAO.Instance.UpdateGroupInBooking(groupInBookings);
        //         }
        //
        public async Task<IEnumerable<GroupInBookingCompreDto>> GetGroupInBookingsByGroupId(Guid id)
        {
            return await GroupInBookingDAO.Instance.GetGroupInBookingsByGroupId(id);

        }
        //
        //         public async Task<IEnumerable<AttendanceRequestGetDto>> GetAllGroupInBookingsById(Guid id)
        //         {
        //             return await GroupInBookingDAO.Instance.GetAllGroupInBookingsById(id);
        //         }
        //

        public async Task DeleteAllGroupInBooking(Guid subBookingId)
        {
            await GroupInBookingDAO.Instance.DeleteAllGroupInBooking(subBookingId);
        }
    }
}
