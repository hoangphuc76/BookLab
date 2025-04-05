using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO.GroupDetail
{
    public class GroupDto
    {
        public Guid Id { get; set; }

        // Normal columns.
        public string Name { get; set; }

        public bool Status { get; set; }

        // Navigation Collections.
        public virtual ICollection<StudentInGroupDetailDto>? StudentInGroups { get; set; }

        public virtual IEnumerable<GroupInSubBookingDetailDto>? GroupInBookings { get; set; }
    }
}
