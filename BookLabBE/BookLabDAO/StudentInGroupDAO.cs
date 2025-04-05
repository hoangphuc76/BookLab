using BookLabDTO;
using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class StudentInGroupDAO : SingletonBase<StudentInGroupDAO>
    {
        public async Task<IEnumerable<StudentInGroup>> GetAllStudentInGroups()
        {
            return await _context.StudentInGroups.Where(sig => sig.IsDeleted == false).ToListAsync();
            /*return await _context.StudentInGroups.Include(c => c.Group).Include(c => c.Student).ToListAsync();*/
        }

        public async Task<IEnumerable<StudentInGroup>> GetAllStudentInGroupsByListGroup(Guid[] groupIds)
        {
            return await _context.StudentInGroups.Where(sip =>sip.IsDeleted == false && sip.GroupId != null && groupIds.Contains(sip.GroupId.Value)).ToListAsync();
        }

        public async Task<IEnumerable<StudentInGroup>> GetStudentInGroupsByGroupId(Guid id)
        {
            return await _context.StudentInGroups.Where(sig => sig.IsDeleted == false && sig.GroupId == id).Include(sig => sig.Student).Include(sig => sig.Student.AccountDetail).ToListAsync();
            /*return await _context.StudentInGroups.Include(c => c.Group).Include(c => c.Student).ToListAsync();*/
        }

        public async Task<IEnumerable<StudentInGroup>> GetAllStudentInGroupsByStudentId(Guid id)
        {
            return await _context.StudentInGroups.Where(sip =>sip.IsDeleted == false &&  sip.StudentId != null && sip.StudentId == id).Include(sip => sip.Student).
                    Include(sip => sip.Student.AccountDetail).ToListAsync();
        }

        public async Task<StudentInGroup> GetStudentInGroupsById(Guid id)
        {
            var studentInGroups = await _context.StudentInGroups.FirstOrDefaultAsync(c => c.IsDeleted == false && c.Id == id);
            if (studentInGroups == null) return null;

            return studentInGroups;
        }
        public async Task AddStudentInGroup(StudentInGroup studentInGroups)
        {
            await _context.StudentInGroups.AddAsync(studentInGroups);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateStudentInGroup(StudentInGroup studentInGroups)
        {
            var existingItem = await GetStudentInGroupsById(studentInGroups.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(studentInGroups);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteStudentInGroup(Guid id)
        {
            StudentInBookingDAO studentInBookingDAO = new StudentInBookingDAO();
            
            var studentInGroups = await GetStudentInGroupsById(id);
            if (studentInGroups != null)
            {
				await studentInBookingDAO.DeleteStudentInBookingByStudentInGroup(studentInGroups.Id);
				studentInGroups.IsDeleted = true;
                studentInGroups.RemovedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            
        }
        public async Task<bool> ChangeStatus(Guid id)
        {
            var studentInGroups = await GetStudentInGroupsById(id);
            studentInGroups.Status = !studentInGroups.Status;
            _context.SaveChanges();
            return studentInGroups.Status;
        }

        public async Task<IEnumerable<StudentInGroupDto>> getListStudentInGroupbyGroupId(List<StudentInGroup> listStudentInGroup)
        {
            if (listStudentInGroup == null || !listStudentInGroup.Any())
            {
                return Enumerable.Empty<StudentInGroupDto>();
            }

            var listGroupId = listStudentInGroup.Select(sig => sig.GroupId).Distinct().ToList();


            var studentInGroupsDetail = await _context.StudentInGroups
                .Include(sig => sig.Group).Where(sig=> sig.Group.IsDeleted == false && sig.IsDeleted == false && listGroupId.Contains(sig.GroupId))
                .Include(sig => sig.Student.AccountDetail)

                .ToListAsync();
            var result = studentInGroupsDetail.Select(s => new StudentInGroupDto
            {
                GroupId = s.Group.Id,
                GroupName = s.Group.Name,
                Avatar = s.Student.AccountDetail.Avatar,
                StudentCode = s.Student.AccountDetail.StudentId,
                FullName = s.Student.AccountDetail.FullName,
                StudentId = s.Student.Id,
            });



            return result;
        }
        public async Task<IEnumerable<StudentInGroupDto>> GetAllStudentInGroupByTeacherId(Guid TeacherId)
        {
            Guid guid = TeacherId;
            var studentInGroupsDetail = await _context.StudentInGroups
                .AsNoTracking()
                .Include(sig => sig.Group).Where(sig => sig.IsDeleted == false && sig.Group.IsDeleted == false && sig.Group.LecturerId == guid).Include(sig => sig.Student.AccountDetail).ToListAsync();
            var result = studentInGroupsDetail.Select(s => new StudentInGroupDto
            {
                GroupId = s.Group.Id,
                GroupName = s.Group.Name,
                StudentInGroupId = s.Id,
                Avatar = s.Student.AccountDetail.Avatar,
                StudentCode = s.Student.AccountDetail.StudentId,
                FullName = s.Student.AccountDetail.FullName,
                StudentId = s.Student.Id,
            });
            return result;

        }

        public async Task<bool> CheckNoDouble(Guid[] groupIds)
        {
            var studentsInGroups = await _context.StudentInGroups
                .Where(s =>s.IsDeleted == false && s.GroupId != null &&  groupIds.Contains(s.GroupId.Value))
                .ToListAsync();

            var duplicates = studentsInGroups
                .GroupBy(s => s.StudentId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            return !duplicates.Any();
        }
        //
        //         public async Task<IEnumerable<StudentInGroup>> StudentFree(Guid[] groupIds, DateTime date, Guid slotId)
        //         {
        //             //var groupIdsBusy = await _context.GroupInBookings.Where(gip => gip.DateTimeInBooking == date && gip.SlotId == slotId && gip.Status == true).ToListAsync();
        //
        //             var allStudent = await GetAllStudentInGroupsByListGroup(groupIds);
        //             var allStudentIds = allStudent.Select(studentId => studentId.StudentId).ToList();
        //             var listStudentIdBusy = new List<Guid>();
        //             foreach ( Guid studentId in allStudentIds )
        //             {
        //                 var listGroupOfStudent = await GetAllStudentInGroupsByStudentId(studentId);
        //                 var listGroupIdsOfStudent = listGroupOfStudent.Select(group => group.GroupId).ToList();
        //                 var studentBusy = await _context.GroupInBookings.Where(gip => gip.DateTimeInBooking == date && gip.SlotId == slotId && gip.Status == true &&
        //                     listGroupIdsOfStudent.Contains(gip.GroupId)).ToListAsync();
        //                 if (studentBusy.Any() )
        //                 {
        //                     listStudentIdBusy.Add(studentId);
        //                 }
        //             }
        //
        //             var allStudentBusy = allStudent.Where(student => listStudentIdBusy.Contains(student.StudentId)).ToList();
        //
        //             return allStudentBusy;
        //         }

        public async Task<IEnumerable<StudentInGroup>> StudentFree(Guid[] groupIds, DateTime date, TimeOnly startTime, TimeOnly endTime)
        {
            var allStudent = await GetAllStudentInGroupsByListGroup(groupIds);
            var allStudentIds = allStudent.Select(studentId => studentId.StudentId).ToList();
            var listStudentIdBusy = new List<Guid>();
            foreach (Guid studentId in allStudentIds)
            {
                var listGroupOfStudent = await GetAllStudentInGroupsByStudentId(studentId);
                var listGroupIdsOfStudent = listGroupOfStudent.Select(group => group.GroupId).ToList();
				var groupInBooking = await _context.GroupInBookings.Where(gip => gip.IsDeleted == false && listGroupIdsOfStudent.Contains(gip.GroupId)).ToListAsync();
                var subBookingIds = groupInBooking.Select(gip => gip.SubBookingId).ToList();
                var subBookingBusy = await _context.SubBookings.Where(sb => subBookingIds.Contains(sb.Id) && sb.Approve != 11 && sb.Date.Equals(date)
                                && !(sb.EndTime <= startTime || sb.StartTime >= endTime)).ToListAsync();
                if (subBookingBusy.Any())
                {
                    listStudentIdBusy.Add(studentId);
                }
            }

            var allStudentBusy = allStudent.Where(student => student.StudentId != null && listStudentIdBusy.Contains(student.StudentId.Value)).ToList();
            return allStudentBusy;
        }

        public async Task<IEnumerable<StudentInGroup>> ExactlyStudentFree(Guid[] studentIds, DateTime date, TimeOnly startTime, TimeOnly endTime)
        {
            var listStudentIdBusy = new List<Guid>();
            foreach (Guid studentId in studentIds)
            {
                var listGroupOfStudent = await GetAllStudentInGroupsByStudentId(studentId);
                var listGroupIdsOfStudent = listGroupOfStudent.Select(group => group.GroupId).ToList();
                var groupInBooking = await _context.GroupInBookings.Where(gip =>gip.IsDeleted == false && listGroupIdsOfStudent.Contains(gip.GroupId)).ToListAsync();
                var subBookingIds = groupInBooking.Select(gip => gip.SubBookingId).ToList();
                var subBookingBusy = await _context.SubBookings.Where(sb => subBookingIds.Contains(sb.Id) && sb.Approve != 11 && sb.Date.Equals(date)
                                && !(sb.EndTime <= startTime || sb.StartTime >= endTime)).ToListAsync();
                if (subBookingBusy.Any())
                {
                    listStudentIdBusy.Add(studentId);
                }
            }

            var allStudentBusy = await _context.StudentInGroups.Where(student =>student.IsDeleted == false && student.StudentId != null && listStudentIdBusy.Contains(student.StudentId.Value)).Include(sig => sig.Student).ThenInclude(si => si.AccountDetail).ToListAsync();
            return allStudentBusy;
        }
    }
}
