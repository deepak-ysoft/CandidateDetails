using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Buffers;
using System.Data;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesLeaveController : ControllerBase
    {
        private readonly IEmployeeLeave _employeeLeave; // Create an instance of the employee leave service
        private readonly ApplicationDbContext _context; // Create an instance of the database context
        public EmployeesLeaveController(IEmployeeLeave employeeLeave, ApplicationDbContext context)
        {
            _employeeLeave = employeeLeave;
            _context = context;
        }

        /// <summary>
        ///  Get all employees leave
        /// </summary>
        /// <returns>List of employee leave</returns>
        [HttpGet("GetEmployeesLeave")]
        public async Task<IActionResult> GetEmployeesLeave(int empId, int page = 1)
        {
            try
            {
                // Define the SQL output parameter
                var totalRecordsParam = new SqlParameter("@TotalRecords", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };
                // Define SQL parameters for the stored procedure
                var parameters = new[]
                {
                    new SqlParameter("@empId", SqlDbType.Int) { Value = empId },
                    new SqlParameter("@PageNumber", SqlDbType.Int) { Value = page },
                    totalRecordsParam
                };

                // Call the stored procedure using FromSqlRaw
                var leaves = await _context.employeesleave
                    .FromSqlRaw("EXEC usp_GetAllEmployeeLeave @empId, @PageNumber,@TotalRecords OUT", parameters)
                    .ToListAsync();

                int totalRecords = (int)totalRecordsParam.Value;
                return Ok(new { data = leaves, totalCount = totalRecords });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        ///   Add or update an employee leave
        /// </summary>
        /// <param name="employeeLeave">Model object</param>
        /// <returns>true if success</returns>
        [HttpPost("AddUpdateEmployeeLeave")]
        public async Task<IActionResult> AddUpdateEmployeeLeave(EmployeeLeave employeeLeave)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return bad request if the model state is invalid
            }
            try
            {
                var result = await _employeeLeave.AddUpdateEmployeeLeave(employeeLeave); // Add or update an employee leave
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Delete an employee leave
        /// </summary>
        /// <param name="id">Leave id </param>
        /// <returns>true if delete</returns>
        [HttpDelete("DeleteEmployeeLeave/{leaveId}")]
        public async Task<IActionResult> DeleteEmployeeLeave(int leaveId)
        {
            try
            {
                var result = await _employeeLeave.DeleteEmployeeLeave(leaveId); // Delete an employee leave
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
