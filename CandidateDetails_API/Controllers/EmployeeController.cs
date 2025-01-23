using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        [HttpGet("GetEmployees")]
        public async Task<IActionResult> Employees()
        {
            try
            {
                var employees = await _service.GetEmployees(); // Get all employees
                return Ok(new { succes = true, res = employees });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        ///   Add or update an employee
        /// </summary>
        /// <param name="employee"> Employee model object</param>
        /// <returns>true if add or update success</returns>
        [HttpPost("AddUpdateEmployee")]
        public async Task<IActionResult> AddUpdateEmployee([FromForm] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var result = await _service.AddUpdateEmployee(employee); // Add or update an employee
                if (result)
                {
                    return Ok(new { success = true, message = "Employee added/updated successfully" });
                }
                return Ok(new { success = false, message = "Failed to add/update employee" });
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

        
    }
}
