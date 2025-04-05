using BookLabDTO;
using BookLabModel.Model;
using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;

namespace BookLabDAO;

public class ClassDAO : SingletonBase<ClassDAO>
{
    public async Task Add(Class classes)
    {
        await _context.Classes.AddAsync(classes);
        await _context.SaveChangesAsync();
    }
    public async Task<Guid?> GetClassBySubjectCodeAndName(string subjectCode, string className)
    {
        var classId = await _context.Classes
            .Where(c => c.SubjectCode == subjectCode && c.Name == className)
            .Select(c => c.Id)
            .FirstOrDefaultAsync();
        if (classId == Guid.Empty) return null;

        return classId;
    }

    public async Task BulkInsertClasses(IEnumerable<Class> classes)
    {
        if (classes == null || !classes.Any())
            return;

        await _context.BulkInsertAsync(classes);
    }
}