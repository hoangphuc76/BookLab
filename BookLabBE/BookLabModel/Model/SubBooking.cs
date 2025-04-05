using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class SubBooking : BaseEntity
{
    public Guid? BookingId { get; set; }
    public Guid? ClassId { get; set; }
    public Guid? AreaId { get; set; }
    
    [Range(1, int.MaxValue)]
    public int Approve { get; set; }
    [MaxLength(500)]
    public string? Reason { get; set; }
    public bool Private { get; set; }
    [Range(1,int.MaxValue)]
    public int TypeSlot { get; set; }
    
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public DateTime Date { get; set; }
    
    [ForeignKey("BookingId")]
    public virtual Booking? Booking { get; set; }
    [ForeignKey("ClassId")]
    public virtual Class? Class { get; set; }
    [ForeignKey("AreaId")]
    public virtual Area? Area { get; set; }
    
    public virtual ICollection<GroupInBooking>? GroupInBookings { get; set; }
    
    public virtual ICollection<Feedback>? Feedbacks { get; set; }
    
}