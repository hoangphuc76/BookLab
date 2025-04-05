using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class StudentDto
    {
        // Primary key && Foreign key
        public Guid Id { get; set; }

        // Normal columns.
        public string? FullName { get; set; }
        public string? AvatarUri { get; set; }

        public string? Telphone { get; set; }
        public string? Email { get; set; }
        public string? StudentId { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DOB { get; set; }



    }
}
