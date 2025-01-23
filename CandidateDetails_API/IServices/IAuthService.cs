namespace CandidateDetails_API.IServices
{
    public interface IAuthService
    {
       public Task<string> GenerateJwtToken(string empId);
    }
}
