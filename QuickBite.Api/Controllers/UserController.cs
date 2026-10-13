using Microsoft.AspNetCore.Mvc;
using QuickBite.Api.Models;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Models.Requests;
using QuickBite.Api.Services;

namespace QuickBite.Api.Controllers;

[Route("api/V1/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _services;

    public UserController(IUserService services)
    {
        _services = services;
    }

    [HttpGet]
    [Route("GetCustomerProfile")]
    [Route("/api/users/{phone}")]
    public async Task<ActionResult<ApiResponse<User>>> GetCustomerProfile([FromQuery] string? phone, string? phoneRoute = null)
    {
        var targetPhone = !string.IsNullOrWhiteSpace(phone) ? phone : (phoneRoute ?? string.Empty);
        var response = await _services.GetCustomerProfileAsync(targetPhone);
        if (response.ErrorCode != 0)
        {
            return NotFound(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("LoginCustomer")]
    [Route("/api/users/login")]
    public async Task<ActionResult<ApiResponse<User>>> LoginCustomer([FromBody] LoginCustomerRequest request)
    {
        var response = await _services.LoginCustomerAsync(request);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("RegisterCustomer")]
    [Route("/api/users/register")]
    public async Task<ActionResult<ApiResponse<User>>> RegisterCustomer([FromBody] RegisterCustomerRequest request)
    {
        var response = await _services.RegisterCustomerAsync(request);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("SaveCustomerProfile")]
    [Route("/api/users/{phone}")]
    public async Task<ActionResult<ApiResponse<User>>> SaveCustomerProfile([FromBody] SaveCustomerProfileRequest request, string? phone = null)
    {
        if (string.IsNullOrWhiteSpace(request.Phone) && !string.IsNullOrWhiteSpace(phone))
        {
            request.Phone = phone;
        }

        var response = await _services.SaveCustomerProfileAsync(request);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("ApplyCustomerReferralCode")]
    [Route("/api/users/apply-referral")]
    public async Task<ActionResult<ApiResponse<User>>> ApplyCustomerReferralCode([FromBody] ApplyCustomerReferralRequest request)
    {
        var response = await _services.ApplyCustomerReferralCodeAsync(request);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("DeductCustomerWallet")]
    [Route("/api/users/deduct-wallet")]
    public async Task<ActionResult<ApiResponse<User>>> DeductCustomerWallet([FromBody] DeductCustomerWalletRequest request)
    {
        var response = await _services.DeductCustomerWalletAsync(request);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    [HttpPost]
    [Route("DeleteCustomerAccount")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCustomerAccount([FromQuery] string phone)
    {
        var response = await _services.DeleteCustomerAccountAsync(phone);
        if (response.ErrorCode != 0)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
}
