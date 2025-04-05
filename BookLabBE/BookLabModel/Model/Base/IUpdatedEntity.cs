using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabModel.Model.Base
{
    public interface IUpdatedEntity
    {
        DateTime? UpdatedAt { get; set; }

        Guid? UpdatedBy { get; set; }
    }
}
