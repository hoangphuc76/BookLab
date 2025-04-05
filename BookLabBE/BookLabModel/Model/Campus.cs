using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class Campus : BaseEntity
    {

        // Normal columns.
        [MaxLength(50)]
        public string Name { get; set; }

        [MaxLength(100)]
        public string Address { get; set; }
        [Url]
        public string Avatar { get; set; }
        
        [MaxLength(20)]
        [Phone]
        public string Telphone { get; set; }

        //Status here mean activity and maintain (or not avaliable)
        public bool Status { get; set; }

        // Navigation Collections.
        public virtual ICollection<Building>? Buildings { get; set; }
        
		public virtual ICollection<Account>? Accounts { get; set; }
    }
}
