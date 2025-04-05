using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class PolicyOfRoom : BaseEntity
{
    public Guid? RoomId { get; set; }
    
    [MaxLength(500)]
    public string Description { get; set; }
    
    public bool Status { get; set; }
    
    [ForeignKey("RoomId")]
    public virtual Room? Room { get; set; }
}