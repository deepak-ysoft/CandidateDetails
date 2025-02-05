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
        [RegularExpression("^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*#?&]{8,}$", ErrorMessage = "At least 8 char, with upper, lower, num & special char.")]
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
        [ForeignKey("UserRoles")]
        public int RoleId { get; set; }
        public bool? isActive { get; set; }
        public UserRoles? Role { get; set; }

        // Fields for managing password reset
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiration { get; set; } // The expiration time for the reset token
        public bool ResetTokenIsValid => ResetTokenExpiration > DateTime.Now; // Automatically checks if the token is still valid
    }
}
