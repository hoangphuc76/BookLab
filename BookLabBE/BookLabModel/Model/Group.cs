using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class Group : BaseEntity
    {

        // Normal columns.
        [MaxLength(50)]
        public string Name { get; set; }

        public bool Status { get; set; }

        // Foreign keys.
        public Guid? LecturerId { get; set; }
        
        [ForeignKey("LecturerId")]
        public virtual Account? Lecturer { get; set; }

        // Navigation Collections.
        public virtual ICollection<StudentInGroup>? StudentInGroups { get; set;}

        public virtual ICollection<GroupInBooking>? GroupInBookings { get; set;}
    }
}
