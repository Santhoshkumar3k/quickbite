namespace QuickBite.Api.Models.Common;

public class ApiResponse<T>
{
    public int ErrorCode { get; set; } = 0; // 0 = Success, 1 = Error (Matching enterprise company standard)
    public string Message { get; set; } = "Success";
    public T? Data { get; set; }

    public static ApiResponse<T> Success(T data, string message = "Success")
    {
        return new ApiResponse<T>
        {
            ErrorCode = 0,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Fail(string message, int errorCode = 1)
    {
        return new ApiResponse<T>
        {
            ErrorCode = errorCode,
            Message = message,
            Data = default
        };
    }
}
