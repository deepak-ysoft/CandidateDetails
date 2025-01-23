using CandidateDetails_API.Model;

namespace CandidateDetails_API.IServices
{
    public interface IAccount
    {
        public Task<bool> Login(Login model);
        public Task<(bool Success, string Message)> ChangePasswordAsync(ChangePassword changePasswordVM); // Change password   
    }
}
