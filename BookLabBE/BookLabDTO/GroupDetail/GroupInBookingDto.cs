using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO.GroupDetail
{
    public class GroupInBookingDto
    {
        public Guid Id { get; set; }

        // Normal columns.
        [DataType(DataType.Date)]
        public DateTime DateTimeInBooking { get; set; }

        public bool Status { get; set; }

		public virtual SubBooking? Booking { get; set; }
	}
}
