using BookLabModel.Model;

namespace BookLabRepositories;

public interface IClassRepository
{
   Task Add(Class classes);   
   Task<Guid?> GetClassBySubjectCodeAndName (string subjectCode, string name);

   Task BulkInsertClasses(IEnumerable<Class> classes);
}