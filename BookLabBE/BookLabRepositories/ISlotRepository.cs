using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public interface ISlotRepository
    {
        Task<IEnumerable<Slot>> GetAllSlots();

        Task<Slot> GetSlotsById(Guid id);

        Task AddSlot(Slot slots);

        Task UpdateSlot(Slot slots);

        Task DeleteSlot(Guid id);
    }
}
