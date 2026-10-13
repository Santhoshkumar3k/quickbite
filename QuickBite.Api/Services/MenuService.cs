using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Data;
using QuickBite.Api.Models.Common;

namespace QuickBite.Api.Services;

public interface IMenuService
{
    Task<ApiResponse<List<string>>> GetOnlineMenuCategoriesAsync();
    Task<ApiResponse<List<object>>> SearchOnlineMenuItemsAsync(string query);
}

public class MenuService : IMenuService
{
    private readonly QuickBiteDbContext _context;

    public MenuService(QuickBiteDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<string>>> GetOnlineMenuCategoriesAsync()
    {
        var categories = await _context.MenuItems
            .Select(m => m.Category)
            .Distinct()
            .ToListAsync();

        return ApiResponse<List<string>>.Success(categories, "Categories loaded successfully");
    }

    public async Task<ApiResponse<List<object>>> SearchOnlineMenuItemsAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return ApiResponse<List<object>>.Success(new List<object>(), "Empty query");
        }

        var results = await _context.MenuItems
            .Include(m => m.Restaurant)
            .Where(m => m.Name.Contains(query) || m.Description.Contains(query) || m.Category.Contains(query))
            .Select(m => (object)new
            {
                m.Id,
                m.Name,
                m.Category,
                m.Price,
                m.Description,
                m.IsVeg,
                m.ImageUrl,
                RestaurantId = m.RestaurantId,
                RestaurantName = m.Restaurant != null ? m.Restaurant.Name : string.Empty
            })
            .ToListAsync();

        return ApiResponse<List<object>>.Success(results, "Search completed");
    }
}
