using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using CandidateDetails_API.Models;
using Microsoft.EntityFrameworkCore;

namespace CandidateDetails_API.ServiceContent
{
    public class CalendarServiceContent: ICalendarService // Calendar service content
    {
        private readonly ApplicationDbContext _context; // Database context
        public CalendarServiceContent(ApplicationDbContext context)
        {
            _context = context; // Initialize the database context
        }

        // Get calendar by calendar id
        public async Task<Calendar> getCalendarByIdAsync(int id) // Get calendar by id
        {
            var calendar = await _context.calendar.FirstOrDefaultAsync(x => x.CalId == id);
            return calendar;
        }

        // Delete calendar
        public async Task<bool> DeleteCalendarByIdAsync(int id) // Delete calendar by id
        {
            var calendar = await _context.calendar.FirstOrDefaultAsync(x => x.CalId == id); // Get calendar
            if (calendar != null)
                _context.calendar.Remove(calendar); // remove calendar
            int n = await _context.SaveChangesAsync();
            if (n > 0)
                return true;
            return false;
        }
    }
}
