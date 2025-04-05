using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabModel.Model.Base;

namespace BookLabModel.Model
{
    public class Slot : BaseEntity
    {

        // Normal columns.
        public string Name { get; set; }

        public TimeOnly OpenTime { get; set; }

        public TimeOnly CloseTime { get; set; }

        // Navigation Collections.
        public virtual ICollection<GroupInBooking>? GroupInBookings { get; set; }
    }
}
