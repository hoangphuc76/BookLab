using BookLabDTO;
using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace BookLabDAO
{
    public class GroupDAO : SingletonBase<GroupDAO>
    {
        public async Task<IEnumerable<Group>> GetAllGroups()
        {
            return await _context.Groups.Where(g => g.IsDeleted == false).ToListAsync();
            /*return await _context.Groups.Include(c => c.Lecturer).ToListAsync();*/
        }
        public async Task<Group> GetGroupsById(Guid id)
        {
            var groups = await _context.Groups.AsNoTracking()
                .Include(g => g.StudentInGroups)
                    .ThenInclude(sig => sig.Student)
                        .ThenInclude(s => s.AccountDetail)

                .Include(g => g.GroupInBookings)
                    .ThenInclude(gib => gib.Booking)
                .FirstOrDefaultAsync(g => g.Id == id && g.IsDeleted == false);
            if (groups == null) return null;

            return groups;
        }
        public async Task AddGroup(Group groups)
        {
            await _context.Groups.AddAsync(groups);
            await _context.SaveChangesAsync();
        }
        //public async Task UpdateGroup(Group groups)
        //{
        //    var existingItem = await GetGroupsById(groups.Id);
        //    if (existingItem == null) return;
        //    _context.Entry(existingItem).CurrentValues.SetValues(groups);
        //    await _context.SaveChangesAsync();
        //}
        public async Task DeleteGroup(Guid id)
        {           
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.IsDeleted == false && g.Id == id);
            if (group != null)
            {
                StudentInBookingDAO studentInBookingDAO = new StudentInBookingDAO();
                var studentInBookings = await _context.StudentInBookings.Include(sib => sib.StudentInGroup).Where(sib => sib.StudentInGroup.GroupId == id).ToArrayAsync();
                foreach (var e in studentInBookings)
                {
                    await studentInBookingDAO.DeleteStudentInBooking(e.StudentInGroupId, e.GroupInBookingId);
                }
                GroupInBookingDAO groupInBookingDAO = new GroupInBookingDAO();
                var groupInBookings = await _context.GroupInBookings.Where(gib => gib.GroupId == id).ToArrayAsync();
                foreach (var g in groupInBookings)
                {
                    await groupInBookingDAO.DeleteGroupInBooking(g.Id);
                }

                StudentInGroupDAO studentInGroupDAO = new StudentInGroupDAO();
                var studentInGroups = await _context.StudentInGroups.Where(sig => sig.GroupId == id).ToArrayAsync();
                foreach (var s in studentInGroups)
                {
                    await studentInGroupDAO.DeleteStudentInGroup(s.Id);
                }
                group.IsDeleted = true;
                group.RemovedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }
        //public async Task<bool> ChangeStatus(Guid id)
        //{
        //    var groups = await GetGroupsById(id);
        //    groups.Status = !groups.Status;
        //    _context.SaveChanges();
        //    return groups.Status;
        //}

        public async Task AddGroups(List<Group> listGroups, List<StudentInGroup> studentInGroups)
        {
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    await _context.Groups.AddRangeAsync(listGroups);
                    await _context.SaveChangesAsync();

                    await _context.StudentInGroups.AddRangeAsync(studentInGroups);
                    await _context.SaveChangesAsync();

                    transaction.Commit();

                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                }
            }
        }

        //public async Task<IEnumerable<StudentInGroupDto>> UpdateGroupByLecturer(Guid groupId, string groupName, List<string> studentIdList)
        //{
        //    Group group = _context.Groups.FirstOrDefault(g => g.Id == groupId);
        //    var studentInGroups = _context.StudentInGroups.Where(sg => sg.GroupId == groupId).Where(sg => studentIdList.Contains(sg.StudentId.ToString())).Select(sg => sg.StudentId).ToList();

        //    var removeStudentInGroup = _context.StudentInGroups.Where(sg => sg.GroupId == groupId).Where(sg => !studentIdList.Contains(sg.StudentId.ToString())).ToList();

        //    var addStudentInGroup = studentIdList.Where(sc => !studentInGroups.Contains(Guid.Parse(sc))).ToList();


        //    if (group != null)
        //    {
        //        group.Name = groupName;
        //        await _context.SaveChangesAsync();
        //        foreach (var stu in removeStudentInGroup)
        //        {
        //            _context.StudentInGroups.Remove(stu);

        //        }


        //        foreach (var stuId in addStudentInGroup)
        //        {
        //            StudentInGroup sig = new StudentInGroup
        //            {
        //                Id = Guid.NewGuid(),
        //                StudentId = Guid.Parse(stuId),
        //                GroupId = group.Id,
        //            };
        //            await _context.StudentInGroups.AddAsync(sig);
        //        }
        //        await _context.SaveChangesAsync();

        //        var buff = await _context.StudentInGroups.Where(sig => sig.GroupId == groupId).Include(sig => sig.Group).Include(sig => sig.Student.AccountDetail).ToListAsync();


        //        var result = buff.Select(s => new StudentInGroupDto
        //        {
        //            GroupId = s.GroupId,
        //            GroupName = s.Group.Name,
        //            Avatar = s.Student.AccountDetail.Avatar,
        //            StudentCode = s.Student.AccountDetail.StudentId,
        //            FullName = s.Student.AccountDetail.FullName,
        //            StudentId = s.StudentId
        //        });

        //        return result;


        //    }
        //    return null;

        //}


    }
}
