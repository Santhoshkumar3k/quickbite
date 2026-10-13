namespace QuickBite.Api.Models.Common;

public class GatewayRequest
{
    public string Act { get; set; } = string.Empty;
    public long Ts { get; set; }
    public string Sig { get; set; } = string.Empty;
    public string? Pld { get; set; }
}

public class GatewayResponse
{
    public int Code { get; set; }
    public string Msg { get; set; } = string.Empty;
    public long Ts { get; set; }
    public string Sig { get; set; } = string.Empty;
    public string? Pld { get; set; }

    public static GatewayResponse Ok(string? encryptedPayload, string message = "OK")
    {
        var ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var sigData = $"{0}|{ts}|{encryptedPayload ?? string.Empty}";
        var sig = Security.GatewaySecurity.ComputeHmac(sigData);

        return new GatewayResponse
        {
            Code = 0,
            Msg = message,
            Ts = ts,
            Sig = sig,
            Pld = encryptedPayload
        };
    }

    public static GatewayResponse Fail(string message, int code = 1)
    {
        var ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var sigData = $"{code}|{ts}|";
        var sig = Security.GatewaySecurity.ComputeHmac(sigData);

        return new GatewayResponse
        {
            Code = code,
            Msg = message,
            Ts = ts,
            Sig = sig,
            Pld = null
        };
    }
}
