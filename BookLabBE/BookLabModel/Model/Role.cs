using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace BookLabModel.Model

{     
    [PrimaryKey(nameof(Id))]
    public class Role 
    {
        public int Id { get; set; }
        [MaxLength(50)]
        // Normal columns.
        public string Name { get; set; }

        public bool Status { get; set; }

        // Navigation Collections.
        public virtual ICollection<Account>? Accounts { get; set; }
    }
}
