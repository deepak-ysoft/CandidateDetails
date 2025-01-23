using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateService _service;
        private readonly ApplicationDbContext _context;
        public CandidateController(ICandidateService service, ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }
        /// <summary>
        /// To Add candidate in database from excel file  
        /// </summary>
        /// <param name="file">excel file object</param>
        /// <returns>Boolean </returns>
        [HttpPost("AddCandidatesFromExcel")]
        public async Task<IActionResult> AddCandidatesFromExcel(IFormFile file)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest("File not found");
                }
                // read a file which will be upload from a form.
                var stream = file.OpenReadStream();
                var Candidates = await _service.AddCandidates(stream);// Call the service method to add candidates
                return Ok(new { success = Candidates });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Get all candidates from database
        /// </summary>
        /// <returns>List of candidates and count of candidates</returns>
        [HttpGet("GetCandidates")]
        public async Task<IActionResult> GetCandidates(int page = 1, int pageSize = 10, string sortColumn = "id", string sortDirection = "asc", string SearchField = "", string SearchValue = "")
        {
            try
            {   // Define the SQL output parameter
                var totalRecordsParam = new SqlParameter("@TotalRecords", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };
                if (SearchField == "Roles")
                {
                    var Roles = await _context.Roles.ToListAsync(); // Get all roles from database

                    foreach (var r in Roles) // Loop through each role
                    {
                        if (r.role.ToLower().Trim() == SearchValue.ToLower()) // If role is found
                        {
                            SearchValue = r.rid.ToString(); // Set role id
                            break;
                        }
                    }
                }


                // Define SQL parameters for the stored procedure
                var parameters = new[]
                {
                    new SqlParameter("@PageNumber", SqlDbType.Int) { Value = page },
                    new SqlParameter("@PageSize", SqlDbType.Int) { Value = pageSize },
                    new SqlParameter("@SortColumn", SqlDbType.NVarChar, 50) { Value = sortColumn },
                    new SqlParameter("@SortOrder", SqlDbType.NVarChar, 4) { Value = sortDirection },
                    new SqlParameter("@SearchField", SqlDbType.NVarChar, 255) { Value = (object)SearchField ?? DBNull.Value },
                    new SqlParameter("@SearchValue", SqlDbType.NVarChar, 255) { Value = (object)SearchValue ?? DBNull.Value },
                    totalRecordsParam
                };

                // Call the stored procedure using FromSqlRaw
                var candidates = await _context.candidateDetails
                    .FromSqlRaw("EXEC usp_GetAllcandidate @PageNumber, @PageSize, @SortColumn, @SortOrder,@SearchField,@SearchValue,@TotalRecords OUT", parameters)
                    .ToListAsync();


                // Get the Roles data (assuming you have a Roles table in your DbContext)
                var roles = await _context.Roles.ToListAsync();

                // Loop through the candidates and update the role value
                foreach (var candidate in candidates)
                {
                    var role = roles.FirstOrDefault(r => r.rid == candidate.roles); // Match the role ID
                    if (role != null)
                    {
                        candidate.roleName = role.role; // Replace the role ID with the role name
                    }
                }
                int totalRecords = (int)totalRecordsParam.Value;

                return Ok(new { data = candidates, totalCount = totalRecords });
            }
            catch (Exception ex)
            {
                // Log the error (Optional)
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Add or Edit candidate details
        /// </summary>
        /// <param name="candidate">Candidate model object</param>
        /// <returns>boolean</returns>
        [HttpPost("AddEditCandidate")]
        public async Task<IActionResult> AddEditCandidate([FromForm] Candidate candidate)
        {
            try
            {   // Validate the model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                bool res = false;

                // Save the CV file
                var CandidateCV = Path.Combine(Directory.GetCurrentDirectory(), "CandidateCV");
                if (!Directory.Exists(CandidateCV))
                {
                    Directory.CreateDirectory(CandidateCV);
                }
                if (candidate.id == null)
                    candidate.id = 0;
                if (candidate.id == 0)
                {
                    if (candidate.cv != null)
                    {
                        string beforeAt = candidate.email_ID.Split('@')[0]; // Get the email ID before '@'
                        string fileName = $"{candidate.name}_Email_{beforeAt}{Path.GetExtension(candidate.cv.FileName)}"; // Generate a unique file name
                        var filePath = Path.Combine(CandidateCV, fileName); // Combine the file path

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await candidate.cv.CopyToAsync(stream);
                        }
                        // Save the file path in the database
                        candidate.cvPath = $"https://localhost:44319/CandidateCV/{fileName}";
                    }
                }
                else
                {

                    var can = await _context.candidateDetails.FirstOrDefaultAsync(x => x.id == candidate.id); // Get the candidate details
                    if (candidate.cv != null)
                    {
                       if(can.cvPath != null)
                        {
                            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "CandidateCV", Path.GetFileName(can.cvPath)); // Combine the file path
                            if (System.IO.File.Exists(filePath)) // Check if the file exists
                            {
                                System.IO.File.Delete(filePath); // Delete the file
                            }
                        }
                        string beforeAt = candidate.email_ID.Split('@')[0];
                        // var uniqueFileName = $"{Guid.NewGuid()}_{candidate.cv.FileName}";
                        string fileName = $"{candidate.name}_{candidate.id}_Email_{beforeAt}{Path.GetExtension(candidate.cv.FileName)}"; // Generate a unique file name
                        var UpdatefilePath = Path.Combine(CandidateCV, fileName); // Combine the file path

                        using (var stream = new FileStream(UpdatefilePath, FileMode.Create)) // Create a new file
                        {
                            await candidate.cv.CopyToAsync(stream);
                        }

                        // Save the file path in the database
                        candidate.cvPath = $"https://localhost:44319/CandidateCV/{fileName}";
                    }
                }
                // Save candidate details
                res = await _service.AddEditCandidate(candidate);

                return Ok(new { success = res });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Soft delete the candidate
        /// </summary>
        /// <param name="id">Candidate id</param>
        /// <returns>boolean</returns>
        [HttpDelete("DeleteCandidate/{id}")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            try
            {
                bool res = await _service.deleteCanndidate(id); // Call the service method to delete the candidate
                return Ok(new { success = res }); // Return the result
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// To Download the CV of candidate
        /// </summary>
        /// <param name="candidateId">Candidate id</param>
        /// <returns>CV of candidate</returns>
        [HttpGet("DownloadCV/{candidateId}")]
        public async Task<IActionResult> DownloadCV(int candidateId)
        {
            var candidate = await _context.candidateDetails.FirstOrDefaultAsync(x => x.id == candidateId); // Get the candidate details
            string getFileName = Path.GetFileName(candidate.cvPath); // Get the file name from the path
            // Path where CV files are stored
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "CandidateCV", getFileName); // Combine the file path

            if (!System.IO.File.Exists(filePath)) // Check if the file exists
            {
                return NotFound("File not found.");
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath); // Read the file bytes
            var fileName = $"{candidate.name}_CV.pdf"; // Generate the file name

            return File(fileBytes, "application/pdf", fileName);
        }

        /// <summary>
        /// Get the candidate details by id
        /// </summary>
        /// <param name="id">Candidate Id</param>
        /// <returns>Candidate Data</returns>
        [HttpGet("GetCandidate/{id}")]
        public async Task<IActionResult> GetCandidate(int id)
        {
            try
            {
                var candidate = await _context.candidateDetails.FirstOrDefaultAsync(x => x.id == id); // Get the candidate details
                var roles = await _context.Roles.FirstOrDefaultAsync(x => x.rid == candidate.roles);  // Get all roles from database

                //var role = await
                return Ok(new { can = candidate, role = roles }); // Return the candidate details
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("DownloadExcel")]
        public async Task<IActionResult> DownloadExcel()
        {

            using (var workbook = new XLWorkbook())
            {
                // Add a worksheet
                var worksheet = workbook.Worksheets.Add("Candidate Details");

                // Add headers
                worksheet.Cell(1, 1).Value = "ID";
                worksheet.Cell(1, 2).Value = "Date";
                worksheet.Cell(1, 3).Value = "Name";
                worksheet.Cell(1, 4).Value = "Contact No";
                worksheet.Cell(1, 5).Value = "LinkedIn Profile";
                worksheet.Cell(1, 6).Value = "Email ID";
                worksheet.Cell(1, 7).Value = "Role";
                worksheet.Cell(1, 8).Value = "Experience";
                worksheet.Cell(1, 9).Value = "Skills";
                worksheet.Cell(1, 10).Value = "CTC";
                worksheet.Cell(1, 11).Value = "ETC";
                worksheet.Cell(1, 12).Value = "Notice Period";
                worksheet.Cell(1, 13).Value = "Current Location";
                worksheet.Cell(1, 14).Value = "Preferred Location";
                worksheet.Cell(1, 15).Value = "Reason for Job Change";
                worksheet.Cell(1, 16).Value = "Schedule Interview";
                worksheet.Cell(1, 17).Value = "Interview Status";
                worksheet.Cell(1, 18).Value = "Comments";
                worksheet.Cell(1, 19).Value = "cvPath";

                // Retrieve data from the database
                var candidates = await _context.candidateDetails
                    .
                    Select(x => new
                    {
                        x.id,
                        x.date,
                        x.name,
                        x.contact_No,
                        x.linkedin_Profile,
                        x.email_ID,
                        Role = _context.Roles.FirstOrDefault(r => r.rid == x.roles).role, // Fetch role name
                        x.experience,
                        x.skills,
                        x.ctc,
                        x.etc,
                        x.notice_Period,
                        x.current_Location,
                        x.prefer_Location,
                        x.reason_For_Job_Change,
                        x.schedule_Interview,
                        x.schedule_Interview_status,
                        x.comments,
                        x.cvPath
                    }).ToListAsync();

                // Add data rows
                int row = 2; // Start from the second row
                foreach (var candidate in candidates)
                {
                    worksheet.Cell(row, 1).Value = candidate.id;
                    worksheet.Cell(row, 2).Value = candidate.date.ToString("yyyy-MM-dd");
                    worksheet.Cell(row, 3).Value = candidate.name;
                    worksheet.Cell(row, 4).Value = candidate.contact_No;
                    worksheet.Cell(row, 5).Value = candidate.linkedin_Profile;
                    worksheet.Cell(row, 6).Value = candidate.email_ID;
                    worksheet.Cell(row, 7).Value = candidate.Role;
                    worksheet.Cell(row, 8).Value = candidate.experience;
                    worksheet.Cell(row, 9).Value = candidate.skills;
                    worksheet.Cell(row, 10).Value = candidate.ctc;
                    worksheet.Cell(row, 11).Value = candidate.etc;
                    worksheet.Cell(row, 12).Value = candidate.notice_Period;
                    worksheet.Cell(row, 13).Value = candidate.current_Location;
                    worksheet.Cell(row, 14).Value = candidate.prefer_Location;
                    worksheet.Cell(row, 15).Value = candidate.reason_For_Job_Change;
                    worksheet.Cell(row, 16).Value = candidate.schedule_Interview.ToString("yyyy-MM-dd HH:mm");
                    worksheet.Cell(row, 17).Value = candidate.schedule_Interview_status;
                    worksheet.Cell(row, 18).Value = candidate.comments;
                    worksheet.Cell(row, 19).Value = candidate.cvPath;
                    row++;
                }

                // Adjust column widths
                worksheet.Columns().AdjustToContents();

                // Save the workbook to a memory stream
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    stream.Seek(0, SeekOrigin.Begin);

                    // Return the file as a response
                    return File(
                        stream.ToArray(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "CandidateDetails.xlsx"

                    );
                }


            }
        }

        // =========================================== Roles  

        /// <summary>
        ///  Get role from database
        /// </summary>
        /// <returns>Role list</returns>
        [HttpGet("GetRoles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _context.Roles.ToListAsync(); // Get all roles from database
                return Ok(roles); // Return the roles
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        ///  To create and edit the role
        /// </summary>
        /// <param name="role">Role model object</param>
        /// <returns>boolean</returns>
        [HttpPost("CreateEditRole")]
        public async Task<IActionResult> CreateEditRole([FromBody]Roles role)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Ok(ModelState);
                }
                var isDone = await _service.CreateEditRoles(role); // Call the service method to create or edit the role
                return Ok(new { success = isDone });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Delete The Role
        /// </summary>
        /// <param name="id">Role id</param>
        /// <returns>boolean</returns>
        [HttpDelete("DeleteRole/{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                bool res = await _service.deleteRole(id); // Call the service method to delete the role
                return Ok(new { success = res }); // Return the result
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}

