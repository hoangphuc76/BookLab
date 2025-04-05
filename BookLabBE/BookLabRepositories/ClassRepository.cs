using BookLabModel.Model;
using BookLabDAO;

namespace BookLabRepositories;

public class ClassRepository : IClassRepository
{
    public async Task Add(Class classes)
    {
        await ClassDAO.Instance.Add(classes);
    }
    public async Task<Guid?> GetClassBySubjectCodeAndName (string subjectCode, string name) {
        return await ClassDAO.Instance.GetClassBySubjectCodeAndName(subjectCode, name);
    }

    public async Task BulkInsertClasses(IEnumerable<Class> classes)
    {
        await ClassDAO.Instance.BulkInsertClasses(classes);
    }

}