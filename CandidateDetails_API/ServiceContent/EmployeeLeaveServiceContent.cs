using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using CandidateDetails_API.Models;
using Microsoft.EntityFrameworkCore;

namespace CandidateDetails_API.ServiceContent
{
    public class EmployeeLeaveServiceContent : IEmployeeLeave
    {
        private readonly ApplicationDbContext _context; // Create an instance of the database context
        public EmployeeLeaveServiceContent(ApplicationDbContext context)    // Constructor
        {
            _context = context;
        }

        public async Task<bool> AddUpdateEmployeeLeave(EmployeeLeave employeeLeave) // Add or update an employee leave
        {
            if (employeeLeave.leaveId == 0)
            {
                employeeLeave.isDelete = false;
                employeeLeave.startDate = employeeLeave.startDate.AddHours(12);
                employeeLeave.endDate = employeeLeave.endDate.AddHours(12);
                await _context.employeesleave.AddAsync(employeeLeave); // Add new employee leave
                int result = await _context.SaveChangesAsync();
                if (result > 0)
                {
                    var employee = await _context.Employees.FindAsync(employeeLeave.empId); // Find the employee
                    var calendar = new Calendar(); // Create a new calendar
                    calendar.Subject = employee.empName + " Leave";
                    calendar.StartDate = employeeLeave.startDate; // Set the start date
                    calendar.EndDate = employeeLeave.endDate; // Set the end date
                    calendar.Description = "Leave for " + employeeLeave.LeaveFor; // Set the description

                    await _context.calendar.AddAsync(calendar); // Add the calendar
                    int res = await _context.SaveChangesAsync(); // Save the changes
                    if (res > 0)
                    {
                        var empLeVM = new EmployeeLeaveVM(); // Create a new employee leave view model
                        empLeVM.calId = calendar.CalId; // Set the calendar ID
                        empLeVM.leaveId = employeeLeave.empId; // Set the employee ID
                    }
                    return true;
                }
            }
            else
            {
                employeeLeave.isDelete = false;

                _context.employeesleave.Update(employeeLeave); // Update employee leave
                int result = await _context.SaveChangesAsync();
                if (result > 0)
                {
                    var empLeave = await _context.employeeLeaveVM.FirstOrDefaultAsync(x => x.leaveId == employeeLeave.empId);

                    if (empLeave != null)
                    {
                        var cal = await _context.calendar.FirstOrDefaultAsync(x => x.CalId == empLeave.calId);
                        if (cal != null)
                        {
                            cal.StartDate = employeeLeave.startDate; // update the leave start date
                            cal.EndDate = employeeLeave.endDate; // update the leave end date  
                            cal.Description = "Leave for " + employeeLeave.LeaveFor; // update the description

                            _context.calendar.Update(cal);
                            return await _context.SaveChangesAsync() > 0;
                        }
                    }
                    return true;
                }
            }
            return false;
        }

        public async Task<bool> DeleteEmployeeLeave(int id) // Delete an employee leave
        {
            var leave = _context.employeesleave.Find(id); // Find the employee leave
            if (leave != null) // If the employee leave is found
            {
                leave.isDelete = true;
                _context.employeesleave.Update(leave); // Remove the employee leave
                return await _context.SaveChangesAsync() > 0;
            }
            return false;
        }
    }
}
