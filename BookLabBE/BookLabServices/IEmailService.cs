using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string description, string roomNumber,
            string buildingName, string bookingDate, TimeOnly startTime, TimeOnly endTime, int isSuccess,
            string rejectionReason = "");
        Task SendNoticeEmail(string toEmail, string subject, string content);
    }
}
