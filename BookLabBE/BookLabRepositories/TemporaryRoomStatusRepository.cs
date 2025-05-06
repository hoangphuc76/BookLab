using BookLabDTO;
using BookLabDAO;

namespace BookLabRepositories;

public class TemporaryRoomStatusRepository : ITemporaryRoomStatusRepsoitory
{
    public async Task<IEnumerable<TemporaryRoomStatusDto>> GetAll()
    {
        return await TemporaryRoomStatusDAO.Instance.GetAll();
    }
    public async Task<bool> ChangeTemporaryStatus(Guid id, int temporaryStatus, DateTime startDate, DateTime endDate, Guid userId)
    {
        return await TemporaryRoomStatusDAO.Instance.ChangeTemporaryStatus(id, temporaryStatus, startDate, endDate, userId);
    }
    public async Task<bool> Delete(Guid roomId, Guid userId)
    {
        return await TemporaryRoomStatusDAO.Instance.Delete(roomId, userId);
    }
}