using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class BuildingDto
    {
        public Guid Id { get; set; }

        // Normal columns.
        public string Name { get; set; }

        public string? Avatar { get; set; }

        //Status here mean activity and maintain (or not avaliable)
        public bool Status { get; set; }

        // Foreign keys.
        public Guid? CampusId { get; set; }  
        public int? RoomCount { get; set; }

    }
}
