using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Data;
using QuickBite.Api.Hubs;
using QuickBite.Api.Models;
using QuickBite.Api.Models.Common;
using QuickBite.Api.Models.Requests;

namespace QuickBite.Api.Services;

public interface IUserService
{
    Task<ApiResponse<User>> GetCustomerProfileAsync(string phone);
    Task<ApiResponse<User>> LoginCustomerAsync(LoginCustomerRequest request);
    Task<ApiResponse<User>> RegisterCustomerAsync(RegisterCustomerRequest request);
    Task<ApiResponse<User>> SaveCustomerProfileAsync(SaveCustomerProfileRequest request);
    Task<ApiResponse<User>> ApplyCustomerReferralCodeAsync(ApplyCustomerReferralRequest request);
    Task<ApiResponse<User>> DeductCustomerWalletAsync(DeductCustomerWalletRequest request);
    Task<ApiResponse<bool>> DeleteCustomerAccountAsync(string phone);
}

public class UserService : IUserService
{
    private readonly QuickBiteDbContext _context;
    private readonly IHubContext<QuickBiteHub> _hubContext;

    public UserService(QuickBiteDbContext context, IHubContext<QuickBiteHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public static string GenerateReferralCode(string name, string phone)
    {
        var cleanLetters = new string((name ?? "").Where(char.IsLetter).ToArray());
        if (string.IsNullOrEmpty(cleanLetters)) cleanLetters = "USER";
        if (cleanLetters.Length < 4) cleanLetters = cleanLetters.PadRight(4, 'X');
        var namePrefix = cleanLetters.Substring(0, 4).ToUpper();

        var cleanDigits = new string((phone ?? "").Where(char.IsDigit).ToArray());
        var phoneSuffix = cleanDigits.Length >= 3 ? cleanDigits.Substring(cleanDigits.Length - 3) : "100";

        return $"{namePrefix}{phoneSuffix}";
    }

    public static bool IsReferralCodeMatch(User user, string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;
        var cleanCode = code.Trim().ToUpper();

        if (!string.IsNullOrEmpty(user.ReferralCode) && user.ReferralCode.ToUpper() == cleanCode)
            return true;

        var generated = GenerateReferralCode(user.Name, user.Phone);
        if (generated.ToUpper() == cleanCode)
            return true;

        var codeLetters = new string(cleanCode.Where(char.IsLetter).ToArray());
        var codeDigits = new string(cleanCode.Where(char.IsDigit).ToArray());

        if (codeLetters.Length >= 4 && codeDigits.Length >= 3)
        {
            var userLetters = new string((user.Name ?? "").Where(char.IsLetter).ToArray()).ToUpper();
            var userDigits = new string((user.Phone ?? "").Where(char.IsDigit).ToArray());

            bool nameMatches = userLetters.StartsWith(codeLetters.Substring(0, 4));
            bool phoneMatches = userDigits.EndsWith(codeDigits.Substring(codeDigits.Length - 3));

            if (nameMatches && phoneMatches)
                return true;
        }

        return false;
    }

    public async Task<ApiResponse<User>> GetCustomerProfileAsync(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return ApiResponse<User>.Fail("Phone number is required", 1);

        var cleanPhone = phone.Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (user == null)
            return ApiResponse<User>.Fail("Customer account not found", 1);

        if (string.IsNullOrEmpty(user.ReferralCode))
        {
            user.ReferralCode = GenerateReferralCode(user.Name, user.Phone);
            await _context.SaveChangesAsync();
        }

        return ApiResponse<User>.Success(user, "Customer profile retrieved successfully");
    }

    public async Task<ApiResponse<User>> LoginCustomerAsync(LoginCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone))
            return ApiResponse<User>.Fail("Mobile number is required.", 1);

        var cleanPhone = request.Phone.Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (user == null)
            return ApiResponse<User>.Fail("No account found with this mobile number. Please switch to 'New User' to create an account.", 1);

        if (string.IsNullOrEmpty(user.ReferralCode))
        {
            user.ReferralCode = GenerateReferralCode(user.Name, user.Phone);
            await _context.SaveChangesAsync();
        }

