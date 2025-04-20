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
    public class BookingTypeUpdateService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingTypeUpdateService> _logger;

        // Inject IServiceScopeFactory instead of IBookingRepository
        public BookingTypeUpdateService(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingTypeUpdateService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking type update service is starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogDebug("Booking type update service is checking for status changes");

                var now = DateTime.Now;
                var nextMidnight = now.Date.AddDays(1);
                var delayTime = nextMidnight - now;

                await Task.Delay(delayTime, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

                await SharedLocks.GlobalSemaphore.WaitAsync(stoppingToken);

                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var bookingRepo = scope.ServiceProvider.GetRequiredService<IBookingRepository>();
                        await bookingRepo.ChangeStatusAuto();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing booking type changes");
                }
                finally
                {
                    SharedLocks.GlobalSemaphore.Release();
                }

            }

            _logger.LogInformation("Booking type update service is stopping");
        }
    }
}
