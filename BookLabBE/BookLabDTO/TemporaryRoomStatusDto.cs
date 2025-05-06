namespace BookLabDTO;

public class TemporaryRoomStatusDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } 
    public int TemporaryStatus { get; set; }
    public int OriginalStatus { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}