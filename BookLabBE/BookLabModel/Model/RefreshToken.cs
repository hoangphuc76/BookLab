using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabModel.Model
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public string Token { get; set; }
        public DateTime Expires { get; set; }
        public DateTime Created { get; set; }
        public DateTime? Revoked { get; set; }

        // Quan hệ với User (nếu bạn có lớp User)
        public Guid AccountId { get; set; }
        public Account Account { get; set; }
    }

}
