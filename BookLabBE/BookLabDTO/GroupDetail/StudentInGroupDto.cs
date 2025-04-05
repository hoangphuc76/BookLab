using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDTO.GroupDetail
{
	public class StudentInGroupDto
	{
		public Guid Id { get; set; }
		public bool Status { get; set; }
		public virtual AccountDto Student { get; set; }

	}
}
