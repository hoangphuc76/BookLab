using BookLabDTO;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Internal;

namespace BookLabDAO;

public class TemporaryRoomStatusDAO : SingletonBase<TemporaryRoomStatusDAO>
{
    public async Task<IEnumerable<TemporaryRoomStatusDto>> GetAll()
    {
        return await _context.TemporaryRoomStatus.Where(x => x.IsDeleted == false).Select(x => new TemporaryRoomStatusDto
        {
            Id = x.Id,
            RoomId = x.RoomId,
            RoomNumber = x.Room.RoomNumber,
            TemporaryStatus = x.TemporaryStatus,
            OriginalStatus = x.OriginalStatus,
            StartDate = x.StartDate,
            EndDate = x.EndDate
        }).ToListAsync();
    }
    public async Task<bool> ChangeTemporaryStatus(Guid id, int temporaryStatus, DateTime startDate, DateTime endDate, Guid userId)
    {
        var room = await _context.TemporaryRoomStatus.FindAsync(id);  
        if (room == null) return false;

        room.TemporaryStatus = temporaryStatus;
        room.StartDate = startDate;
        room.EndDate = endDate;
        room.UpdatedBy = userId;
        room.UpdatedAt = DateTime.UtcNow;
        _context.Entry(room).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Delete(Guid roomId, Guid userId)
    {
        var room = await _context.TemporaryRoomStatus.FirstOrDefaultAsync(r => r.RoomId == roomId);
        if (room == null) return false;
        room.IsDeleted = true;
        room.UpdatedBy = userId;
        room.UpdatedAt = DateTime.UtcNow;
        _context.Entry(room).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return true;
    }
}