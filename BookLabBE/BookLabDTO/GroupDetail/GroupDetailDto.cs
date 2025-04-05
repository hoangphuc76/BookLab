using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class GroupDetailDto
    {
        public Guid Id { get; set; }

        // Normal columns.
        public string Name { get; set; }

        public bool Status { get; set; }

        public int upcomingBooking { get; set; }
        public int pendingBooking { get; set; }

        public int completedBooking { get; set; }

        // Navigation Collections.
        public virtual ICollection<StudentInGroupDetailDto>? StudentInGroups { get; set; }


    }
}