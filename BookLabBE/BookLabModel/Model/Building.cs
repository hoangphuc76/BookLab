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
    public class Building : BaseEntity
    {

        // Normal columns.
        [MaxLength(50)]
        public string Name { get; set; }
		[Url]
        public string Avatar { get; set; }

        //Status here mean activity and maintain (or not avaliable)
        public bool Status { get; set; }

        // Foreign keys.
        public Guid? CampusId { get; set; }
		
        [ForeignKey("CampusId")]
        public virtual Campus? Campus { get; set; }

        // Navigation Collections.
        public virtual ICollection<Room>? Rooms { get; set; }
    }
}
