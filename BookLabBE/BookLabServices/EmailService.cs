using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using BookLabDTO;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Hosting;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using System.Text.Json.Serialization;

namespace BookLabServices
{
    public class EmailService : IEmailService

    {
        private EmailConfiguration _emailConfig;
        private readonly string _templatePath;
        private readonly string _configPath;
        private readonly string _selectedTemplatePath;
        private List<EmailTemplate> _templates;
        private int _selectedTemplateId;
        public EmailService(EmailConfiguration emailConfig, string templatePath, string configPath, string selectedTemplatePath)
        {
            _emailConfig = emailConfig;
            _templatePath = templatePath;
            _configPath = configPath;
            _selectedTemplatePath = selectedTemplatePath;
            LoadTemplates();
            LoadSelectedTemplate();
        }

        private void LoadTemplates()
        {
            if (!File.Exists(_templatePath))
            {
                throw new FileNotFoundException($"Không tìm thấy file: {_templatePath}");
            }

            string json = File.ReadAllText(_templatePath);
            var templateData = JsonSerializer.Deserialize<EmailTemplateData>(json);
            _templates = templateData.Templates;
        }
        private void LoadSelectedTemplate()
        {
            if (!File.Exists(_selectedTemplatePath))
            {
                throw new FileNotFoundException($"Không tìm thấy file: {_selectedTemplatePath}");
            }

            string json = File.ReadAllText(_selectedTemplatePath);
            var selectedData = JsonSerializer.Deserialize<SelectedTemplateData>(json);
            _selectedTemplateId = selectedData.SelectedTemplateId;
        }

        // Thêm phương thức để cập nhật EmailConfiguration
        public void UpdateEmailConfiguration(EmailConfiguration newConfig)
        {
            _emailConfig = newConfig;
            string json = JsonSerializer.Serialize(newConfig, new JsonSerializerOptions { WriteIndented = true });
            string tempFilePath = _configPath + ".new";
            File.WriteAllText(tempFilePath, json);

            if (File.Exists(_configPath))
            {
                File.Delete(_configPath);
            }
            File.Move(tempFilePath, _configPath);
        }

        // Thêm phương thức để lấy EmailConfiguration hiện tại
        public EmailConfiguration GetEmailConfiguration()
        {
            return _emailConfig;
        }
        // Thêm phương thức để lấy danh sách template
        public List<EmailTemplate> GetTemplates()
        {
            return _templates;
        }
        // Thêm phương thức để lấy template được chọn
        public int GetSelectedTemplateId()
        {
            return _selectedTemplateId;
        }
        // Thêm phương thức để cập nhật template được chọn
        public void UpdateSelectedTemplate(int templateId)
        {
            if (!_templates.Any(t => t.Id == templateId))
            {
                throw new ArgumentException($"Template ID {templateId} không tồn tại.");
            }

            _selectedTemplateId = templateId;
            var selectedData = new SelectedTemplateData { SelectedTemplateId = templateId };
            string json = JsonSerializer.Serialize(selectedData, new JsonSerializerOptions { WriteIndented = true });
            string tempFilePath = _selectedTemplatePath + ".new";
            File.WriteAllText(tempFilePath, json);

            if (File.Exists(_selectedTemplatePath))
            {
                File.Delete(_selectedTemplatePath);
            }
            File.Move(tempFilePath, _selectedTemplatePath);
        }
        public async Task SendEmailAsync(string toEmail, string subject, string description, string roomNumber,
            string buildingName, string bookingDate, TimeOnly startTime, TimeOnly endTime, int isSuccess,
            string rejectionReason = "")
        {
            var emailTemplate = GenerateBookingEmailTemplate(toEmail, subject, description, roomNumber, buildingName,
                bookingDate, startTime, endTime, isSuccess, rejectionReason);

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
            // Lấy template được chọn từ danh sách _templates
            var selectedTemplate = _templates.FirstOrDefault(t => t.Id == _selectedTemplateId);
            if (selectedTemplate == null)
            {
                throw new InvalidOperationException("Không tìm thấy template được chọn.");
            }

            // Tạo message dựa trên isSuccess
            var message = isSuccess == 10
                ? "You have a room approval request, please consider approving it."
                : isSuccess == 0 ? ""
                : "Unfortunately, your room booking request has been declined.";

            // Tạo rejection message nếu có
            var rejection = isSuccess == 10 || isSuccess == 0
                ? ""
                : $"<p style=\"color: red; font-weight: bold;\">Reason for rejection: {rejectionReason}</p>";

            // Lấy nội dung template và thay thế các placeholder
            string template = selectedTemplate.Content;
            return template
                .Replace("{0}", email)
                .Replace("{1}", subject)
                .Replace("{2}", description)
                .Replace("{3}", roomNumber)
                .Replace("{4}", buildingName)
                .Replace("{5}", message)
                .Replace("{6}", bookingDate)
                .Replace("{7}", startTime.ToString(@"hh\:mm"))
                .Replace("{8}", endTime.ToString(@"hh\:mm"))
                .Replace("{9}", rejection);
        }
    }

    // Class để deserialize JSON
    public class EmailTemplateData
    {
        [JsonPropertyName("templates")]
        public List<EmailTemplate> Templates { get; set; }
    }

    public class EmailTemplate
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }
    }

    public class SelectedTemplateData
    {
        [JsonPropertyName("selectedTemplateId")]
        public int SelectedTemplateId { get; set; }
    }
}