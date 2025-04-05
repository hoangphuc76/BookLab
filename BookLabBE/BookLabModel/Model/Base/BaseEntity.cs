using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace BookLabModel.Model.Base
{
    [PrimaryKey(nameof(Id))]
    public abstract class BaseEntity : ITemporarilyRemovedEntity, ICreatedEntity, IUpdatedEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public DateTime? CreatedAt { get; set; } = DateTime.Now;

        public Guid? CreatedBy { get; set; }

        public bool? IsDeleted { get; set; } = false;
        
        public DateTime? RemovedAt { get; set; }

        public Guid? RemovedBy { get; set; }
        
        public DateTime? UpdatedAt { get; set; }

        public Guid? UpdatedBy { get; set; }
        
        
    }
}
