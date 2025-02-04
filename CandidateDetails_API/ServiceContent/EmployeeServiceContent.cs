using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using CandidateDetails_API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CandidateDetails_API.ServiceContent
{
    public class EmployeeServiceContent : IEmployee
    {
        private readonly IWebHostEnvironment _env;
        private readonly ApplicationDbContext _context; // Create an instance of the database context
        public EmployeeServiceContent(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<List<Employee>> GetEmployees() // Get all employees
        {
            var list = await _context.Employees.Where(x => x.isDelete == false && x.isActive == true).ToListAsync(); // Get all employees from the database
            return list;
        }
        public async Task<List<Employee>> GetRequestedEmployees() // Get all employees
        {
            var list = await _context.Employees.Where(x => x.isDelete == false && x.isActive == false).ToListAsync(); // Get all employees from the database
            return list;
        }

        public async Task<bool> AddEmployee(Employee employee) // Add an employee
        {
            if (employee.empId == 0) // Add new employee
            {
                string fileName = employee.Photo?.FileName != "Default.jpg" ? UploadUserPhoto(employee.Photo) : "Default.jpg";
                var hasher = new PasswordHasher<Employee>();
                employee.ImagePath = fileName;
                if (employee.RoleId == 6)
                {
                    employee.isActive = true;
                }
                else
                {
                    employee.isActive = false;
                }
                employee.empPassword = hasher.HashPassword(employee, employee.empPassword);
                employee.isDelete = false;

                await _context.Employees.AddAsync(employee);
                int result = await _context.SaveChangesAsync();

                if (result > 0)
                    return true;
            }
            return false;
        }

        public async Task<bool> UpdateEmployee(Employee employee) // Update an employee
        {
            if (employee.empId != 0) // Update existing employee
            {
                var previousEmp = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(x => x.empId == employee.empId);

                if (previousEmp == null)
                    return false; // Employee not found

                string fileName = employee.Photo?.FileName != "Default.jpg"
                    ? UploadUserPhoto(employee.Photo)
                    : previousEmp.ImagePath;

                if (employee.Photo?.FileName != "Default.jpg")
                {
                    await DeleteUserImageAsync(previousEmp);
                }
                if (previousEmp.RoleId == 5)
                {
                    employee.RoleId = 5;
                }
                employee.ImagePath = fileName;
                employee.empPassword = previousEmp.empPassword;
                employee.isActive = true;
                employee.isDelete = false;

                _context.Employees.Update(employee);
                int result = await _context.SaveChangesAsync();

                if (result > 0)
                {
                    var empBirth = await _context.employeeBirthdays.FirstOrDefaultAsync(x => x.empId == employee.empId);
                    if (empBirth!=null)
                    {
                        var cal = await _context.calendar.FirstOrDefaultAsync(x => x.CalId == empBirth.calId);
                        if (cal != null)
                        {
                            cal.StartDate = employee.empDateOfBirth;
                            cal.EndDate = employee.empDateOfBirth;

                            _context.calendar.Update(cal);

                            return await _context.SaveChangesAsync() > 0;
                        }
                    }
                    else
                    {
                        string des = $"{employee.empName} birthday";
                        var calendar = new Calendar
                        {
                            Subject = "Birthday",
                            Description = des,
                            StartDate = employee.empDateOfBirth,
                            EndDate = employee.empDateOfBirth,
                        };
                        await _context.calendar.AddAsync(calendar);

                        if (await _context.SaveChangesAsync() > 0)
                        {
                            var empBirthday = new EmployeeBirthday
                            {
                                calId = calendar.CalId,
                                empId = employee.empId,
                            };
                            await _context.employeeBirthdays.AddAsync(empBirthday);
                            return await _context.SaveChangesAsync() > 0;
                        }
                    }
                }
            }
            return false;
        }

        // To upload user image when user select image
        private string UploadUserPhoto(IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
            { return null; }
            string shortGuid = Guid.NewGuid().ToString().Substring(0, 8);
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            string originalName = Path.GetFileNameWithoutExtension(photo.FileName);

            // Shorten the original name if it’s longer than 10 characters
            string shortenedName = originalName.Length > 10 ? originalName.Substring(0, 10) : originalName;

            string folder = Path.Combine(_env.ContentRootPath, "uploads/images/employee");
            string fileName = $"{shortGuid}_{timestamp}_{shortenedName}{Path.GetExtension(photo.FileName)}";
            string filePath = Path.Combine(folder, fileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                photo.CopyTo(fileStream);
            }

            return fileName;
        }
        public async Task DeleteUserImageAsync(Employee emp) // Marked as async
        {
            var defaultPath = "Default.jpg";
            string fileName = Path.GetFileName(emp.ImagePath);
            var filePath = Path.Combine(_env.ContentRootPath + "\\uploads\\images\\employee\\", fileName ?? string.Empty); // Combine paths

            // Check if the employee exists and the file path is not the default image
            if (emp != null && fileName != defaultPath && File.Exists(filePath))
            {
                File.Delete(filePath); // Delete the file
                await _context.SaveChangesAsync(); // Use async version of SaveChanges
            }
        }

        public async Task<Employee> GetEmployeeById(int id) // Get an employee by ID
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(x => x.empId == id); // Find the employee by ID
            return employee; // Return the employee
        }


        public async Task<bool> DeleteEmployee(int id) // Delete an employee
        {
            var employee = await _context.Employees.FindAsync(id); // Find the employee by ID
            var employeeBirthday = await _context.employeeBirthdays.FindAsync(employee.empId); // Find the employee by ID
            if (employeeBirthday != null)
            {
                _context.employeeBirthdays.Remove(employeeBirthday); // First remove foreign key refrence
                await _context.SaveChangesAsync();
            }
            if (employee == null)
            {
                return false;
            }
            var existingEntity = _context.ChangeTracker.Entries<Candidate>().FirstOrDefault(e => e.Entity.id == employee.empId); // Get existing employee

            if (existingEntity != null)     // If existing employee is not null
            {
                _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing employee
            }
            employee.isDelete = true;
            employee.isActive = true;
            _context.Employees.Update(employee); // Remove the employee
            int result = await _context.SaveChangesAsync();
            if (result > 0)
                return true;
            return false;
        }

        public async Task<List<EmployeeAsset>> GetEmployeeAssets(int empId) // Get all assets of an employee
        {
            var data = await _context.EmployeeAssets.Where(x => x.EmpId == empId).ToListAsync(); // Get all assets of an employee
            return data;
        }

        public async Task<bool> AddUpdateEmployeeAssets(EmployeeAsset employeeAsset) 
        {
            if(employeeAsset.AssetId == 0)
            {
                _context.EmployeeAssets.Add(employeeAsset);
                return await _context.SaveChangesAsync() > 0;
            }
            else
            {
                _context.EmployeeAssets.Update(employeeAsset);
                return await _context.SaveChangesAsync() > 0;
            }
        }

        public async Task<bool> DeleteEmployeeAssets(int assetId)
        {
            var employeeAsset = await _context.EmployeeAssets.FirstOrDefaultAsync(x => x.AssetId == assetId);
            if (employeeAsset != null)
            {
                _context.EmployeeAssets.Remove(employeeAsset);
                return await _context.SaveChangesAsync() > 0;
            }
            return false;
        }
    }
}
