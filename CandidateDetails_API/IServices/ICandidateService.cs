using CandidateDetails_API.Model;

namespace CandidateDetails_API.IServices
{
    public interface ICandidateService
    {
        public Task<bool> AddCandidates(Stream fileStream); // AddCandidates method to add candidates from excel file
        public Task<bool> AddEditCandidate(Candidate candidate); // AddEditCandidate method to add or edit candidate
        public Task<List<Candidate>> GetCandidates(); // GetCandidates method to get all candidates
        public Task<bool> deleteCanndidate(int id); // deleteCanndidate method to delete candidate
        public Task<bool> CreateEditRoles(Roles role); // CreateEditRoles method to add or edit role
        public Task<bool> deleteRole(int id); // deleteRole method to delete role

    }
}
