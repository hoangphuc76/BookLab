
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class Feedback : BaseEntity
    {

        // Normal columns.
        [MaxLength(1000)]
        public string FeedbackDescription { get; set; }
        
        [DisplayFormat(DataFormatString = "{0:F2}", ApplyFormatInEditMode = true)]
        public double Rating { get; set; }

        public DateTime Time { get; set; }

        public bool Status { get; set; }

        // Foreign keys.
        public Guid? LecturerId { get; set; }

        public Guid? SubBookingId { get; set; }

        public Guid? RoomId { get; set; }

        [ForeignKey("LectureId")]
        public virtual Account? Lecturer { get; set; }
        
        [ForeignKey("SubBookingId")]

        public virtual SubBooking? SubBooking { get; set; }
        
        [ForeignKey("RoomId")]

        public virtual Room? Room { get; set; }
    }
}
