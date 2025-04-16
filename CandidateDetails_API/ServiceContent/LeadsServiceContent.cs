using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using iText.Layout.Properties;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;

namespace CandidateDetails_API.ServiceContent
{

    public class LeadsServiceContent : ILeadsService
    {
        private readonly ApplicationDbContext _context; // Database context
        public LeadsServiceContent(ApplicationDbContext context)
        {
            _context = context; // Initialize the database context
        }
        public async Task<bool> AddLeads(Stream fileStream)
        {
            var leads = new List<Leads>();
            int n = 0;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial; // Required for EPPlus

            using (var package = new ExcelPackage(fileStream)) // Open the excel file
            {
                var worksheet = package.Workbook.Worksheets[0]; // First sheet
                int filledRowCount = 0;

                // Count filled rows
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

                // Define acceptable date formats
                string[] dateFormats = { "MM/dd/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "M/d/yyyy", "d-M-yyyy" };

                // Loop through rows starting from row 2
                for (int row = 2; row <= filledRowCount; row++)
                {
                    var lead = new Leads();

                    // Try parsing date safely
                    string rawDate = worksheet.Cells[row, 1].Text.Trim();
                    if (!DateTime.TryParseExact(rawDate, dateFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsedDate))
                    {
                        throw new Exception($"Invalid date format in row {row}: '{rawDate}'");
                    }

                    lead.DateTime = parsedDate;
                    lead.LinkedInProfile = worksheet.Cells[row, 3].Text;
                    lead.Post = worksheet.Cells[row, 4].Text;
                    lead.Email = worksheet.Cells[row, 5].Text;
                    lead.Number = worksheet.Cells[row, 6].Text;
                    lead.Remarks = worksheet.Cells[row, 7].Text;
                    lead.isDelete = false;

                    // Clean up number format if needed
                    if (double.TryParse(lead.Number, out double number))
                    {
                        lead.Number = number.ToString("F0", CultureInfo.InvariantCulture);
                    }

                    leads.Add(lead);
                }
            }

            await _context.leads.AddRangeAsync(leads); // Save to DB
            n = await _context.SaveChangesAsync();
            return n > 0;
        }


        public async Task<bool> AddEditLeads(Leads lead)
        {
            int res = 0;
            if (lead.LeadsId == 0 || lead.LeadsId==null) // If leads id is 0, then add new leads
            {
                lead.isDelete = false;
                await _context.leads.AddAsync(lead); // Add leads to database
                res = await _context.SaveChangesAsync();
            }
            else // If leads id is not 0, then edit existing leads
            {
                var existingEntity = _context.ChangeTracker.Entries<Candidate>().FirstOrDefault(e => e.Entity.id == lead.LeadsId); // Get existing leads

                if (existingEntity != null) // If existing leads is not null
                {
                    _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing leads
                }

                lead.isDelete = false;
                _context.Entry(lead).State = EntityState.Modified; // Mark the leads as modified
                res = await _context.SaveChangesAsync();
            }
            if (res == 0) // If no record is updated
                return false;
            return true;
        }

        public async Task<bool> deleteLeads(int id)
        {
            var leads = await _context.leads.Where(x => x.LeadsId == id).FirstOrDefaultAsync(); // Get leads by id

            leads.isDelete = true;
            
            var existingEntity = _context.ChangeTracker.Entries<Leads>().FirstOrDefault(e => e.Entity.LeadsId == leads.LeadsId); // Get existing leads

            if (existingEntity != null)     // If existing leads is not null
            {
                _context.Entry(existingEntity.Entity).State = EntityState.Detached; // Detach the existing leads
            }
            _context.Entry(leads).State = EntityState.Modified; // Mark the leads as modified
            var res = await _context.SaveChangesAsync();
            if (res == 0) // If no record is updated
                return false;
            return true;
        }

    }
}
