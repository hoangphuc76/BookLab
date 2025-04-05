using BookLabDTO;
using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using EFCore.BulkExtensions;  // Import EF Core Bulk Extensions


namespace BookLabDAO
{
    public class StudentInBookingDAO : SingletonBase<StudentInBookingDAO>
    {
        public async Task<IEnumerable<StudentInBooking>> GetAllStudentInBookings()
        {
            return await _context.StudentInBookings.Where(sib => sib.IsDeleted == false).ToListAsync();
            /*return await _context.StudentInBookings.Include(c => c.GroupInBooking).Include(c => c.StudentInGroup).ToListAsync();*/
        }
        public async Task<StudentInBooking> GetStudentInBookingsById(Guid studentInGroupId, Guid groupinBookingId)
        {
            var studentInBookings = await _context.StudentInBookings.FirstOrDefaultAsync(c => c.IsDeleted == false && c.StudentInGroupId == studentInGroupId && c.GroupInBookingId == groupinBookingId);
            if (studentInBookings == null) return null;

            return studentInBookings;
        }

		public async Task<IEnumerable<StudentInBooking>> GetStudentInBookingsByStudentInGroupId(Guid studentInGroupId)
		{
			var studentInBookings = await _context.StudentInBookings.Where(c => c.IsDeleted == false && c.StudentInGroupId == studentInGroupId).ToListAsync();
			if (studentInBookings == null) return null;

			return studentInBookings;
		}
		public async Task AddStudentInBooking(StudentInBooking studentInBookings)
        {
            await _context.StudentInBookings.AddAsync(studentInBookings);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateStudentInBooking(StudentInBooking studentInBookings)
        {
           var existingItem = await GetStudentInBookingsById(studentInBookings.StudentInGroupId, studentInBookings.GroupInBookingId);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(studentInBookings);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStudentAttendace(AttendanceRequest attendanceRequest)
        {
            var recordsToUpdate = attendanceRequest.AttendanceRecords
                    .Select(record => new StudentInBooking
                    {
                        StudentInGroupId = record.studentInGroupId,
                        GroupInBookingId = record.groupInBookingId,
                        Status = record.Status == "Attendance" ? true : false
                    }).ToList();
            await _context.BulkUpdateAsync(recordsToUpdate);
        }
        public async Task DeleteStudentInBooking(Guid studentInGroupId, Guid groupinBookingId)
        {
            var studentInBookings = await GetStudentInBookingsById(studentInGroupId, groupinBookingId);
            
            if (studentInBookings != null)
            {
				studentInBookings.IsDeleted = true;
				studentInBookings.RemovedAt = DateTime.Now;
				await _context.SaveChangesAsync();
			}
        }

        public async Task DeleteStudentInBookingByStudentInGroup(Guid studentInGroupId)
        {
            var studentInBookings = await GetStudentInBookingsByStudentInGroupId(studentInGroupId);
            if(studentInBookings != null)
            {
                foreach (var studentInBooking in studentInBookings)
                {
                    studentInBooking.IsDeleted = true;
                    studentInBooking.RemovedAt = DateTime.Now;
                    await _context.SaveChangesAsync();
                }
            }

		}

        public async Task<bool> ChangeStatus(Guid studentInGroupId, Guid groupinBookingId)
        {
            var studentInBookings = await GetStudentInBookingsById(studentInGroupId, groupinBookingId);
            studentInBookings.Status = !studentInBookings.Status;
            _context.SaveChanges();
            return studentInBookings.Status;
        }

        public async Task<List<Guid>> getStudentInGroupOfBooking(Guid subBookingId)
        {
            var studentInBookings = await _context.StudentInBookings.Include(sib => sib.GroupInBooking).Where(sib => sib.IsDeleted == false && sib.GroupInBooking.IsDeleted == false && sib.GroupInBooking.SubBookingId == subBookingId).Select(sig => sig.StudentInGroupId).ToListAsync();
            return studentInBookings;
        }

        public async Task DeleteAllStudentInBooking(Guid subBookingId)
        {
            var studentInBookings = await _context.StudentInBookings.Include(sib => sib.GroupInBooking).Where(sib => sib.IsDeleted == false && sib.GroupInBooking.IsDeleted == false && sib.GroupInBooking.SubBookingId == subBookingId).ToListAsync();
            if (studentInBookings != null)
            {
                foreach (var item in studentInBookings)
                {
                    item.IsDeleted = true;
                    item.RemovedAt = DateTime.Now;
					await _context.SaveChangesAsync();
				}
       
            }
        }
    }
}
