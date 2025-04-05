using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using BookLabDTO;

namespace BookLabServices
{
    public class EmailService : IEmailService
    {
        private readonly EmailConfiguration _emailConfig;

        public EmailService(EmailConfiguration emailConfig)
        {
            _emailConfig = emailConfig;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string description, string roomNumber,
            string buildingName, string bookingDate, TimeOnly startTime, TimeOnly endTime, int isSuccess,
            string rejectionReason = "")
        {
            var emailTemplate = GenerateBookingEmailTemplate(toEmail, subject, description, roomNumber, buildingName,
                bookingDate, startTime, endTime,
                isSuccess, rejectionReason);

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_emailConfig.FromName, _emailConfig.From));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = emailTemplate };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_emailConfig.SmtpServer, 587, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        //Thong bao cho follower khi artist up nhac moi
        public async Task SendNoticeEmail(string toEmail, string subject, string content)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_emailConfig.FromName, _emailConfig.From));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Plain) { Text = content };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_emailConfig.SmtpServer, 587, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        private string GenerateBookingEmailTemplate(string email, string subject, string description, string roomNumber,
            string buildingName, string bookingDate, TimeOnly startTime, TimeOnly endTime, int isSuccess,
            string rejectionReason = "")
        {
            var result = string.Format(
                @"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{1} - FAISE</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse;"">
        <tr>
            <td style=""padding: 0;"">
                <table role=""presentation"" style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background-color: #0078D4; padding: 20px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 28px;"">Faise</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style=""padding: 30px;"">
                            <h2 style=""color: #0078D4; margin-top: 0; margin-bottom: 20px; font-size: 24px;"">{1}</h2>
                            <p style=""margin-top: 0; margin-bottom: 20px;"">Hello, {0}</p>
                            <p style=""margin-top: 0; margin-bottom: 20px;"">
                                {5}
                            </p>
                            <p style=""margin-top: 0; margin-bottom: 20px;""><strong>Description:</strong> {2}</p>
                            <p style=""margin-top: 0; margin-bottom: 20px;""><strong>Room Number:</strong> {3}</p>
                            <p style=""margin-top: 0; margin-bottom: 20px;""><strong>Building Name:</strong> {4}</p>
                            <p style=""margin-top: 0; margin-bottom: 20px;""><strong>Booking Date:</strong> {6}</p>
                            <p style=""margin-top: 0; margin-bottom: 20px;""><strong>Start Time:</strong> {7}</p>
                            <p style=""margin-top: 0; margin-bottom: 20px;""><strong>End Time:</strong> {8}</p>
                            {9}
                            <p style=""margin-top: 0; margin-bottom: 0;"">Best regards,<br>The Faise Team</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 14px; color: #888888;"">
                            <p style=""margin: 0;"">This is an automated message, please do not reply to this email.</p>
                            <p style=""margin: 10px 0 0;"">© 2024 VibeZ. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
",
                email, subject, description, roomNumber, buildingName,
                isSuccess == 10
                    ? "You have a room approval request, please consider approving it."
                    : isSuccess == 0 ?  ""
                        : "Unfortunately, your room booking request has been declined.",
                bookingDate, startTime.ToString(@"hh\:mm"), endTime.ToString(@"hh\:mm"),
                isSuccess == 10 || isSuccess == 0
                    ? ""
                    : $"<p style=\"color: red; font-weight: bold;\">Reason for rejection: {rejectionReason}</p>"
            );
            return result;
        }
    }
}