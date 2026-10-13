using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickBite.Api.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(500)]
    public string? HomeAddress { get; set; }

    [MaxLength(500)]
    public string? WorkAddress { get; set; }

    [MaxLength(20)]
    public string? ActiveAddressType { get; set; } = "HOME";

    [Column(TypeName = "decimal(18, 2)")]
    public decimal WalletBalance { get; set; } = 0m;

    [MaxLength(50)]
    public string? ReferredBy { get; set; }

    [MaxLength(50)]
    public string? ReferralCode { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
