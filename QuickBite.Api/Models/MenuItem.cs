using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace QuickBite.Api.Models;

public class MenuItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int RestaurantId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = "Main";

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Price { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public bool IsVeg { get; set; } = false;

    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;

    // Optional JSON configuration for mandatory/optional modifiers
    public string ModifiersJson { get; set; } = string.Empty;

    // Navigation property
    [JsonIgnore]
    public Restaurant? Restaurant { get; set; }
}
