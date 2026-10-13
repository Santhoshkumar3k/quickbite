using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Data;

namespace QuickBite.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly QuickBiteDbContext _context;

    public HealthController(QuickBiteDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            var restaurantCount = await _context.Restaurants.CountAsync();
            var orderCount = await _context.Orders.CountAsync();

            return Ok(new
            {
                status = "UP",
                database = "Microsoft SQL Server",
                instance = "PersonalProjects (Isolated LocalDB)",
                databaseName = "QuickBiteDb",
                databaseConnected = canConnect,
                totalRestaurants = restaurantCount,
                totalOrders = orderCount,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "DEGRADED",
                database = "Microsoft SQL Server",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
