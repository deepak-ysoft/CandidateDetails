using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAuthService _authService; // Create an instance of the AuthService
        private readonly IAccount _service; // Create an instance of the service
        private readonly ApplicationDbContext _context; // Create an instance of the database context

        public AccountController(IAuthService authService, IAccount service, ApplicationDbContext context)
        {
            _authService = authService;
            _service = service;
            _context = context;
        }

        /// <summary>
        /// To login employee
        /// </summary>
        /// <param name="model">login model</param>
        /// <returns>if login success then return logged employee data,Employee job and login token.</returns>
        /// 
        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            try
            {
                var result = await _service.Login(model); // Assuming Login is now async
                if (result.Success)
                {
                    var employeeData = _context.Employees.Include(e => e.Role) // Include the Role navigation property
                        .FirstOrDefault(x => x.empEmail.ToLower() == model.email.ToLower());

                    if (employeeData == null)
                    {
                        return NotFound("Employee not found.");
                    }

                    var token = _authService.GenerateJwtToken(employeeData.empId.ToString(), employeeData.Role.URole); // GenerateJwtToken returns a token

                    return Ok(new 
                    {
                        success = true,
                        employee = employeeData,
                        token = token
                    }); // Login returns a result with Success property
                }
                else
                {
                    if (result.Message == "Your account is not active.") // Login returns a result with Message property
                        return Ok(new { success = false, message = result.Message });
                    return Ok(new { success = false, message = result.Message }); 
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        /// <summary>
        /// ChangePassword in Database Table.
        /// </summary>
        /// <param name="empObj">Employee class object with properties value.</param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePassword model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.ChangePasswordAsync(model); // Assuming ChangePassword is now async
            return Ok(new { success = result.Success }); // Assuming ChangePassword returns a result with IsSuccess property

        }
    }
}
