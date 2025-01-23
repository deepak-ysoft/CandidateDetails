using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using CandidateDetails_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CalendarController : ControllerBase
    {
        private readonly ICalendarService _service;
        private readonly ApplicationDbContext _context;
        public CalendarController(ICalendarService service, ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }
        /// <summary>
        /// Get Calendar List 
        /// </summary>
        /// <returns>List of appoinments</returns>
        [HttpGet("GetCalendar")]
        public async Task<IActionResult> GetCalendar()
        {
            try
            {
                // Retrieve the calendar from the database
                var calendar = await _context.calendar.Select(a => new
                {
                    CalId = a.CalId.ToString(), // Map CalId to id for FullCalendar compatibility
                    title = a.Subject,       // Map Subject to title
                    description = a.Description, // Map Description
                    start = a.StartDate.ToString("o"), // Use ISO8601 format for FullCalendar
                    end = a.EndDate.ToString("o")     // Handle nullable EndDate
                }).ToListAsync();

                // Return the calendar as JSON
                return Ok(calendar);
            }
            catch (Exception ex)
            {
                // Log exception and return a meaningful error response
                return StatusCode(500, new { message = "An error occurred while fetching the calendar", error = ex.Message });
            }
        }


        /// <summary>
        /// Get Calendar List 
        /// </summary>
        /// <returns>List of appoinments</returns>
        [HttpGet("GetEventList")]
        public async Task<IActionResult> GetEventList()
        {
            try
            {
                Regex trimmer = new Regex(@"\s\s+");
                // Retrieve the calendar from the database
                var hdayDescription = await _context.calendar.Where(x => x.Subject.Trim() == "Company Holiday").OrderBy(x => x.StartDate).ToListAsync();
                var bdayDescription = await _context.calendar.Where(x => x.Subject.Trim() == "Birthday").OrderBy(x => x.StartDate).ToListAsync();

                // Return the calendar as JSON
                return Ok(new { hd = hdayDescription, bd = bdayDescription });
            }
            catch (Exception ex)
            {
                // Log exception and return a meaningful error response
                return StatusCode(500, new { message = "An error occurred while fetching the calendar", error = ex.Message });
            }
        }

        /// <summary>
        /// Create edit calendar
        /// </summary>
        /// <param name="model">calendar model</param>
        /// <returns>true or false</returns>
        [HttpPost("CreateEditCalendar")] // Use the appropriate HTTP method for creating a resource
        public async Task<IActionResult> CreateEditCalendar([FromBody] Calendar model)
        {
            if (model == null)
            {
                return BadRequest("Calendar model is null");
            }

            if (model.CalId == 0 || model.CalId == null) //Create calendar if calendar id is 0
            {
                var calendar = new Calendar
                {
                    Subject = model.Subject,
                    Description = model.Description,
                    StartDate = model.StartDate,
                    EndDate = model.EndDate,
                };
                await _context.calendar.AddAsync(calendar); // Use AddAsync for asynchronous operation
            }
            else // Edit calendar if calendar id is not 0
            {
                var cal = await _context.calendar.FirstOrDefaultAsync(x => x.CalId == model.CalId);
                if (cal == null)
                {
                    return NotFound("Calendar not found");
                }

                cal.Subject = model.Subject;
                cal.Description = model.Description;
                cal.StartDate = model.StartDate;
                cal.EndDate = model.EndDate;
                _context.calendar.Update(cal);
            }

            int n = await _context.SaveChangesAsync(); // Use SaveChangesAsync for asynchronous operation
            if (n > 0)
            {
                return Ok(true);
            }

            return StatusCode(500, "An error occurred while saving the calendar");
        }

        /// <summary>
        /// Get calendar details by calendar ID
        /// </summary>
        /// <param name="id">Calendar ID</param>
        /// <returns>Calendar</returns>
        [HttpGet("GetCalendarDetails/{id}")]
        public async Task<IActionResult> GetCalendarDetails(int id)
        {
            var leave = await _context.employeeLeaveVM.FirstOrDefaultAsync(x => x.calId == id);
            var birth = await _context.employeeBirthdays.FirstOrDefaultAsync(x => x.calId == id);
            bool isUsed = false;
            if (leave != null || birth != null)
            {
                isUsed = true;
            }
            var calendar = await _service.getCalendarByIdAsync(id);
            if (calendar == null)
            {
                return NotFound(); // Handle the case when the calendar doesn't exist
            }
            return Ok(new { data = calendar, isUsed = isUsed });
        }

        /// <summary>
        /// Update a calendar
        /// </summary>
        /// <param name="request">Update Calendar Request model</param>
        /// <returns>true or false</returns>
        [HttpPost("UpdateCalendar")]
        public async Task<IActionResult> UpdateCalendar([FromBody] UpdateCalendarRequest request)
        {
            var calendar = await _context.calendar.FirstOrDefaultAsync(a => a.CalId == request.Id);
            if (calendar != null)
            {
                //calendar.StartDate = request.NewStart.AddHours(5).AddMinutes(30);
                //calendar.EndDate = request.NewEnd.AddHours(5).AddMinutes(30); 

                calendar.StartDate = request.NewStart;
                calendar.EndDate = request.NewEnd;

                await _context.SaveChangesAsync();
                return Ok(); // Return a success response
            }
            return NotFound(); // Return a not found response if the calendar doesn't exist
        }

        // To delete a Calendar
        [HttpDelete("DeleteCalendar/{id}")]
        public async Task<IActionResult> DeleteCalendar(int id)
        {
            var calendar = await _service.DeleteCalendarByIdAsync(id);
            if (calendar)
            {
                return Ok(true);
            }
            return Ok(false);
        }
    }
}