        return ApiResponse<User>.Success(user, "Logged in successfully");
    }

    public async Task<ApiResponse<User>> RegisterCustomerAsync(RegisterCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Phone))
            return ApiResponse<User>.Fail("Full name and mobile number are required.", 1);

        var cleanPhone = request.Phone.Trim();
        var existing = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (existing != null)
            return ApiResponse<User>.Fail("An account with this mobile number already exists. Please log in using the 'Log In' tab.", 1);

        var code = request.ReferralCode?.Trim().ToUpper();
        decimal initialWallet = 0m;
        string referredByCode = string.Empty;

        if (!string.IsNullOrEmpty(code))
        {
            if (code == "REFER200")
            {
                initialWallet = 200m;
                referredByCode = "REFER200";
            }
            else
            {
                var allUsers = await _context.Users.ToListAsync();
                var referrer = allUsers.FirstOrDefault(u =>
                    (!string.IsNullOrEmpty(u.ReferralCode) && u.ReferralCode.Equals(code, StringComparison.OrdinalIgnoreCase))
                    || IsReferralCodeMatch(u, code)
                );

                if (referrer != null && referrer.Phone != cleanPhone)
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE Users SET WalletBalance = WalletBalance + 200 WHERE Id = {0}", referrer.Id);

                    if (string.IsNullOrEmpty(referrer.ReferralCode))
                        referrer.ReferralCode = GenerateReferralCode(referrer.Name, referrer.Phone);

                    initialWallet = 100m;
                    referredByCode = code;

                    // Real-time WebSocket notify to referrer!
                    await _hubContext.Clients.All.SendAsync("UserUpdated", referrer);
                }
            }
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Phone = cleanPhone,
            Address = request.Address?.Trim() ?? string.Empty,
            HomeAddress = request.HomeAddress?.Trim() ?? request.Address?.Trim() ?? string.Empty,
            WorkAddress = request.WorkAddress?.Trim() ?? string.Empty,
            ActiveAddressType = request.ActiveAddressType ?? "HOME",
            WalletBalance = initialWallet,
            ReferredBy = referredByCode,
            ReferralCode = GenerateReferralCode(request.Name, cleanPhone),
            JoinedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Broadcast to WebSockets
        await _hubContext.Clients.All.SendAsync("UserUpdated", user);

        return ApiResponse<User>.Success(user, "Account created successfully");
    }

    public async Task<ApiResponse<User>> SaveCustomerProfileAsync(SaveCustomerProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone))
            return ApiResponse<User>.Fail("Phone number is required", 1);

        var cleanPhone = request.Phone.Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (user == null)
        {
            user = new User
            {
                Name = string.IsNullOrWhiteSpace(request.Name) ? "User" : request.Name.Trim(),
                Phone = cleanPhone,
                Address = request.Address?.Trim() ?? string.Empty,
                HomeAddress = request.HomeAddress?.Trim() ?? string.Empty,
                WorkAddress = request.WorkAddress?.Trim() ?? string.Empty,
                ActiveAddressType = request.ActiveAddressType ?? "HOME",
                ReferralCode = GenerateReferralCode(request.Name, cleanPhone),
                JoinedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.Name))
                user.Name = request.Name.Trim();

            if (request.Address != null)
                user.Address = request.Address.Trim();

            if (request.HomeAddress != null)
                user.HomeAddress = request.HomeAddress.Trim();

            if (request.WorkAddress != null)
                user.WorkAddress = request.WorkAddress.Trim();

            if (!string.IsNullOrWhiteSpace(request.ActiveAddressType))
                user.ActiveAddressType = request.ActiveAddressType.Trim();
        }

        await _context.SaveChangesAsync();

        // Broadcast real-time update through WebSockets
        await _hubContext.Clients.All.SendAsync("UserUpdated", user);

        return ApiResponse<User>.Success(user, "Profile saved successfully");
    }

    public async Task<ApiResponse<User>> ApplyCustomerReferralCodeAsync(ApplyCustomerReferralRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone) || string.IsNullOrWhiteSpace(request.ReferralCode))
            return ApiResponse<User>.Fail("Phone and referral code are required.", 1);

        var cleanPhone = request.Phone.Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (user == null)
            return ApiResponse<User>.Fail("User not found.", 1);

        if (!string.IsNullOrEmpty(user.ReferredBy))
            return ApiResponse<User>.Fail("You have already claimed a referral code.", 1);

        var code = request.ReferralCode.Trim().ToUpper();
        if (code == "REFER200")
        {
            user.WalletBalance += 200m;
            user.ReferredBy = "REFER200";
            await _context.SaveChangesAsync();

            // Real-time broadcast
            await _hubContext.Clients.All.SendAsync("UserUpdated", user);
            return ApiResponse<User>.Success(user, "₹200 added to your wallet!");
        }

        var allUsers = await _context.Users.ToListAsync();
        var referrer = allUsers.FirstOrDefault(u =>
            u.Phone != user.Phone && (
                (!string.IsNullOrEmpty(u.ReferralCode) && u.ReferralCode.Equals(code, StringComparison.OrdinalIgnoreCase))
                || IsReferralCodeMatch(u, code)
            )
        );

        if (referrer == null)
            return ApiResponse<User>.Fail("Invalid referral code.", 1);

        user.WalletBalance += 100m;
        user.ReferredBy = code;

        referrer.WalletBalance += 200m;

        await _context.SaveChangesAsync();

        // Real-time broadcast to both users
        await _hubContext.Clients.All.SendAsync("UserUpdated", user);
        await _hubContext.Clients.All.SendAsync("UserUpdated", referrer);

        return ApiResponse<User>.Success(user, "₹100 credited to your wallet, and ₹200 to your friend!");
    }

    public async Task<ApiResponse<User>> DeductCustomerWalletAsync(DeductCustomerWalletRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone) || request.Amount <= 0)
            return ApiResponse<User>.Fail("Invalid deduction request", 1);

        var cleanPhone = request.Phone.Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (user == null)
            return ApiResponse<User>.Fail("User not found", 1);

        var amountToDeduct = Math.Min(user.WalletBalance, request.Amount);
        if (amountToDeduct > 0)
        {
            user.WalletBalance -= amountToDeduct;
            await _context.SaveChangesAsync();

            // Real-time broadcast to WebSockets
            await _hubContext.Clients.All.SendAsync("UserUpdated", user);
        }

        return ApiResponse<User>.Success(user, $"₹{amountToDeduct} deducted from wallet");
    }

    public async Task<ApiResponse<bool>> DeleteCustomerAccountAsync(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return ApiResponse<bool>.Fail("Phone number is required", 1);

        var cleanPhone = phone.Trim();
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == cleanPhone || u.Phone.Replace(" ", "").Replace("+91", "") == cleanPhone.Replace(" ", "").Replace("+91", ""));

        if (user == null)
            return ApiResponse<bool>.Fail("Customer account not found", 1);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Success(true, "Customer account deleted successfully");
    }
}
