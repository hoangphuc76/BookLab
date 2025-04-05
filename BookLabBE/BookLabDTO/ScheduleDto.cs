using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
	public class ScheduleDto
	{
		public Guid? bookingId {  get; set; }
		public Guid? groupInBookingId { get; set; }	
		public DateTime? dateTimeInBooking { get; set; }
		public SlotDto? slot { get; set; }
		public RoomDTO? room { get; set; }
		public Guid lecturerId { get; set; }
	}
}
