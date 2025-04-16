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

        public async Task<bool> AddCandidates(Stream fileStream)
        {
            var Candidates = new List<Candidate>();
            int n = 0;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets[0];
                int filledRowCount = 0;

                for (int row = worksheet.Dimension.Start.Row; row <= worksheet.Dimension.End.Row; row++)
                {
                    bool isRowFilled = false;
                    for (int col = worksheet.Dimension.Start.Column; col <= worksheet.Dimension.End.Column; col++)
                    {
                        var cellValue = worksheet.Cells[row, col].Value;
                        if (cellValue != null && !string.IsNullOrWhiteSpace(cellValue.ToString()))
                        {
                            isRowFilled = true;
                            break;
                        }
                    }
                    if (isRowFilled)
                    {
                        filledRowCount++;
                    }
                }

                string[] dateFormats = { "MM/dd/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "M/d/yyyy", "d-M-yyyy" };

                for (int row = 2; row <= filledRowCount; row++)
                {
                    var candidate = new Candidate();

                    // Parse `date` (column 2)
                    string rawDate = worksheet.Cells[row, 2].Text.Trim();
                    if (!DateTime.TryParseExact(rawDate, dateFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
                    {
                        throw new Exception($"Invalid date format in row {row} (column 2): '{rawDate}'");
                    }
                    candidate.date = parsedDate;

                    // Parse `schedule_Interview` (column 16)
                    try
                    {
                        candidate.schedule_Interview = ConvertExcelDate((double)worksheet.Cells[row, 16].Value);
                    }
                    catch
                    {
                        throw new Exception($"Invalid Excel date format in row {row} (column 16): '{worksheet.Cells[row, 16].Text}'");
                    }

                    candidate.name = worksheet.Cells[row, 3].Text;
                    candidate.contact_No = worksheet.Cells[row, 4].Text;
                    candidate.linkedin_Profile = worksheet.Cells[row, 5].Text;
                    candidate.email_ID = worksheet.Cells[row, 6].Text;
                    candidate.roles = worksheet.Cells[row, 7].Text;
                    candidate.experience = worksheet.Cells[row, 8].Text;
                    candidate.skills = worksheet.Cells[row, 9].Text;

                    if (!decimal.TryParse(worksheet.Cells[row, 10].Text, out decimal ctc))
                        throw new Exception($"Invalid decimal format for CTC in row {row}: '{worksheet.Cells[row, 10].Text}'");
                    candidate.ctc = ctc;

                    if (!decimal.TryParse(worksheet.Cells[row, 11].Text, out decimal etc))
                        throw new Exception($"Invalid decimal format for ETC in row {row}: '{worksheet.Cells[row, 11].Text}'");
                    candidate.etc = etc;

                    candidate.notice_Period = worksheet.Cells[row, 12].Text;
                    candidate.current_Location = worksheet.Cells[row, 13].Text;
                    candidate.prefer_Location = worksheet.Cells[row, 14].Text;
                    candidate.reason_For_Job_Change = worksheet.Cells[row, 15].Text;
                    candidate.schedule_Interview_status = worksheet.Cells[row, 17].Text;
                    candidate.comments = worksheet.Cells[row, 18].Text;
                    candidate.cvPath = worksheet.Cells[row, 19].Text;
                    candidate.isDelete = false;

                    if (double.TryParse(candidate.contact_No, out double number))
                    {
                        candidate.contact_No = number.ToString("F0", CultureInfo.InvariantCulture);
                    }

                    Candidates.Add(candidate);
                }
            }

            await _context.candidateDetails.AddRangeAsync(Candidates);
            n = await _context.SaveChangesAsync();
            return n > 0;
        }

        public static DateTime ConvertExcelDate(double excelDate)
        {
            // Excel uses January 1, 1900, as the base date
            DateTime baseDate = new DateTime(1900, 1, 1);

            // Excel incorrectly considers 1900 as a leap year, so adjust dates >= March 1, 1900
            if (excelDate >= 60)
            {
                excelDate -= 1; // Adjust for the Excel leap year bug
            }

            // Add the number of days (including fractional time) to the base date
            return baseDate.AddDays(excelDate - 1);
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
    }
}
