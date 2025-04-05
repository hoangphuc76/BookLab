using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class StudentInGroup : BaseEntity
    {

        // Normal columns.

        // Foreign keys.
        public Guid? GroupId { get; set; }

        public Guid? StudentId { get; set; }
        
        public bool Status { get; set; }
        
        [ForeignKey("GroupId")]
        public virtual Group? Group { get; set; }
        
        [ForeignKey("StudentId")]
        public virtual Account? Student { get; set; }

        // Navigation Collections.
        public virtual ICollection<StudentInBooking>? StudentInBookings { get; set; }

    }
}
