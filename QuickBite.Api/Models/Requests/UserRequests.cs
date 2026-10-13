namespace QuickBite.Api.Models.Requests;

public class LoginCustomerRequest
{
    public string Phone { get; set; } = string.Empty;
}

public class RegisterCustomerRequest
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? HomeAddress { get; set; }
    public string? WorkAddress { get; set; }
    public string? ActiveAddressType { get; set; } = "HOME";
    public string? ReferralCode { get; set; }
}

public class SaveCustomerProfileRequest
{
    public string Phone { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? HomeAddress { get; set; }
    public string? WorkAddress { get; set; }
    public string? ActiveAddressType { get; set; }
}

public class ApplyCustomerReferralRequest
{
    public string Phone { get; set; } = string.Empty;
    public string ReferralCode { get; set; } = string.Empty;
}

public class DeductCustomerWalletRequest
{
    public string Phone { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
