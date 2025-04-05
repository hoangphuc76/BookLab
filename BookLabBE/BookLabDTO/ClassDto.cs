namespace BookLabDTO;

public class ClassDto
{
    public Guid Guid { get; set; }
    public Guid? LectureId { get; set; }

    public string SubjectCode { get; set; }

    public string Name { get; set; }

    public bool Status { get; set; }
}