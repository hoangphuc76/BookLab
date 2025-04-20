using BookLabRepositories;
using BookLabServices.Utils;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public class SubBookingApproveUpdateService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SubBookingApproveUpdateService> _logger;

        // Inject IServiceScopeFactory instead of ISubBookingRepository
        public SubBookingApproveUpdateService(
            IServiceScopeFactory scopeFactory,
            ILogger<SubBookingApproveUpdateService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SubBooking approve update service is starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogDebug("SubBooking approve update service is checking for status changes");

                var now = DateTime.Now;
                var nextMidnight = now.Date.AddDays(1);
                var delayTime = nextMidnight - now;

                await Task.Delay(delayTime, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                await SharedLocks.GlobalSemaphore.WaitAsync(stoppingToken);

                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var subBookingRepo = scope.ServiceProvider.GetRequiredService<ISubBookingRepository>();
                        await subBookingRepo.ChangeStatusAuto();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing subBooking approve changes");
                }
                finally
                {
                    SharedLocks.GlobalSemaphore.Release();
                }

            }

            _logger.LogInformation("SubBooking approve update service is stopping");
        }
    }
}
