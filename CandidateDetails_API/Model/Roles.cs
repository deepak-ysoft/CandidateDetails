using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class Roles
    {
        [Key]
        public int rid { get; set; }
        [Required]
        public string role { get; set; }
    }
}
