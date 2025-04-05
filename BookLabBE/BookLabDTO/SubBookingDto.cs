using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class SubBookingDto
    {
		public Guid? Id { get; set; }
		public Guid? BookingId { get; set; }
		public Guid? ClassId { get; set; }
		public Guid? AreaId { get; set; }

		[Range(1, int.MaxValue)]
		public int Approve { get; set; }
		[MaxLength(500)]
		public string Reason { get; set; }
		public bool Private { get; set; }
		[Range(1, int.MaxValue)]
		public int TypeSlot { get; set; }

		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }
		public DateTime Date { get; set; }

		public Guid? LectureId { get; set; }	
		public Guid? RoomId { get; set; }

		[Range(1, int.MaxValue)]
		public int? State { get; set; }

		public Guid? DescriptionId { get; set; }

		[MaxLength(1000)]
		public string MoreDescription { get; set; }

		[Range(1, int.MaxValue)]
		public int? Type { get; set; }
		public int StudentQuantity { get; set; }
		public int GroupQuantity { get; set; }
	}
}
