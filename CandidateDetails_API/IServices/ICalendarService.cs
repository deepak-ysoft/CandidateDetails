using CandidateDetails_API.Models;

namespace CandidateDetails_API.IServices
{
    public interface ICalendarService
    {
        public Task<Calendar> getCalendarByIdAsync(int id);
        public Task<bool> DeleteCalendarByIdAsync(int id);
    }
}
