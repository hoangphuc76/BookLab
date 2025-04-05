using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class Booking : BaseEntity
    {

        // Normal columns.

        public Guid? LectureId { get; set; }
        public Guid? RoomId { get; set; }
        
        [Range(1, int.MaxValue)]
        public int? State { get; set; }
        
        public Guid? DescriptionId { get; set; }
        
        [MaxLength(1000)]
        public string? MoreDescription { get; set; }
        
        [Range(1, int.MaxValue)]
        public int? Type { get; set; }
        

        [ForeignKey("LectureId")]
        public virtual Account? Lecturer { get; set; } 
        
        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }
        
        [ForeignKey("DescriptionId")]
        public virtual CategoryDescription? Description { get; set; }

        public virtual ICollection<SubBooking>? SubBookings { get; set; }

    }
    
    
}
