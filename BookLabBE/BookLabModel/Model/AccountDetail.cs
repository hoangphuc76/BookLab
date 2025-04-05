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
    public class AccountDetail : MultiKeyBaseEntity
    {
        // Primary key && Foreign key
        [Key, ForeignKey("Account")]
        public Guid Id { get; set; }
        public virtual Account? Account { get; set; }

        // Normal columns.
 
        
        [MaxLength(50)]
        public string FullName { get; set; }
        
        [MaxLength(20)]
        [Phone]
        public string Telphone { get; set; }
        [MaxLength(20)]
        public string? StudentId { get; set; }
        
        // [Url]
        public string? Avatar {  get; set; }

        [DataType(DataType.Date)]
        public DateTime DOB { get; set; }



    }
}
