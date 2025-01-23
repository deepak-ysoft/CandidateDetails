namespace CandidateDetails_API.Models
{
    public class UpdateCalendarRequest
    {
        public int Id { get; set; }
        public DateTime NewStart { get; set; }
        public DateTime NewEnd { get; set; }
    }
}
