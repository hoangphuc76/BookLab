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
    public class GroupInBooking : BaseEntity
    {
        public Guid SubBookingId { get; set; }

        public Guid GroupId { get; set; }

        [ForeignKey("SubBookingId")]
        public virtual SubBooking? Booking { get; set; }
        
        [ForeignKey("GroupId")]
        public virtual Group? Group { get; set; }

        // Navigation Collections.
        public virtual ICollection<StudentInBooking>? StudentInBookings { get; set; }
    }
}
