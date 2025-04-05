
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class Room : BaseEntity 
    {

        // Normal columns.
        [MaxLength(50)]
        public string Name { get; set; }
        
        [MaxLength(10)]
        public string RoomNumber { get; set; }
         
        [Url]
        public string Avatar { get; set; }
        [DisplayFormat(DataFormatString = "{0:F2}", ApplyFormatInEditMode = true)]
        public double? Rating { get; set; }
        
        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }
        
        [Range(1, int.MaxValue)]
        public int GroupSize { get; set; }
        
        [MaxLength(50)]
        public string TypeSlot { get; set; }
        

        //Status here mean allow group or not 
        public bool OnlyGroupStatus { get; set; }

        public int RoomStatus { get; set; }
        // Foreign keys.
        public Guid? ManagerId { get; set; }

        public Guid? CategoryRoomId { get; set; }

        public Guid? BuildingId { get; set; }
        
        [ForeignKey("ManagerId")]
        public virtual Account? Manager { get; set; }
        
        [ForeignKey("CategoryRoomId")]
        public virtual CategoryRoom? CategoryRoom { get; set; }
        
        [ForeignKey("BuildingId")]
        public virtual Building? Building { get; set; }

		// Navigation Collections.
		public virtual ICollection<ImageRoom>? ImageRooms { get; set; }

		public virtual ICollection<Booking>? Bookings { get; set; }

        public virtual ICollection<FavouriteRoom>? FavouriteRooms { get; set; }

        public virtual ICollection<Feedback>? Feedbacks { get; set; }
    }
}
