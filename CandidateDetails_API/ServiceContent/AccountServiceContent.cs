using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CandidateDetails_API.ServiceContent
{
    public class AccountServiceContent : IAccount
    {
        private readonly ApplicationDbContext _context; // Create an instance of the database context
        public AccountServiceContent(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<(bool Success, string Message)> ChangePasswordAsync(ChangePassword changePasswordVM) // Change password
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(x => x.empId == changePasswordVM.empId); // Find the employee by ID
            if (employee == null)
            {
                return (false, "Employee not found.");
            }

            var hasher = new PasswordHasher<Employee>(); // Create an instance of PasswordHasher
            var passwordVerificationResult = hasher.VerifyHashedPassword(employee, employee.empPassword, changePasswordVM.CurrentPassword); // To varify user password is correct or not

            if (passwordVerificationResult == PasswordVerificationResult.Success) // If result us success
            {
                employee.empPassword = hasher.HashPassword(employee, changePasswordVM.NewPassword); // To convert to encrypted password.
                _context.Employees.Update(employee); // Update the employee
                await _context.SaveChangesAsync();
                return (true, "Password changed successfully.");
            }
            else
            {
                return (false, "Incorrect current password.");
            }
        }

        // Check user is valid or not
        public async Task<bool> Login(Login model)
        {
            var hasher = new PasswordHasher<Employee>();
            var emp = await _context.Employees.SingleOrDefaultAsync(u => u.empEmail == model.email);
            if (emp != null)
            {
                var passwordVerificationResult = hasher.VerifyHashedPassword(emp, emp.empPassword, model.password); // To verify password
                if (passwordVerificationResult == PasswordVerificationResult.Success)
                    return true;
            }
            return false;
        }
    }
}
