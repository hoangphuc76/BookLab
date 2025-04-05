
using System.Runtime.InteropServices.JavaScript;

namespace BookLabDTO;

public class AttendanceRequestGetDto
{
    public Guid studentInGroupId { get; set; }
    public Guid groupInBookingId { get; set; }
    public string Avatar { get; set; }
    public string FullName { get; set; }
    public string StudentId { get; set; }
    public bool Status { get; set; }
    public string TelPhone { get; set; }
    public DateTime? Dob { get; set; }
}