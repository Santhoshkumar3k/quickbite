using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickBite.Api.Models;

public class Restaurant
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Cuisine { get; set; } = string.Empty;

    [Column(TypeName = "decimal(3, 1)")]
    public decimal Rating { get; set; } = 4.5m;

    public int ReviewCount { get; set; } = 150;

    public int DeliveryMinutes { get; set; } = 30;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal DeliveryFee { get; set; } = 2.99m;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal MinOrder { get; set; } = 10.00m;

    [MaxLength(500)]
    public string BannerUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    public bool IsOpen { get; set; } = true;

    // Navigation property
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
