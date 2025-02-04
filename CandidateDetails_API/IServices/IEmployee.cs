using CandidateDetails_API.Model;

namespace CandidateDetails_API.IServices
{
    public interface IEmployee
    {
        public Task<List<Employee>> GetEmployees();// Get all employees
        public Task<List<Employee>> GetRequestedEmployees(); // Get all requested employees
        public Task<bool> AddEmployee(Employee employee); // Add or update an employee
        public Task<bool> UpdateEmployee(Employee employee); // Add or update an employee
        public Task<Employee> GetEmployeeById(int id); // Get an employee by id
        public Task<bool> DeleteEmployee(int id); // Delete an employee 
        public Task<List<EmployeeAsset>> GetEmployeeAssets(int empId);// Get all assets of an employee
        public Task<bool> AddUpdateEmployeeAssets(EmployeeAsset employeeAsset); // Add and update an asset to an employee
        public Task<bool> DeleteEmployeeAssets(int assetId); // Delete all assets of an employee
    }
}
