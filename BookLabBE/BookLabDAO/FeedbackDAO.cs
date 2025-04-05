using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabDAO
{
    public class FeedbackDAO : SingletonBase<FeedbackDAO>
    {
        public async Task<IEnumerable<Feedback>> GetAllFeedbacks()
        {
            return await _context.Feedbacks.ToListAsync();
            /*return await _context.Feedbacks.Include(c => c.Lecturer).Include(c => c.Booking).ToListAsync();*/
        }

        public async Task<IEnumerable<Feedback>> GetFeedbacksByRoomId(Guid id)
        {
            var feedbacks = await _context.Feedbacks.Where(f => f.RoomId == id && f.Status == true).Include(c => c.Lecturer).Include(c => c.Lecturer.AccountDetail).OrderByDescending(f => f.Time).ToListAsync();
            if (feedbacks == null) return null;

            return feedbacks;
        }

        public async Task<Double> GetRatingForRoom(Guid id)
        {
            return await _context.Feedbacks.Where(f => f.RoomId == id && f.Status == true && f.Rating != 0).AverageAsync(f => f.Rating);
        }

        public async Task<Feedback> GetFeedbacksById(Guid id)
        {
            var feedbacks = await _context.Feedbacks.FirstOrDefaultAsync(c => c.Id == id);
            if (feedbacks == null) return null;

            return feedbacks;
        }
        public async Task AddFeedback(Feedback feedbacks)
        {
            await _context.Feedbacks.AddAsync(feedbacks);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateFeedback(Feedback feedbacks)
        {
            var existingItem = await GetFeedbacksById(feedbacks.Id);
            if (existingItem == null) return;
            _context.Entry(existingItem).CurrentValues.SetValues(feedbacks);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteFeedback(Guid id)
        {
            var feedbacks = await GetFeedbacksById(id);

            if (feedbacks != null)
            {
                _context.Feedbacks.Remove(feedbacks);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<bool> ChangeStatus(Guid id)
        {
            var feedbacks = await GetFeedbacksById(id);
            feedbacks.Status = !feedbacks.Status;
            _context.SaveChanges();
            return feedbacks.Status;
        }

        public async Task<bool> CanFeedback(Guid lecturerId, Guid roomId)
        {
            var bookings = await _context.Bookings.Where(b => b.State == 5 && b.Type != 6 && b.LectureId.Equals(lecturerId) && b.RoomId.Equals(roomId))
                            .ToListAsync();
            foreach (Booking booking in bookings)
            {
                var ok = await _context.SubBookings.Where(sb => sb.Approve == 10 && sb.BookingId.Equals(booking.Id) && sb.Date.Add(sb.EndTime.ToTimeSpan()) <= DateTime.Now
                            && sb.Date.Add(sb.EndTime.ToTimeSpan()) >= DateTime.Now.AddDays(-3)).ToListAsync();
                if (ok.Any())
                {
                    return true;
                }
            }
            return false;
        }
    }
}
