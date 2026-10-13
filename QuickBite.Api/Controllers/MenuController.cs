using Microsoft.AspNetCore.Mvc;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Services;

namespace QuickBite.Api.Controllers;

[Route("api/V1/[controller]")]
[ApiController]
public class MenuController : ControllerBase
{
    private readonly IMenuService _services;

    public MenuController(IMenuService services)
    {
        _services = services;
    }

    [HttpGet]
    [Route("GetOnlineMenuCategories")]
    [Route("/api/menu/categories")]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetOnlineMenuCategories()
    {
        var response = await _services.GetOnlineMenuCategoriesAsync();
        return Ok(response);
    }

    [HttpGet]
    [Route("SearchOnlineMenuItems")]
    [Route("/api/menu/search")]
    public async Task<ActionResult<ApiResponse<List<object>>>> SearchOnlineMenuItems([FromQuery] string? query, [FromQuery] string? q)
    {
        var searchParam = !string.IsNullOrWhiteSpace(query) ? query : (q ?? string.Empty);
        var response = await _services.SearchOnlineMenuItemsAsync(searchParam);
        return Ok(response);
    }
}
