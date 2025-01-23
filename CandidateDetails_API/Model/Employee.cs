using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CandidateDetails_API.Model
{
    public class Employee
    {
        [Key]
        public int empId { get; set; }
        [Required]
        [RegularExpression("^[A-Za-z\\s]+(?: [A-Za-z0-9\\s]+)*$", ErrorMessage = "Please enter a valid name!!")]
        public string empName { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")] // Email validation
        public string empEmail { get; set; }
        [Required]
        [DataType(DataType.Password)]
        [RegularExpression("^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*#?&]{8,}$", ErrorMessage = "Must Enter At Least 8 characters and must include Uppercase, Lowercase, digit and Special character")]
        public string  empPassword { get; set; }
        [NotMapped]
        [Required]
        [Compare("empPassword")]
        [DataType(DataType.Password)]
        public string ? empPasswordConfirm { get; set; }
        [Required]
        public string empNumber { get; set; }
        [Required]
        public DateTime empDateOfBirth { get; set; }
        [Required]
        public string empGender { get; set; }
        [Required]
        public string empJobTitle { get; set; }
        [Required]
        public string empExperience { get; set; }
        [Required]
        public DateTime empDateofJoining { get; set; }
        [Required]
        public string empAddress { get; set; }
        public string? ImagePath { get; set; }

        [NotMapped]
        public IFormFile? Photo { get; set; }
        public bool? isDelete { get; set; }
    }
}
