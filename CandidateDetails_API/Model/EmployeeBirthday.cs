using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class EmployeeBirthday
    {
        [Key]
        public int ebId { get; set; }
        public int? calId { get; set; }
        public int empId { get; set; }
    }
}
