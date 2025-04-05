using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class BookingDto
    {
        public Guid Id { get; set; }
        public string Description { get; set; }
        public string? BuildingName { get; set; }
        public string? LectureName { get; set; }
        public string RoomNumber { get; set; }
        public string LectureEmail { get; set; }
        
        public int TypeSlot { get; set; }
        
        public DateTime? Date { get; set; }
        
        public TimeOnly? StartTime { get; set; }
        
        public TimeOnly? EndTime { get; set; }
        public List<StudentDto>? Students { get; set; }
        public List<StudentInBookingDto>? StudentInBookings { get; set; }
        public string? StudentFileExcel { get; set; }
    }
}
