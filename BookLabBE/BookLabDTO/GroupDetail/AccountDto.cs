using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO.GroupDetail
{
	public class AccountDto
	{
		public Guid Id { get; set; }

		// Normal columns.
		public string Gmail { get; set; }

		public string? QrCode { get; set; }

		public string? AccountName { get; set; }

		public bool? Status { get; set; }
		
		public Guid? CampusId { get; set; }
		
		public string CampusName { get; set; }
		
		public int RoleId { get; set; }

		// Navigation Collections.
		public virtual AccountDetailDto? AccountDetail { get; set; }

	}
}
