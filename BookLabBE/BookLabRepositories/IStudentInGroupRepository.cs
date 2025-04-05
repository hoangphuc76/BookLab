using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IStudentInGroupRepository
    {
        Task<IEnumerable<StudentInGroup>> GetAllStudentInGroups();

        Task<IEnumerable<StudentInGroup>> GetStudentInGroupsByGroupId(Guid id);

        Task<StudentInGroup> GetStudentInGroupsById(Guid id);

        Task AddStudentInGroup(StudentInGroup studentInGroups);

        Task UpdateStudentInGroup(StudentInGroup studentInGroups);

        Task DeleteStudentInGroup(Guid id);

        Task<bool> ChangeStatus(Guid id);

        Task<IEnumerable<StudentInGroupDto>> getListStudentInGroupbyGroupId(List<StudentInGroup> listStudentInGroup);

        Task<IEnumerable<StudentInGroupDto>> GetAllStudentInGroupByTeacherId(Guid TeacherId);

        Task<bool> CheckNoDouble(Guid[] groupIds);

        Task<IEnumerable<StudentInGroup>> StudentFree(Guid[] groupIds, DateTime date, TimeOnly startTime, TimeOnly endTime);

        Task<IEnumerable<StudentInGroup>> ExactlyStudentFree(Guid[] studentIds, DateTime date, TimeOnly startTime, TimeOnly endTime);

    }
}
