namespace BookLabDTO;

public class StudentInBookingDto
{
    public Guid StudentInGroupId { get; set; }
    public Guid GroupInBookingId { get; set; }
    public TimeOnly CheckInTime { get; set; }
    public TimeOnly CheckOutTime { get; set; }
    public bool Status { get; set; }
}