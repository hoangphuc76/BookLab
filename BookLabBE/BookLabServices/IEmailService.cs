using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookLabDTO;

namespace BookLabServices
{
    public interface IEmailService
    {
        List<EmailTemplate> GetTemplates();
        void UpdateSelectedTemplate(int templateId);
        int GetSelectedTemplateId();
        void UpdateEmailConfiguration(EmailConfiguration newConfig);
        EmailConfiguration GetEmailConfiguration();
        Task SendEmailAsync(string toEmail, string subject, string description, string roomNumber,
            string buildingName, string bookingDate, TimeOnly startTime, TimeOnly endTime, int isSuccess,
            string rejectionReason = "");
        Task SendNoticeEmail(string toEmail, string subject, string content);
    }
}
