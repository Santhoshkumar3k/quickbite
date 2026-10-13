using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Models.Requests;
using QuickBite.Api.Security;
using QuickBite.Api.Services;

namespace QuickBite.Api.Controllers;

[ApiController]
[Route("dapi/v1")]
public class GatewayController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRestaurantService _restaurantService;
    private readonly IOrderService _orderService;
    private readonly IMenuService _menuService;
    private readonly ILogger<GatewayController> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public GatewayController(
        IUserService userService,
        IRestaurantService restaurantService,
        IOrderService orderService,
        IMenuService menuService,
        ILogger<GatewayController> logger)
    {
        _userService = userService;
        _restaurantService = restaurantService;
        _orderService = orderService;
        _menuService = menuService;
        _logger = logger;
    }

    [HttpPost("flow")]
    [HttpPost("dispatch")]
    public async Task<ActionResult<GatewayResponse>> ExecuteFlow([FromBody] GatewayRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Act))
        {
            return BadRequest(GatewayResponse.Fail("Bad request: action missing", 400));
        }

        // 1. Swiggy/Zomato style signature & anti-replay verification
        if (!GatewaySecurity.VerifyRequest(request.Act, request.Ts, request.Pld, request.Sig, out var verifyError))
        {
            _logger.LogWarning("Request verification failed for action '{Act}': {Error}", request.Act, verifyError);
            return StatusCode(403, GatewayResponse.Fail(verifyError ?? "Forbidden: invalid signature", 403));
        }

        // 2. Decrypt incoming payload if present
        string plainJson = string.Empty;
        if (!string.IsNullOrWhiteSpace(request.Pld))
        {
            try
            {
                plainJson = GatewaySecurity.Decrypt(request.Pld);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to decrypt payload for action '{Act}'", request.Act);
                return BadRequest(GatewayResponse.Fail("Malformed payload cipher", 400));
            }
        }

        try
        {
            object? resultData = null;
            string successMsg = "Success";

            switch (request.Act.ToLowerInvariant())
            {
                // ==================== RESTAURANT ACTIONS ====================
                case "qb_rst_list":
                {
                    string cuisine = string.Empty;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("cuisine", out var p))
                            cuisine = p.GetString() ?? string.Empty;
                    }
                    var resp = await _restaurantService.GetRestaurantMasterListAsync(cuisine);
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_rst_detail":
                {
                    int restaurantId = 0;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("restaurantId", out var p))
                            restaurantId = p.GetInt32();
                    }
                    var resp = await _restaurantService.GetRestaurantDetailsAsync(restaurantId);
                    if (resp.ErrorCode != 0) return NotFound(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_rst_menu":
                {
                    int restaurantId = 0;
                    string category = string.Empty;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("restaurantId", out var pId))
                            restaurantId = pId.GetInt32();
                        if (doc.RootElement.TryGetProperty("category", out var pCat))
                            category = pCat.GetString() ?? string.Empty;
                    }
                    var resp = await _restaurantService.GetRestaurantMenuListAsync(restaurantId, category);
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                // ==================== MENU ACTIONS ====================
                case "qb_menu_cats":
                {
                    var resp = await _menuService.GetOnlineMenuCategoriesAsync();
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_menu_srch":
                {
                    string query = string.Empty;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("query", out var p))
                            query = p.GetString() ?? string.Empty;
                    }
                    var resp = await _menuService.SearchOnlineMenuItemsAsync(query);
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                // ==================== USER ACTIONS ====================
                case "qb_usr_prof":
                {
                    string phone = string.Empty;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("phone", out var p))
                            phone = p.GetString() ?? string.Empty;
                    }
                    var resp = await _userService.GetCustomerProfileAsync(phone);
                    if (resp.ErrorCode != 0) return NotFound(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_usr_login":
                {
                    var req = JsonSerializer.Deserialize<LoginCustomerRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _userService.LoginCustomerAsync(req);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_usr_reg":
                {
                    var req = JsonSerializer.Deserialize<RegisterCustomerRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _userService.RegisterCustomerAsync(req);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_usr_save":
                {
                    var req = JsonSerializer.Deserialize<SaveCustomerProfileRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _userService.SaveCustomerProfileAsync(req);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_usr_ref":
                {
                    var req = JsonSerializer.Deserialize<ApplyCustomerReferralRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _userService.ApplyCustomerReferralCodeAsync(req);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_usr_wlt":
                {
                    var req = JsonSerializer.Deserialize<DeductCustomerWalletRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _userService.DeductCustomerWalletAsync(req);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_usr_del":
                {
                    string phone = string.Empty;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("phone", out var p))
                            phone = p.GetString() ?? string.Empty;
                    }
                    var resp = await _userService.DeleteCustomerAccountAsync(phone);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                // ==================== ORDER ACTIONS ====================
                case "qb_ord_save":
                {
                    var req = JsonSerializer.Deserialize<SaveOnlineOrderRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _orderService.SaveOnlineOrderAsync(req);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_ord_hist":
                {
                    string phone = string.Empty;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("phone", out var p))
                            phone = p.GetString() ?? string.Empty;
                    }
                    var resp = await _orderService.GetCustomerOrderHistoryAsync(phone);
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_ord_detail":
                {
                    int orderId = 0;
                    if (!string.IsNullOrWhiteSpace(plainJson))
                    {
                        using var doc = JsonDocument.Parse(plainJson);
                        if (doc.RootElement.TryGetProperty("orderId", out var p))
                            orderId = p.GetInt32();
                    }
                    var resp = await _orderService.GetOrderDetailsByIdAsync(orderId);
                    if (resp.ErrorCode != 0) return NotFound(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                case "qb_ord_adv":
                {
                    var req = JsonSerializer.Deserialize<AdvanceOrderStatusRequest>(plainJson, JsonOptions) ?? new();
                    var resp = await _orderService.AdvanceOrderStatusAsync(req.OrderId);
                    if (resp.ErrorCode != 0) return BadRequest(GatewayResponse.Fail(resp.Message, resp.ErrorCode));
                    resultData = resp.Data;
                    successMsg = resp.Message;
                    break;
                }

                default:
                    return NotFound(GatewayResponse.Fail($"Unknown action '{request.Act}'", 404));
            }

            // 3. Encrypt response data so Chrome DevTools Network Tab sees only AES ciphertext
            string serializedData = JsonSerializer.Serialize(resultData, JsonOptions);
            string encryptedResponsePayload = GatewaySecurity.Encrypt(serializedData);

            return Ok(GatewayResponse.Ok(encryptedResponsePayload, successMsg));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing gateway flow for action '{Act}'", request.Act);
            return StatusCode(500, GatewayResponse.Fail("Internal gateway processing error", 500));
        }
    }
}
