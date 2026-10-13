using System.ComponentModel.DataAnnotations;

namespace QuickBite.Api.DTOs;

public class StatusUpdateDto
{
    [Required]
    public string Status { get; set; } = string.Empty; // Placed, Preparing, OutForDelivery, Delivered, Cancelled
}
