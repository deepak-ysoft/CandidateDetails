namespace CandidateDetails_API.Model
{
    public class ResumeParsedData
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public List<string> Skills { get; set; }
        public List<string> Experience { get; set; }
        public ResumeParsedData()
        {

        }
    }
}
