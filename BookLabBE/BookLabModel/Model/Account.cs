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
    public class Account : BaseEntity
    {
        [MaxLength(20)]
        public string AccountName {get; set;}
        // Normal columns.
        [MaxLength(50)]
        [EmailAddress]
        public string Gmail { get; set; }
        
        //[Url]
        public string? QrCode { get; set; }
        
        public bool Status { get; set; }

        // Foreign keys.

        public int RoleId { get; set; }

        public Guid? CampusId { get; set; }

        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }
        
        [ForeignKey("CampusId")]
        public virtual Campus? Campus { get; set; }

        // Navigation Collections.
        public virtual AccountDetail? AccountDetail { get; set; }

        public virtual Room? Room { get; set; }

        public virtual ICollection<Group>? Groups { get; set; }

        public virtual ICollection<StudentInGroup>? StudentsInGroup { get; set;}

        public virtual ICollection<Booking>? Bookings { get; set; }

        public virtual ICollection<Feedback>? Feedbacks { get; set; }

        public virtual ICollection<FavouriteRoom>? FavoriteRooms { get; set; }
        
        public virtual ICollection<RefreshToken>? RefreshTokens { get; set; }
    }
}
