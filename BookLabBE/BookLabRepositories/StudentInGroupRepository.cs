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
    public class StudentInGroupRepository : IStudentInGroupRepository
    {
        public async Task AddStudentInGroup(StudentInGroup studentInGroups)
        {
            await StudentInGroupDAO.Instance.AddStudentInGroup(studentInGroups);
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            return await StudentInGroupDAO.Instance.ChangeStatus(id);
        }

        public async Task DeleteStudentInGroup(Guid id)
        {
            await StudentInGroupDAO.Instance.DeleteStudentInGroup(id);
        }

        public async Task<IEnumerable<StudentInGroup>> GetAllStudentInGroups()
        {
            return await StudentInGroupDAO.Instance.GetAllStudentInGroups();
        }

        public async Task<IEnumerable<StudentInGroup>> GetStudentInGroupsByGroupId(Guid id)
        {
            return await StudentInGroupDAO.Instance.GetStudentInGroupsByGroupId(id);
        }

        public async Task<StudentInGroup> GetStudentInGroupsById(Guid id)
        {
            return await StudentInGroupDAO.Instance.GetStudentInGroupsById(id);
        }

        public async Task UpdateStudentInGroup(StudentInGroup studentInGroups)
        {
            await StudentInGroupDAO.Instance.UpdateStudentInGroup(studentInGroups);
        }
        public async Task<IEnumerable<StudentInGroupDto>> getListStudentInGroupbyGroupId(List<StudentInGroup> listStudentInGroup)
        {
            return await StudentInGroupDAO.Instance.getListStudentInGroupbyGroupId(listStudentInGroup);

        }

        public async Task<IEnumerable<StudentInGroupDto>> GetAllStudentInGroupByTeacherId(Guid TeacherId)
        {
            return await StudentInGroupDAO.Instance.GetAllStudentInGroupByTeacherId(TeacherId);
        }

        public async Task<bool> CheckNoDouble(Guid[] groupIds)
        {
            return await StudentInGroupDAO.Instance.CheckNoDouble(groupIds);
        }

        public async Task<IEnumerable<StudentInGroup>> StudentFree(Guid[] groupIds, DateTime date, TimeOnly startTime, TimeOnly endTime)
        {
            return await StudentInGroupDAO.Instance.StudentFree(groupIds, date, startTime, endTime);
        }

        public async Task<IEnumerable<StudentInGroup>> ExactlyStudentFree(Guid[] studentIds, DateTime date, TimeOnly startTime, TimeOnly endTime)
        {
            return await StudentInGroupDAO.Instance.ExactlyStudentFree(studentIds, date, startTime, endTime);
        }
    }
}
