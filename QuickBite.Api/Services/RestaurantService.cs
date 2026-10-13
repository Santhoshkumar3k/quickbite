using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Data;
using QuickBite.Api.Models;
using QuickBite.Api.Models.Common;

namespace QuickBite.Api.Services;

public interface IRestaurantService
{
    Task<ApiResponse<List<Restaurant>>> GetRestaurantMasterListAsync(string? cuisine);
    Task<ApiResponse<Restaurant>> GetRestaurantDetailsAsync(int id);
    Task<ApiResponse<List<MenuItem>>> GetRestaurantMenuListAsync(int id, string? category);
}

public class RestaurantService : IRestaurantService
{
    private readonly QuickBiteDbContext _context;

    public RestaurantService(QuickBiteDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Restaurant>>> GetRestaurantMasterListAsync(string? cuisine)
    {
        var query = _context.Restaurants.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(cuisine) && !cuisine.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(r => r.Cuisine.Contains(cuisine));
        }

        var list = await query
            .Include(r => r.MenuItems)
            .OrderByDescending(r => r.Rating)
            .ToListAsync();

        return ApiResponse<List<Restaurant>>.Success(list, "Restaurants loaded successfully");
    }

    public async Task<ApiResponse<Restaurant>> GetRestaurantDetailsAsync(int id)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.MenuItems)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant == null)
        {
            return ApiResponse<Restaurant>.Fail($"Restaurant #{id} not found", 1);
        }

        return ApiResponse<Restaurant>.Success(restaurant, "Restaurant details loaded successfully");
    }

    public async Task<ApiResponse<List<MenuItem>>> GetRestaurantMenuListAsync(int id, string? category)
    {
        var query = _context.MenuItems
            .Where(m => m.RestaurantId == id && m.IsAvailable)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(m => m.Category == category);
        }

        var items = await query.ToListAsync();
        return ApiResponse<List<MenuItem>>.Success(items, "Menu items loaded successfully");
    }
}
