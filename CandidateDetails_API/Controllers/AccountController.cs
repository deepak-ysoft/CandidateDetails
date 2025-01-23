using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        [HttpPost("Login")] // Specify the route for the API method
        public async Task<IActionResult> Login([FromBody] Login model) // Expect the request body to contain the Employees object
        {
            try
            {
                if (await _service.Login(model)) // Check employee is exist or not 
                {
                    var employeeData = _context.Employees.FirstOrDefault(x => x.empEmail.ToLower() == model.email.ToLower()); // Get EmployeeData by email
                    if (employeeData == null)
                    {
                        return NotFound("Employee not found.");
                    }

                    var token = _authService.GenerateJwtToken(employeeData.empId.ToString()); // Call AuthService
                    return Ok(new
                    {
                        employee = employeeData,
                        token = token
                    });
                }
                else
                {
                    return Ok(false);
                }
            }
            catch (Exception ex)
            {
                // Log the exception here if needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        /// <summary>
        /// ChangePassword in Database Table.
        /// </summary>
        /// <param name="empObj">Employee class object with properties value.</param>
        /// <returns></returns>
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromForm] ChangePassword model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.ChangePasswordAsync(model); // Assuming ChangePassword is now async
            if (result.Success) // Assuming ChangePassword returns a result with IsSuccess property
                return Ok(true); // or return the updated employee object
            return Ok(false);
        }
    }
}
