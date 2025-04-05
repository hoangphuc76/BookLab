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
	public class ImageRoom : BaseEntity
	{

        // Normal columns.
        [Url]
        public string ImageURL { get; set; }

        // Foreign keys.
        public Guid? RoomId { get; set; }
		
        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }
	}
}
