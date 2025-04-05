using System.ComponentModel.DataAnnotations;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class CategoryItem : BaseEntity
{
    [MaxLength(50)]
    public string Name { get; set; }
    public bool Status { get; set; }
    
}