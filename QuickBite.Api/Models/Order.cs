using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickBite.Api.Models;

public class Order
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string OrderNumber { get; set; } = string.Empty; // e.g. QB-789012

    [Required]
    public int RestaurantId { get; set; }

    [MaxLength(150)]
    public string RestaurantName { get; set; } = string.Empty;

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
    public string Status { get; set; } = "Placed"; // Placed, Preparing, OutForDelivery, Delivered, Cancelled

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal DeliveryFee { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Tax { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "CARD"; // CARD, UPI, COD

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int EstimatedMinutes { get; set; } = 30;

    [MaxLength(100)]
    public string DeliveryRiderName { get; set; } = "Michael R.";

    [MaxLength(50)]
    public string DeliveryRiderVehicle { get; set; } = "Honda CB 125F - AB 123 CD";

    [MaxLength(30)]
    public string DeliveryRiderPhone { get; set; } = "+91 98450 12345";

    // Navigation property
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public PaymentTransaction? Payment { get; set; }
}
