using BookLabDAO;
using BookLabModel.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabRepositories
{
    public class SlotRepository : ISlotRepository
    {
        public async Task AddSlot(Slot slots)
        {
            await SlotDAO.Instance.AddSlot(slots);
        }

        public async Task DeleteSlot(Guid id)
        {
            await SlotDAO.Instance.DeleteSlot(id);
        }

        public async Task<IEnumerable<Slot>> GetAllSlots()
        {
            return await SlotDAO.Instance.GetAllSlots();
        }

        public async Task<Slot> GetSlotsById(Guid id)
        {
            return await SlotDAO.Instance.GetSlotsById(id);
        }

        public async Task UpdateSlot(Slot slots)
        {
            await SlotDAO.Instance.UpdateSlot(slots);
        }
    }
}
