using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class Leads
    {

        [Key]
        public int LeadsId { get; set; }
        public DateTime? DateTime { get; set; }
        public string? LinkedInProfile { get; set; }
        public string? Post { get; set; }
        public string? Email { get; set; }
        public string? Number { get; set; }
        public bool? isDelete { get; set; } = false;
    }
}
