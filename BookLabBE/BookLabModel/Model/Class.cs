
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model;

public class Class : BaseEntity
{
    public Guid? LectureId { get; set; }
    
    [MaxLength(50)]
    public string SubjectCode { get; set; }
    
    [MaxLength(50)]
    public string Name { get; set; }
    
    public bool Status { get; set; }
    
    [ForeignKey("LectureId")]
    public virtual Account? Lecture { get; set; }
}