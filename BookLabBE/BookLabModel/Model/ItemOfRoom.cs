using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class ItemOfRoom : BaseEntity
{
    public Guid? ItemId { get; set; }
    
    public Guid? RoomId { get; set; }
    
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    
    public bool Status { get; set; }
    
    [ForeignKey("ItemId")]
    public virtual Item? Item { get; set; }
    
    [ForeignKey("RoomId")]
    public virtual Room? Room { get; set; }
}