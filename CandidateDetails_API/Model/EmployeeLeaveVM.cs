using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class EmployeeLeaveVM
    {
        [Key]
        public int leaveVmId { get; set; }
        public int? calId { get; set; }
        public int leaveId { get; set; }
    }
}
