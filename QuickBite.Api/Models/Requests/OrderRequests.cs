using System.ComponentModel.DataAnnotations;

namespace QuickBite.Api.Models.Requests;

public class SaveOrderItemRequest
{
    [Required]
    public int MenuItemId { get; set; }

    [Range(1, 50)]
    public int Quantity { get; set; } = 1;

    public string? SelectedModifiers { get; set; }
    public decimal ModifierAdditionalPrice { get; set; } = 0m;
}

public class SaveOnlineOrderRequest
{
    [Required]
    public int RestaurantId { get; set; }

    [Required]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string DeliveryAddress { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = "CARD";
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; } = 0m;
    public decimal TotalAmount { get; set; } = 0m;

    [Required]
    public List<SaveOrderItemRequest> Items { get; set; } = new();
}

public class AdvanceOrderStatusRequest
{
    public int OrderId { get; set; }
}
