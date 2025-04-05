using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
	public class GroupInBookingCompreDto
	{
		public Guid GroupId {  get; set; }
		public Guid GroupInSubBookingId { get; set; }
		public DateTime Date {  get; set; }
		public TimeOnly StartTime { get; set; }
		public TimeOnly EndTime { get; set; }
		public string RoomName { get; set; }
		public Guid RoomId { get; set; }
		public Guid SubBookingId { get; set; }
		public int Approve { get; set; }
		public List<Guid> StudentInGroupIds { get; set; }
	}
}
