using BookLabRepositories;
using BookLabServices.Utils;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BookLabServices;

public class RoomStatusUpdateService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RoomStatusUpdateService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(10);

    // Inject IServiceScopeFactory instead of IRoomRepository
    public RoomStatusUpdateService(
        IServiceScopeFactory scopeFactory,
        ILogger<RoomStatusUpdateService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Room status update service is starting");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogDebug("Room status update service is checking for status changes");
            await SharedLocks.GlobalSemaphore.WaitAsync(stoppingToken);
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var roomRepo = scope.ServiceProvider.GetRequiredService<IRoomRepository>();
                    await roomRepo.ProcessPendingRoomStatusChanges();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing room status changes");
            }
            finally
            {
                SharedLocks.GlobalSemaphore.Release();
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Room status update service is stopping");
    }
}