using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IStudentInBookingRepository
    {
        Task<IEnumerable<StudentInBooking>> GetAllStudentInBookings();

        Task<StudentInBooking> GetStudentInBookingsById(Guid studentInGroupId, Guid groupinBookingId);

        Task AddStudentInBooking(StudentInBooking studentInBookings);
        Task UpdateStudentAttendace(AttendanceRequest attendanceRequest);
        Task UpdateStudentInBooking(StudentInBooking studentInBookings);

        Task DeleteStudentInBooking(Guid studentInGroupId, Guid groupinBookingId);

        Task<bool> ChangeStatus(Guid studentInGroupId, Guid groupinBookingId);

        Task<List<Guid>> getStudentInGroupOfBooking(Guid subBookingId);

        Task DeleteAllStudentInBooking(Guid subBookingId);
    }
}
