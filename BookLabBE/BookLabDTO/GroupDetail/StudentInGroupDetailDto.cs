using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class StudentInGroupDetailDto
    {
        public Guid StudentInGroupId { get; set; }
        public Boolean StudentInGroupStatus { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public int StudentStatus { get; set; }
        public string Gmail { get; set; }
        public string Telphone { get; set; }
        public string StudentCode { get; set; }
        public string Avatar { get; set; }
        public DateOnly DOB { get; set; }


    }
}