namespace BookLabDTO;

public class AttendanceRecord
{
    public Guid studentInGroupId { get; set; } 
    public Guid groupInBookingId { get; set; }
    public string Status { get; set; } // "Absent" hoặc "Attendance"
}