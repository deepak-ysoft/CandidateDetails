using CandidateDetails_API.Model;

namespace CandidateDetails_API.IServices
{
    public interface IEmployeeLeave
    {
        public Task<bool> AddUpdateEmployeeLeave(EmployeeLeave employeeLeave); // Add or update an employee leave
        public Task<bool> DeleteEmployeeLeave(int id); // Delete an employee leave
    }
}
