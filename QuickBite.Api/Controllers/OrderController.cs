using Microsoft.AspNetCore.Mvc;
using QuickBite.Api.Models;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Models.Requests;
using QuickBite.Api.Services;

namespace QuickBite.Api.Controllers;

[Route("api/V1/[controller]")]
[ApiController]
public class OrderController : ControllerBase
{
    private readonly IOrderService _services;

    public OrderController(IOrderService services)
    {
        _services = services;
    }

    [HttpPost]
    [Route("SaveOnlineOrder")]
    [Route("/api/orders")]
    public async Task<ActionResult<ApiResponse<Order>>> SaveOnlineOrder([FromBody] SaveOnlineOrderRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<Order>.Fail("Invalid order payload", 1));
        }

        var response = await _services.SaveOnlineOrderAsync(request);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpGet]
    [Route("GetCustomerOrderHistory")]
    [Route("/api/orders")]
    public async Task<ActionResult<ApiResponse<List<Order>>>> GetCustomerOrderHistory([FromQuery] string? phone)
    {
        var response = await _services.GetCustomerOrderHistoryAsync(phone);
        return Ok(response);
    }

    [HttpGet]
    [Route("GetOrderDetailsById")]
    [Route("/api/orders/{id:int}")]
    public async Task<ActionResult<ApiResponse<Order>>> GetOrderDetailsById([FromQuery] int? orderId, int id = 0)
    {
        var targetId = orderId.HasValue && orderId.Value > 0 ? orderId.Value : id;
        var response = await _services.GetOrderDetailsByIdAsync(targetId);
        if (response.ErrorCode != 0)
        {
            return NotFound(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("AdvanceOrderStatus")]
    [Route("/api/orders/{id:int}/advance-status")]
    public async Task<ActionResult<ApiResponse<Order>>> AdvanceOrderStatus([FromBody] AdvanceOrderStatusRequest? body, int id = 0)
    {
        var targetId = (body != null && body.OrderId > 0) ? body.OrderId : id;
        var response = await _services.AdvanceOrderStatusAsync(targetId);
        if (response.ErrorCode != 0)
        {
            return NotFound(response);
        }

        return Ok(response);
    }
}
