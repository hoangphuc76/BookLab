using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace BookLabModel.Model
{
    [PrimaryKey(nameof(StudentInGroupId), nameof(GroupInBookingId))]
    public class StudentInBooking : MultiKeyBaseEntity
    {
        // Primary key && Foreign key
        public Guid StudentInGroupId { get; set; }

        public Guid GroupInBookingId { get; set; }
        
        [ForeignKey("StudentInGroupId")]
        public virtual StudentInGroup? StudentInGroup { get; set; }
        
        [ForeignKey("GroupInBookingId")]
        public virtual GroupInBooking? GroupInBooking { get; set; }

        // Normal columns.
        public TimeOnly CheckInTime { get; set; }

        public TimeOnly CheckOutTime { get; set; }

        // Check roll call
        public bool Status { get; set; }
    }
}
