using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;

namespace CandidateDetails_API.ServiceContent
{
    public class CandidateServiceContent : ICandidateService
    {
        private readonly ApplicationDbContext _context; // Database context
        public CandidateServiceContent(ApplicationDbContext context)
        {
            _context = context; // Initialize the database context
        }

        public async Task<bool> AddEditCandidate(Candidate candidate) // AddEditCandidate method to add or edit candidate
        {
            int res = 0;
            if (candidate.id == 0) // If candidate id is 0, then add new candidate
            {
                candidate.isDelete = false;
                await _context.candidateDetails.AddAsync(candidate); // Add candidate to database
                res = await _context.SaveChangesAsync();
            }
            else // If candidate id is not 0, then edit existing candidate
            {
                var existingEntity = _context.ChangeTracker.Entries<Candidate>().FirstOrDefault(e => e.Entity.id == candidate.id); // Get existing candidate

                if (existingEntity != null) // If existing candidate is not null
                {
                    _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing candidate
                }

                candidate.isDelete = false;
                _context.Entry(candidate).State = EntityState.Modified; // Mark the candidate as modified
                res = await _context.SaveChangesAsync();
            }
            if (res == 0) // If no record is updated
                return false;
            return true;
        }

        public async Task<bool> AddCandidates(Stream fileStream) // AddCandidates method to add candidates from excel file
        {
            var Candidates = new List<Candidate>();
            int n = 0;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial; // Required for EPPlus

            using (var package = new ExcelPackage(fileStream)) // Open the excel file
            {
                var worksheet = package.Workbook.Worksheets[0]; // First sheet
                int filledRowCount = 0;
                // Loop through each row
                for (int row = worksheet.Dimension.Start.Row; row <= worksheet.Dimension.End.Row; row++)
                {
                    bool isRowFilled = false;
                    // Check each cell in the row
                    for (int col = worksheet.Dimension.Start.Column; col <= worksheet.Dimension.End.Column; col++)
                    {
                        var cellValue = worksheet.Cells[row, col].Value;
                        if (cellValue != null && !string.IsNullOrWhiteSpace(cellValue.ToString())) // If cell is not empty
                        {
                            isRowFilled = true;
                            break; // Exit the column loop once a filled cell is found
                        }
                    }
                    if (isRowFilled)
                    {
                        filledRowCount++; // Increment filled row count
                    }
                }
                for (int row = 2; row <= filledRowCount; row++) // Headers are in the first row
                {
                    var roleStr = worksheet.Cells[row, 7].Text.Trim(); // Removes leading and trailing spaces
                    int role = 0;

                    var Roles = await _context.Roles.ToListAsync(); // Get all roles from database

                    foreach (var r in Roles) // Loop through each role
                    {
                        if (r.role.ToLower().Trim() == roleStr.ToLower()) // If role is found
                        {
                            role = r.rid; // Set role id
                            break;
                        }
                    }

                    var candidate = new Candidate // Create a new candidate object
                    {
                        //id = int.Parse(worksheet.Cells[row, 1].Text),
                        date = DateTime.Parse(worksheet.Cells[row, 2].Text),
                        name = worksheet.Cells[row, 3].Text,
                        contact_No = worksheet.Cells[row, 4].Text,
                        linkedin_Profile = worksheet.Cells[row, 5].Text,
                        email_ID = worksheet.Cells[row, 6].Text,
                        roles = role,
                        experience = worksheet.Cells[row, 8].Text,
                        skills = worksheet.Cells[row, 9].Text,
                        ctc = decimal.Parse(worksheet.Cells[row, 10].Text),
                        etc = decimal.Parse(worksheet.Cells[row, 11].Text),
                        notice_Period = worksheet.Cells[row, 12].Text,
                        current_Location = worksheet.Cells[row, 13].Text,
                        prefer_Location = worksheet.Cells[row, 14].Text,
                        reason_For_Job_Change = worksheet.Cells[row, 15].Text,
                        schedule_Interview = DateTime.Parse(worksheet.Cells[row, 16].Text),
                        schedule_Interview_status = worksheet.Cells[row, 17].Text,
                        comments = worksheet.Cells[row, 18].Text,
                        cvPath = worksheet.Cells[row, 19].Text,
                        isDelete = false

                    };
                    if (double.TryParse(candidate.contact_No, out double number)) // Check if contact number is a number
                    {
                        // Convert to plain text without scientific notation
                        candidate.contact_No = number.ToString("F0", CultureInfo.InvariantCulture);
                    }
                    Candidates.Add(candidate);
                }
            }
            await _context.candidateDetails.AddRangeAsync(Candidates); // Add candidates to database
            n = await _context.SaveChangesAsync();
            if (n == 0)   // If no record is updated
                return false;
            return true;
        }

