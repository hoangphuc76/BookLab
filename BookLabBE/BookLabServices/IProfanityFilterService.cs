using BookLabDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public interface IProfanityFilterService
    {
        Task<ProfanityFilterResponse> CheckProfanityAsync(string text);
    }
}
