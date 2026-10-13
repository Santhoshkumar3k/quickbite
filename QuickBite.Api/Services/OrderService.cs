using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Data;
using QuickBite.Api.Hubs;
using QuickBite.Api.Models;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Models.Requests;

namespace QuickBite.Api.Services;

public interface IOrderService
{
    Task<ApiResponse<Order>> SaveOnlineOrderAsync(SaveOnlineOrderRequest request);
    Task<ApiResponse<List<Order>>> GetCustomerOrderHistoryAsync(string? phone);
    Task<ApiResponse<Order>> GetOrderDetailsByIdAsync(int id);
    Task<ApiResponse<Order>> AdvanceOrderStatusAsync(int id);
}

public class OrderService : IOrderService
{
    private readonly QuickBiteDbContext _context;
    private readonly IHubContext<QuickBiteHub> _hubContext;

    public OrderService(QuickBiteDbContext context, IHubContext<QuickBiteHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<ApiResponse<Order>> SaveOnlineOrderAsync(SaveOnlineOrderRequest request)
    {
        var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
        if (restaurant == null)
        {
            return ApiResponse<Order>.Fail("Selected restaurant does not exist", 1);
        }

        var itemIds = request.Items.Select(i => i.MenuItemId).ToList();
        var menuItems = await _context.MenuItems
            .Where(m => itemIds.Contains(m.Id) && m.RestaurantId == request.RestaurantId)
            .ToDictionaryAsync(m => m.Id);

        if (menuItems.Count != itemIds.Distinct().Count())
        {
            return ApiResponse<Order>.Fail("One or more selected menu items are invalid or belong to another restaurant", 1);
        }

        decimal subtotal = 0m;
        var orderItems = new List<OrderItem>();

        foreach (var reqItem in request.Items)
        {
            var menuItem = menuItems[reqItem.MenuItemId];
            var unitPrice = menuItem.Price + reqItem.ModifierAdditionalPrice;
            var lineTotal = unitPrice * reqItem.Quantity;
            subtotal += lineTotal;

            orderItems.Add(new OrderItem
            {
                MenuItemId = menuItem.Id,
                ItemName = menuItem.Name,
                Quantity = reqItem.Quantity,
                UnitPrice = unitPrice,
                Subtotal = lineTotal,
                ImageUrl = menuItem.ImageUrl,
                SelectedModifiers = reqItem.SelectedModifiers ?? string.Empty
            });
        }

        decimal deliveryFee = restaurant.DeliveryFee;
        decimal tax = Math.Round(subtotal * 0.05m, 2); // 5% GST
        decimal totalAmount = request.TotalAmount > 0 ? request.TotalAmount : (subtotal + deliveryFee + tax);

        var randomNum = Random.Shared.Next(100000, 999999);
        var orderNumber = $"QB-{randomNum}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            RestaurantId = restaurant.Id,
            RestaurantName = restaurant.Name,
            CustomerName = request.CustomerName,
            Phone = request.Phone,
            DeliveryAddress = request.DeliveryAddress,
            Status = "Placed",
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            Tax = tax,
            TotalAmount = totalAmount,
            PaymentMethod = request.PaymentMethod,
            EstimatedMinutes = restaurant.DeliveryMinutes,
            DeliveryRiderName = "Michael R.",
            DeliveryRiderVehicle = "Honda CB 125F - AB 123 CD",
            DeliveryRiderPhone = "+91 98450 12345",
            CreatedAt = DateTime.UtcNow,
            Items = orderItems,
            Payment = new PaymentTransaction
            {
                TransactionId = $"TXN-{DateTime.UtcNow:yyyyMMdd}-{randomNum}",
                Method = request.PaymentMethod,
                Status = "SUCCESS",
                Amount = totalAmount,
                ProcessedAt = DateTime.UtcNow
            }
        };

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ApiResponse<Order>.Fail($"Failed to save online order: {ex.Message}", 1);
        }

        // Live WebSocket notification: Broadcast new order to client
        await _hubContext.Clients.All.SendAsync("OrderUpdated", order);

        return ApiResponse<Order>.Success(order, "Order placed successfully");
    }

    public async Task<ApiResponse<List<Order>>> GetCustomerOrderHistoryAsync(string? phone)
    {
        var query = _context.Orders.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(phone))
        {
            var digitsOnly = new string(phone.Where(char.IsDigit).ToArray());
            if (digitsOnly.Length >= 10)
            {
                var last10 = digitsOnly.Substring(digitsOnly.Length - 10);
                query = query.Where(o => o.Phone == phone || o.Phone.Contains(last10));
            }
            else
            {
                query = query.Where(o => o.Phone == phone);
            }
        }

        var orders = await query
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<Order>>.Success(orders, "Order history loaded successfully");
    }

    public async Task<ApiResponse<Order>> GetOrderDetailsByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return ApiResponse<Order>.Fail($"Order #{id} not found", 1);

        return ApiResponse<Order>.Success(order, "Order details loaded successfully");
    }

    public async Task<ApiResponse<Order>> AdvanceOrderStatusAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return ApiResponse<Order>.Fail($"Order #{id} not found", 1);

        order.Status = order.Status switch
        {
            "Placed" => "Preparing",
            "Preparing" => "RiderAssigned",
            "RiderAssigned" => "OutForDelivery",
            "OutForDelivery" => "Delivered",
            "Delivered" => "Delivered",
            _ => "Placed"
        };

        await _context.SaveChangesAsync();

        // Real-time WebSocket event broadcast to all clients!
        await _hubContext.Clients.All.SendAsync("OrderUpdated", order);

        return ApiResponse<Order>.Success(order, $"Order status updated to {order.Status}");
    }
}
