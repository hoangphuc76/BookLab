using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace BookLabModel.Model
{
    [PrimaryKey(nameof(AccountId), nameof(RoomId))]
    public class FavouriteRoom : MultiKeyBaseEntity
    {
        // Primary key && Foreign key
        
        public Guid AccountId { get; set; }

        public Guid RoomId { get; set; }
        
        [ForeignKey("AccountId")]
        public virtual Account? Account { get; set; }
        
        [ForeignKey("RoomId")]
        public virtual Room? Room { get; set; }
    }
}
