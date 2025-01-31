using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class ChangePassword
    {
        [Key]
        public int empId { get; set; }
        [Required]
        public string? currentPassword { get; set; }
        [Required]
        [DataType(DataType.Password)]
        [RegularExpression("^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*#?&]{8,}$", ErrorMessage = "Must Enter At Least 8 characters and must include Uppercase, Lowercase, digit and Special character")]
        public string? newPassword { get; set; }
        [Compare("newPassword")]
        [Required]
        [DataType(DataType.Password)]
        public string? newCPassword { get; set; }
    }
}
