namespace CandidateDetails_API.IServices
{
    public interface IEmailService
    {
        public Task SendEmailAsync(string toEmail, string subject, string body); // Send email
    }
}
