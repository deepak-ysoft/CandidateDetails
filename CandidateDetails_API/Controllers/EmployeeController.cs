using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployee _service; // Create an instance of the service
        private readonly ApplicationDbContext _context;  // Create an instance of the database context
        public EmployeeController(IEmployee service, ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }

        /// <summary>
        ///   Get all employees
        /// </summary>
        /// <returns>Employee list</returns>
        [Authorize(Roles = "Admin,HR")]
        [HttpGet("GetEmployees")]
        public async Task<IActionResult> Employees()
        {
            try
            {
                var employees = await _service.GetEmployees(); // Get all employees
                var requestedEmployees = await _service.GetRequestedEmployees(); // Get all requested employees
                int requestedEmpCount = requestedEmployees.Count();
                return Ok(new { success = true, res = employees, requestres = requestedEmployees, reqEmpCount = requestedEmpCount });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        ///   Add an employee
        /// </summary>
        /// <param name="employee"> Employee model object</param>
        /// <returns>true if add or update success</returns>
        [AllowAnonymous]
        [HttpPost("AddEmployee")]
        public async Task<IActionResult> AddEmployee([FromForm] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var emailExists = await _context.Employees.AnyAsync(u => u.empEmail.ToLower() == employee.empEmail.ToLower()); // To check duplicate emails.
                if (emailExists)
                {
                    return Ok(new { success = false, message = "Duplicate Email" });
                }
                var result = await _service.AddEmployee(employee); // Add or update an employee
                if (result)
                {
                    return Ok(new { success = true, message = "Employee added successfully" });
                }
                return Ok(new { success = false, message = "Failed to add employee" });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        ///   Add an employee
        /// </summary>
        /// <param name="employee"> Employee model object</param>
        /// <returns>true if add or update success</returns>
        [Authorize]
        [HttpPost("UpdateEmployee")]
        public async Task<IActionResult> UpdateEmployee([FromForm] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var emailExists = await _context.Employees.AnyAsync(u => u.empEmail.ToLower() == employee.empEmail.ToLower() && u.empId != employee.empId); // To check duplicate emails.
                if (emailExists)
                {
                    return Ok(new { success = false, message = "Duplicate Email" });
                }
                var result = await _service.UpdateEmployee(employee); // Add or update an employee
                var employeeData = await _service.GetEmployeeById(employee.empId);
                if (result)
                {
                    return Ok(new { success = true, employee = employeeData, message = "Employee updated successfully" });
                }
                return Ok(new { success = false, message = "Failed to update employee" });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet("GetEmployeeById/{empId}")]
        public async Task<IActionResult> GetEmployeeById(int empId)
        {
            try
            {
                var employee = await _service.GetEmployeeById(empId); // Get an employee by ID
                if (employee != null)
                {
                    return Ok(new { success = true, employee = employee });
                }
                return Ok(new { success = false, message = "Employee not found" });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



        /// <summary>
        ///  Delete an employee
        /// </summary>
        /// <param name="empId">Employee id</param>
        /// <returns>true if delete is success</returns>
        [Authorize(Roles = "Admin,HR")]
        [HttpDelete("DeleteEmployee/{empId}")]
        public async Task<IActionResult> DeleteEmployee(int empId)
        {
            try
            {
                var result = await _service.DeleteEmployee(empId); // Delete an employee
                if (result)
                {
                    return Ok(new { success = true, message = "Employee deleted successfully" });
                }
                return Ok(new { success = false, message = "Failed to delete employee" });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Get all assets of an employee
        /// </summary>
        /// <param name="empId">Employee id to get assets</param>
        /// <returns>Assets list</returns>
        [HttpGet("GetEmployeeAssets/{empId}")]
        public async Task<IActionResult> GetEmployeeAssets(int empId)
        {
            try
            {
                var employeeAssets = await _service.GetEmployeeAssets(empId); // Get employee assets
                return Ok(new { success = true, employeeAssets = employeeAssets });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        ///  To add and update an asset to an employee
        /// </summary>
        /// <param name="employeeAsset"> EmployeeAsset model object</param>
        /// <returns>Return tru if success</returns>
        [HttpPost("AddUpdateEmployeeAssets")]
        public async Task<IActionResult> AddUpdateEmployeeAssets([FromBody] EmployeeAsset employeeAsset)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var result = await _service.AddUpdateEmployeeAssets(employeeAsset); // Add and update an asset to an employee
                if (result)
                {
                    return Ok(new { success = true, message = "Asset added/updated successfully" });
                }
                return Ok(new { success = false, message = "Failed to add asset" });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Delete assets of an employee
        /// </summary>
        /// <param name="assetId">Assets id</param>
        /// <returns>Return tru if success</returns>
        [HttpDelete("DeleteEmployeeAssets/{assetId}")]
        public async Task<IActionResult> DeleteEmployeeAssets(int assetId)
        {
            try
            {
                var result = await _service.DeleteEmployeeAssets(assetId); // Delete all assets of an employee
                if (result)
                {
                    return Ok(new { success = true, message = "Asset deleted successfully" });
                }
                return Ok(new { success = false, message = "Failed to delete asset" });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
