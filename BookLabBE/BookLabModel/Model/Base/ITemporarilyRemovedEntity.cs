using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabModel.Model.Base
{
    public interface ITemporarilyRemovedEntity
    {
        bool? IsDeleted { get; set; }
        DateTime? RemovedAt { get; set; }

        Guid? RemovedBy { get; set; }
    }
}
