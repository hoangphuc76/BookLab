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
    public class StudentInBookingRepository : IStudentInBookingRepository
    {
        public async Task AddStudentInBooking(StudentInBooking studentInBookings)
        {
            await StudentInBookingDAO.Instance.AddStudentInBooking(studentInBookings);
        }

        public async Task UpdateStudentAttendace(AttendanceRequest attendanceRequest)
        {
            await StudentInBookingDAO.Instance.UpdateStudentAttendace(attendanceRequest);
        }

        public async Task<bool> ChangeStatus(Guid studentInGroupId, Guid groupinBookingId)
        {
            return await StudentInBookingDAO.Instance.ChangeStatus(studentInGroupId, groupinBookingId);
        }

        public async Task DeleteStudentInBooking(Guid studentInGroupId, Guid groupinBookingId)
        {
            await StudentInBookingDAO.Instance.DeleteStudentInBooking(studentInGroupId, groupinBookingId);
        }

        public async Task<IEnumerable<StudentInBooking>> GetAllStudentInBookings()
        {
            return await StudentInBookingDAO.Instance.GetAllStudentInBookings();
        }

        public async Task<StudentInBooking> GetStudentInBookingsById(Guid studentInGroupId, Guid groupinBookingId)
        {
            return await StudentInBookingDAO.Instance.GetStudentInBookingsById(studentInGroupId, groupinBookingId);
        }

        public async Task UpdateStudentInBooking(StudentInBooking studentInBookings)
        {
            await StudentInBookingDAO.Instance.UpdateStudentInBooking(studentInBookings);
        }

        public async Task<List<Guid>> getStudentInGroupOfBooking(Guid subBookingId)
        {
            return await StudentInBookingDAO.Instance.getStudentInGroupOfBooking(subBookingId);
        }

        public async Task DeleteAllStudentInBooking(Guid subBookingId)
        {
            await StudentInBookingDAO.Instance.DeleteAllStudentInBooking(subBookingId);

        }
    }
}
