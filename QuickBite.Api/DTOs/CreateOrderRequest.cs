using System.ComponentModel.DataAnnotations;

namespace QuickBite.Api.DTOs;

public class CreateOrderRequest
{
    [Required]
    public int RestaurantId { get; set; }

    [Required]
    [MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string DeliveryAddress { get; set; } = string.Empty;

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "CARD";

    [Required]
    [MinLength(1, ErrorMessage = "At least one item is required to place an order")]
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    [Required]
    public int MenuItemId { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;

    [MaxLength(300)]
    public string SelectedModifiers { get; set; } = string.Empty;

    public decimal ModifierAdditionalPrice { get; set; } = 0m;
}
