using CandidateDetails_API.Model;

namespace CandidateDetails_API.IServices
{
    public interface IEmployee
    {
        public Task<List<Employee>> GetEmployees();// Get all employees
        public Task<List<Employee>> GetRequestedEmployees(); // Get all requested employees
        public Task<bool> AddEmployee(Employee employee); // Add or update an employee
        public Task<bool> UpdateEmployee(Employee employee); // Add or update an employee
        public Task<bool> DeleteEmployee(int id); // Delete an employee 
    }
}
