using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateDetails_API.Model
{
    public class Candidate
    {
        [Key]
        public int id { get; set; }
        [Required]
        public DateTime date { get; set; }
        [Required]
        public string name { get; set; }
        [Required]
        public string contact_No { get; set; }
        [Required]
        public string linkedin_Profile { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")] // Email validation
        public string email_ID { get; set; }
        [Required]
        [ForeignKey("Roles")]
        public int roles { get; set; }
        [NotMapped]
        public string? roleName { get; set; }
        [Required]
        public string experience { get; set; }
        [Required]
        public string skills { get; set; }
        [Required]
        public decimal ctc { get; set; }
        [Required]
        public decimal etc { get; set; }
        [Required]
        public string notice_Period { get; set; }
        [Required]
        public string current_Location { get; set; }
        [Required]
        public string prefer_Location { get; set; }
        [Required]
        public string reason_For_Job_Change { get; set; }
        [Required]
        public DateTime schedule_Interview { get; set; }
        [Required]
        public string schedule_Interview_status { get; set; }
        [Required]
        public string comments { get; set; }
        [NotMapped]
        public IFormFile? cv { get; set; }
        public string? cvPath { get; set; }
        public bool? isDelete { get; set; }
    }
}