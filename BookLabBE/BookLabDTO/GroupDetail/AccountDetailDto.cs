using System.ComponentModel.DataAnnotations;


namespace BookLabDTO.GroupDetail
{
	public class AccountDetailDto
	{
		public Guid Id { get; set; }
		// Normal columns.
		public string FullName { get; set; }

		public string Telphone { get; set; }
		public string? StudentId { get; set; }
		public string Avatar { get; set; }

		[DataType(DataType.Date)]
		public DateTime DOB { get; set; }
	}
}
