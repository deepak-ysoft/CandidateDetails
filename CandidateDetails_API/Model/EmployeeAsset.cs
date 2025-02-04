using System.ComponentModel.DataAnnotations;

namespace CandidateDetails_API.Model
{
    public class EmployeeAsset
    {
        [Key]
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public int EmpId { get; set; }
    }
}
