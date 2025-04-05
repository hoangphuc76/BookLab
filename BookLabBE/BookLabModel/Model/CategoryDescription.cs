using System.ComponentModel.DataAnnotations;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class CategoryDescription : BaseEntity
{
    [MaxLength(200)]
    public string Name { get; set; }
    
    public bool NeedMoreDescrioption { get; set; }
    
    public bool Status { get; set; }
}
