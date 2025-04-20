using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices.Utils
{
    public static class SharedLocks
    {
        public static readonly SemaphoreSlim GlobalSemaphore = new SemaphoreSlim(1, 1);
    }
}
