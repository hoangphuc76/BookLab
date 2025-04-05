using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class Item : BaseEntity
{
    public Guid? CategoryItemId { get; set; }
    
    [MaxLength(50)]
    public string Name { get; set; } 
    
    public bool Status { get; set; }
    
    [ForeignKey("CategoryItemId")]
    public virtual CategoryItem? CategoryItem { get; set; }
    
}