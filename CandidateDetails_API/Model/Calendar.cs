using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Models
{
    public class Calendar
    {
        [Key]
        public int? CalId { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }

    }
}
