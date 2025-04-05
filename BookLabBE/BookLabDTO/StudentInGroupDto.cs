using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class StudentInGroupDto
    {
        public Guid StudentInGroupId { get; set; }
        public Guid StudentId { get; set; }
        public string FullName { get; set; }
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }

        public string StudentCode { get; set; }
        public string Avatar { get; set; }

    }

}