using BookLabDTO;

namespace BookLabRepositories;

public interface ITemporaryRoomStatusRepsoitory 
{
    Task<IEnumerable<TemporaryRoomStatusDto>> GetAll();
    Task<bool> ChangeTemporaryStatus(Guid id, int temporaryStatus, DateTime startDate, DateTime endDate, Guid userId);
    Task<bool> Delete(Guid roomId, Guid userId);
}