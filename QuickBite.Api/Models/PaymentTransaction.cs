using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace QuickBite.Api.Models;

public class PaymentTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrderId { get; set; }

    [Required]
    [MaxLength(100)]
    public string TransactionId { get; set; } = string.Empty; // e.g. TXN-20261007-8849

    [MaxLength(50)]
    public string Method { get; set; } = "CARD";

    [MaxLength(50)]
    public string Status { get; set; } = "SUCCESS";

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [JsonIgnore]
    public Order? Order { get; set; }
}
