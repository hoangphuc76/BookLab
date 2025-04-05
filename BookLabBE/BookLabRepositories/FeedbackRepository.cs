using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class FeedbackRepository : IFeedbackRepository
    {
        public async Task AddFeedback(Feedback feedbacks)
        {
            await FeedbackDAO.Instance.AddFeedback(feedbacks);
        }

        public Task<bool> CanFeedback(Guid lecturerId, Guid roomId)
        {
            return FeedbackDAO.Instance.CanFeedback(lecturerId, roomId);
        }

        public async Task<bool> ChangeStatus(Guid id)
        {
            return await FeedbackDAO.Instance.ChangeStatus(id);
        }

        public async Task DeleteFeedback(Guid id)
        {
            await FeedbackDAO.Instance.DeleteFeedback(id);
        }

        public async Task<IEnumerable<Feedback>> GetAllFeedbacks()
        {
            return await FeedbackDAO.Instance.GetAllFeedbacks();
        }

        public async Task<Feedback> GetFeedbacksById(Guid id)
        {
            return await FeedbackDAO.Instance.GetFeedbacksById(id);
        }

        public async Task<IEnumerable<Feedback>> GetFeedbacksByRoomId(Guid id)
        {
            return await FeedbackDAO.Instance.GetFeedbacksByRoomId(id);
        }

        public async Task<double> GetRatingForRoom(Guid id)
        {
            return await FeedbackDAO.Instance.GetRatingForRoom(id);
        }

        public async Task UpdateFeedback(Feedback feedbacks)
        {
            await FeedbackDAO.Instance.UpdateFeedback(feedbacks);
        }
    }
}
