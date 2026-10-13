using Microsoft.AspNetCore.SignalR;

namespace QuickBite.Api.Hubs;

public class QuickBiteHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public async Task JoinCustomerRoom(string phone)
    {
        if (!string.IsNullOrWhiteSpace(phone))
        {
            var cleanPhone = phone.Trim();
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Customer_{cleanPhone}");
        }
    }

    public async Task LeaveCustomerRoom(string phone)
    {
        if (!string.IsNullOrWhiteSpace(phone))
        {
            var cleanPhone = phone.Trim();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Customer_{cleanPhone}");
        }
    }
}
