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
                    var lead = new Leads // Create a new lead object
                    {

                        //id = int.Parse(worksheet.Cells[row, 1].Text),

                        DateTime = DateTime.ParseExact(worksheet.Cells[row, 1].Text, "dd/MM/yyyy", CultureInfo.InvariantCulture), // Parse date from excel
                        LinkedInProfile = worksheet.Cells[row, 3].Text,
                        Post = worksheet.Cells[row, 4].Text,
                        Email = worksheet.Cells[row, 5].Text,
                        Number = worksheet.Cells[row, 6].Text,
                        isDelete = false
                        // schedule_Interview = ConvertExcelDate((double)worksheet.Cells[row, 16].Value),
                    };
                    if (double.TryParse(lead.Number, out double number)) // Check if contact number is a number
                    {
                        // Convert to plain text without scientific notation
                        lead.Number = number.ToString("F0", CultureInfo.InvariantCulture);
                    }
                    leads.Add(lead);
                }
            }
            await _context.leads.AddRangeAsync(leads); // Add leads to database
            n = await _context.SaveChangesAsync();
            if (n == 0)   // If no record is updated
                return false;
            return true;
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
