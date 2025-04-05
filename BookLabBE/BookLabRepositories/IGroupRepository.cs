using BookLabDTO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IGroupRepository
    {
        Task<IEnumerable<Group>> GetAllGroups();

        Task<Group> GetGroupsById(Guid id);

        Task AddGroup(Group groups);

        //Task UpdateGroup(Group groups);

        Task DeleteGroup(Guid id);

        //Task<bool> ChangeStatus(Guid id);
        Task AddGroups(List<Group> listGroups, List<StudentInGroup> studentInGroups);
		//Task<IEnumerable<StudentInGroupDto>> UpdateGroupByLecturer(Guid groupId, string groupName, List<string> studentIdList);


	}
}
