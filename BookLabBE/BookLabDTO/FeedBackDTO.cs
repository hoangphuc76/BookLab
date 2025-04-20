using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO
{
    public class FeedBackDTO
    {
        public Guid Id { get; set; }

        public DateTime? CreatedAt { get; set; }

        public Guid? CreatedBy { get; set; }

        public bool? IsDeleted { get; set; }

        public DateTime? RemovedAt { get; set; }

        public Guid? RemovedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public Guid? UpdatedBy { get; set; }

        public string FeedbackDescription { get; set; }

        public double Rating { get; set; }

        public DateTime Time { get; set; }

        public bool Status { get; set; }

        public string AccountName { get; set; }

        public string Avatar { get; set; }
    }
}
