using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class Area : BaseEntity
{
    public Guid? RoomId { get; set; }
    
    [MaxLength(50)]
    public string Name { get; set; }
    
    public bool Status { get; set; }
    
    [ForeignKey("RoomId")]
    public Room? Room { get; set; }
}