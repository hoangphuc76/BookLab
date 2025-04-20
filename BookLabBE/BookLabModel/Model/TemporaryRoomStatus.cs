
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model;
using BookLabModel.Model.Base;

public class TemporaryRoomStatus : BaseEntity
{
    public Guid RoomId { get; set; }
    public int TemporaryStatus { get; set; }
    public int OriginalStatus { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    // Navigation property
    [ForeignKey("RoomId")]
    public Room? Room { get; set; }
}