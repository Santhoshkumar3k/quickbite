using System.Security.Cryptography;
using System.Text;

namespace QuickBite.Api.Security;

public static class GatewaySecurity
{
    // Enterprise 256-bit AES Key and 128-bit IV for End-to-End Network Payload Encryption
    private static readonly byte[] AesKey = Encoding.UTF8.GetBytes("QbSecureFoodAppKey2026@SwiggyZmt"); // 32 bytes
    private static readonly byte[] AesIv  = Encoding.UTF8.GetBytes("QuickBiteIv2026!"); // 16 bytes
    private static readonly byte[] HmacKey = Encoding.UTF8.GetBytes("QB_HMAC_SECRET_INTEGRITY_TOKEN_2026_994");

    public static string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return string.Empty;

        using var aes = Aes.Create();
        aes.Key = AesKey;
        aes.IV = AesIv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor();
        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
        return Convert.ToBase64String(cipherBytes);
    }

    public static string Decrypt(string cipherText)
    {
        if (string.IsNullOrWhiteSpace(cipherText))
            return string.Empty;

        using var aes = Aes.Create();
        aes.Key = AesKey;
        aes.IV = AesIv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var decryptor = aes.CreateDecryptor();
        byte[] cipherBytes = Convert.FromBase64String(cipherText.Trim());
        byte[] plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
        return Encoding.UTF8.GetString(plainBytes);
    }

    public static string ComputeHmac(string data)
    {
        using var hmac = new HMACSHA256(HmacKey);
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data ?? string.Empty));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static bool VerifyRequest(string act, long ts, string? pld, string providedSig, out string? error)
    {
        error = null;

        // Verify timestamp drift (reject if older than 5 minutes or in future by > 2 mins to prevent replay attacks)
        var nowEpochMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        if (Math.Abs(nowEpochMs - ts) > 300000)
        {
            error = "Request expired or invalid timestamp clock drift.";
            return false;
        }

        // Verify HMAC signature
        var payloadForHash = $"{act}|{ts}|{pld ?? string.Empty}";
        var computedSig = ComputeHmac(payloadForHash);

        if (!string.Equals(computedSig, providedSig, StringComparison.OrdinalIgnoreCase))
        {
            error = "Security integrity validation failed: invalid signature.";
            return false;
        }

        return true;
    }
}