        public async Task<List<Candidate>> GetCandidates()  // GetCandidates method to get all candidates
        {
            var candidates = await _context.candidateDetails.ToListAsync(); // Get all candidates from database
            return candidates;
        }

        public async Task<bool> deleteCanndidate(int id)  // deleteCanndidate method to delete candidate
        {
            var candidate = await _context.candidateDetails.Where(x => x.id == id).FirstOrDefaultAsync(); // Get candidate by id
            var candidateObj = new Candidate // Create a new candidate object
            {
                id = candidate.id,
                date = candidate.date,
                name = candidate.name,
                contact_No = candidate.contact_No,
                linkedin_Profile = candidate.linkedin_Profile,
                email_ID = candidate.email_ID,
                roles = candidate.roles,
                experience = candidate.experience,
                skills = candidate.skills,
                ctc = candidate.ctc,
                etc = candidate.etc,
                notice_Period = candidate.notice_Period,
                current_Location = candidate.current_Location,
                prefer_Location = candidate.prefer_Location,
                reason_For_Job_Change = candidate.reason_For_Job_Change,
                schedule_Interview = candidate.schedule_Interview,
                schedule_Interview_status = candidate.schedule_Interview_status,
                comments = candidate.comments,
                cvPath = candidate.cvPath,
                isDelete = true,
            };
            var existingEntity = _context.ChangeTracker.Entries<Candidate>().FirstOrDefault(e => e.Entity.id == candidate.id); // Get existing candidate

            if (existingEntity != null)     // If existing candidate is not null
            {
                _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing candidate
            }
            _context.Entry(candidateObj).State = EntityState.Modified; // Mark the candidate as modified
            var res = await _context.SaveChangesAsync();
            if (res == 0) // If no record is updated
                return false;
            return true;
        }

        public async Task<bool> CreateEditRoles(Roles role)
        {
            if (role.rid == 0) // If role id is 0, then add new role
            {
                var existingEntity = _context.ChangeTracker.Entries<Candidate>().FirstOrDefault(e => e.Entity.id == role.rid); // Get existing candidate

                if (existingEntity != null)     // If existing candidate is not null
                {
                    _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing candidate
                }
                _context.Roles.Add(role); // Add role to database
            }
            else // If role id is not 0, then edit existing role
            {
                var existingEntity = _context.ChangeTracker.Entries<Candidate>().FirstOrDefault(e => e.Entity.id == role.rid); // Get existing candidate

                if (existingEntity != null)     // If existing candidate is not null
                {
                    _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing candidate
                }
                var roles = new Roles // Create a new candidate object
                {
                    rid = role.rid,
                    role = role.role,
                };
                _context.Entry(roles).State = EntityState.Modified; // Mark the candidate as modified
            }
            var res = _context.SaveChanges();
            if (res == 0) // If no record is updated
                return false;
            return true;
        }

        public async Task<bool> deleteRole(int id)
        {
            var role = _context.Roles.Where(x => x.rid == id).FirstOrDefault(); // Get role by id
            _context.Remove(role); // Remove role from database
            var res = await _context.SaveChangesAsync();
            if (res == 0) // If no record is updated
                return false;
            return true;
        }
    }
}
