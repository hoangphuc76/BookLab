using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface IFeedbackRepository
    {
        Task<IEnumerable<Feedback>> GetAllFeedbacks();

        Task<IEnumerable<Feedback>> GetFeedbacksByRoomId(Guid id);

        Task<Feedback> GetFeedbacksById(Guid id);

        Task AddFeedback(Feedback feedbacks);

        Task UpdateFeedback(Feedback feedbacks);

        Task DeleteFeedback(Guid id);

        Task<bool> ChangeStatus(Guid id);

        Task<bool> CanFeedback(Guid lecturerId, Guid roomId);

        Task<Double> GetRatingForRoom(Guid id);
    }
}
