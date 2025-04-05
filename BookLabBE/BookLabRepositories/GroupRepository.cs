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
    public class GroupRepository : IGroupRepository
    {
        public async Task AddGroup(Group groups)
        {
            await GroupDAO.Instance.AddGroup(groups);
        }

        //public async Task<bool> ChangeStatus(Guid id)
        //{
        //    return await GroupDAO.Instance.ChangeStatus(id);
        //}

        public async Task DeleteGroup(Guid id)
        {
            await GroupDAO.Instance.DeleteGroup(id);
        }

        public async Task<IEnumerable<Group>> GetAllGroups()
        {
            return await GroupDAO.Instance.GetAllGroups();
        }

        public async Task<Group> GetGroupsById(Guid id)
        {
            return await GroupDAO.Instance.GetGroupsById(id);
        }

        //public async Task UpdateGroup(Group groups)
        //{
        //    await GroupDAO.Instance.UpdateGroup(groups);
        //}
        public async Task AddGroups(List<Group> listGroups, List<StudentInGroup> studentInGroups)
        {
            await GroupDAO.Instance.AddGroups(listGroups, studentInGroups);
        }
        //public async Task<IEnumerable<StudentInGroupDto>> UpdateGroupByLecturer(Guid groupId, string groupName, List<string> studentIdList)
        //{
        //    return await GroupDAO.Instance.UpdateGroupByLecturer(groupId, groupName, studentIdList);
        //}


    }
}
