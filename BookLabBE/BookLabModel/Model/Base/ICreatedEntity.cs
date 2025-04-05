using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabModel.Model.Base
{
    public interface ICreatedEntity
    {
        DateTime? CreatedAt { get; set; }

        Guid? CreatedBy { get; set; }
    }
}
