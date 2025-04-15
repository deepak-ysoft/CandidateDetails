using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class Leads
    {
        [Key]
        public int LeadsId { get; set; }
        public DateTime? DateTime { get; set; }

        public string? LinkedInProfile { get; set; }
        [Required]
        public string Post { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; }
        [Required]
        [MinLength(10)]
        [MaxLength(14)]
        [RegularExpression(@"^\+?[0-9 ]{10,14}$",
        ErrorMessage = "Only numbers, '+' sign, and one space are allowed.")]
        public string Number { get; set; }
        public string? Remarks { get; set; }
        public bool? isDelete { get; set; } = false;
    }
}
