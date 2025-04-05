namespace BookLabModel.Model.Base;

public class MultiKeyBaseEntity : ITemporarilyRemovedEntity, ICreatedEntity, IUpdatedEntity
{
    public DateTime? CreatedAt { get; set; }

    public Guid? CreatedBy { get; set; }
    
    public bool? IsDeleted { get; set; }
        
    public DateTime? RemovedAt { get; set; }

    public Guid? RemovedBy { get; set; }
        
    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }
}