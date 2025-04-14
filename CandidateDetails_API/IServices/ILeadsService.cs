using CandidateDetails_API.Model;

namespace CandidateDetails_API.IServices
{
    public interface ILeadsService
    {

        public Task<bool> AddLeads(Stream fileStream); // AddLeadss method to add leads from excel file
        public Task<bool> AddEditLeads(Leads lead); // AddEditLeads method to add or edit lead
        public Task<bool> deleteLeads(int id); // deleteCanndidate method to delete lead
    }
}
