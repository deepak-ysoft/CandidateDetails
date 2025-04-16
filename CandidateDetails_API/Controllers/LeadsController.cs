using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,HR")]
    [ApiController]
    public class LeadsController : ControllerBase
    {
        private readonly ILeadsService _service;
        private readonly ApplicationDbContext _context; // Database context
        public LeadsController(ILeadsService service, ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }


        [HttpGet("GetLeads")]
        public async Task<IActionResult> GetCandidates(int page=1, int pageSize=10, string SearchField = "", string SearchValue = "")
        {
            try
            {   // Define the SQL output parameter
                var totalRecordsParam = new SqlParameter("@TotalRecords", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };
                // Define SQL parameters for the stored procedure
                var parameters = new[]
                {
                    new SqlParameter("@PageNumber", SqlDbType.Int) { Value = page },
                    new SqlParameter("@PageSize", SqlDbType.Int) { Value = pageSize },
                    new SqlParameter("@SearchField", SqlDbType.NVarChar, 255) { Value = (object)SearchField ?? DBNull.Value },
                    new SqlParameter("@SearchValue", SqlDbType.NVarChar, 255) { Value = (object)SearchValue ?? DBNull.Value },
                    totalRecordsParam
                };

                // Call the stored procedure using FromSqlRaw
                var leads = await _context.leads
                    .FromSqlRaw("EXEC usp_GetAllLeads @PageNumber, @PageSize,@SearchField,@SearchValue,@TotalRecords OUT", parameters)
                    .ToListAsync();

                int totalRecords = (int)totalRecordsParam.Value;

                return Ok(new { data = leads, totalCount = totalRecords });
            }
            catch (Exception ex)
            {
                // Log the error (Optional)
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("AddLeadsFromExcel")]
        public async Task<IActionResult> AddLeadsFromExcel(IFormFile file)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest("File not found");
                }

                using var stream = file.OpenReadStream();
                var success = await _service.AddLeads(stream);

                if (success)
                    return Ok(new { success = true });
                else
                    return StatusCode(500, "Failed to save leads to the database.");
            }
            catch (Exception ex)
            {
                // Return detailed error for debugging (only for development)
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPost("AddEditLeads")]
        public async Task<IActionResult> AddEditLeads([FromForm] Leads leads)
        {
            try
            {   // Validate the model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                bool res = false;

                // Save leads details
                res = await _service.AddEditLeads(leads);

                return Ok(new { success = res });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("DeleteLeads/{id}")]
        public async Task<IActionResult> DeleteLead(int id)
        {
            try
            {
                bool res = await _service.deleteLeads(id); // Call the service method to delete the lead
                return Ok(new { success = res }); // Return the result
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
