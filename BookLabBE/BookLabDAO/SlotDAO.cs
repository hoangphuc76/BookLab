// using BookLabModel.Model;
// using Microsoft.EntityFrameworkCore;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Text;
// using System.Threading.Tasks;
//
// namespace BookLabDAO
// {
//     public class SlotDAO : SingletonBase<SlotDAO>
//     {
//         public async Task<IEnumerable<Slot>> GetAllSlots()
//         {
//             return await _context.Slots.OrderBy(slot => slot.Name).ToListAsync();
//         }
//         public async Task<Slot> GetSlotsById(Guid id)
//         {
//             var slots = await _context.Slots.FirstOrDefaultAsync(c => c.Id == id);
//             if (slots == null) return null;
//
//             return slots;
//         }
//         public async Task AddSlot(Slot slots)
//         {
//             await _context.Slots.AddAsync(slots);
//             await _context.SaveChangesAsync();
//         }
//         public async Task UpdateSlot(Slot slots)
//         {
//             var existingItem = await GetSlotsById(slots.Id);
//             if (existingItem == null) return;
//             _context.Entry(existingItem).CurrentValues.SetValues(slots);
//             await _context.SaveChangesAsync();
//         }
//         public async Task DeleteSlot(Guid id)
//         {
//             var slots = await GetSlotsById(id);
//
//             if (slots != null)
//             {
//                 _context.Slots.Remove(slots);
//                 await _context.SaveChangesAsync();
//             }
//         }
//     }
// }
