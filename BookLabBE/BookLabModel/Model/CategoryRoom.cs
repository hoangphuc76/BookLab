using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class CategoryRoom : BaseEntity
    {
        
        [MaxLength(50)]
        // Normal columns.
        public string Name { get; set; }
        
        [MaxLength(50)]
        public string Code { get; set; }
        public bool Status { get; set; }

        // Navigation Collections.
        public virtual ICollection<Room>? Rooms { get; set; }
    }
}
