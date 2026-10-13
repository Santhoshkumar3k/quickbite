using Microsoft.AspNetCore.Mvc;
using QuickBite.Api.Models;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Services;

namespace QuickBite.Api.Controllers;

[Route("api/V1/[controller]")]
[ApiController]
public class RestaurantController : ControllerBase
{
    private readonly IRestaurantService _services;

    public RestaurantController(IRestaurantService services)
    {
        _services = services;
    }

    [HttpGet]
    [Route("GetRestaurantMasterList")]
    [Route("/api/restaurants")]
    public async Task<ActionResult<ApiResponse<List<Restaurant>>>> GetRestaurantMasterList([FromQuery] string? cuisine)
    {
        var response = await _services.GetRestaurantMasterListAsync(cuisine);
        return Ok(response);
    }

    [HttpGet]
    [Route("GetRestaurantDetails")]
    [Route("/api/restaurants/{id:int}")]
    public async Task<ActionResult<ApiResponse<Restaurant>>> GetRestaurantDetails([FromQuery] int? restaurantId, int id = 0)
    {
        var targetId = restaurantId.HasValue && restaurantId.Value > 0 ? restaurantId.Value : id;
        var response = await _services.GetRestaurantDetailsAsync(targetId);
        if (response.ErrorCode != 0)
            return NotFound(response);

        return Ok(response);
    }

    [HttpGet]
    [Route("GetRestaurantMenuList")]
    [Route("/api/restaurants/{id:int}/menu")]
    public async Task<ActionResult<ApiResponse<List<MenuItem>>>> GetRestaurantMenuList([FromQuery] int? restaurantId, [FromQuery] string? category, int id = 0)
    {
        var targetId = restaurantId.HasValue && restaurantId.Value > 0 ? restaurantId.Value : id;
        var response = await _services.GetRestaurantMenuListAsync(targetId, category);
        return Ok(response);
    }
}
