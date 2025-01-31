using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class UserRoles
    {
        [Key]
        public int URId { get; set; }
        [Required]
        public string URole { get; set; }
    }
}
