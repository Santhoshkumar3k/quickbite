using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Data;
using QuickBite.Api.Hubs;
using QuickBite.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & JSON settings
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Configure SQL Server DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\PersonalProjects;Database=QuickBiteDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

builder.Services.AddDbContext<QuickBiteDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// Configure Dependency Injection: Services Layer
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IMenuService, MenuService>();

// Configure WebSockets (SignalR)
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// Configure CORS (Supporting WebSockets & Credentials)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure Database and Seed Initial Data on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<QuickBiteDbContext>();
        DbInitializer.Initialize(context);
        app.Logger.LogInformation("✓ Microsoft SQL Server 'QuickBiteDb' verified and seeded successfully!");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "✕ Error initializing SQL Server database.");
    }
}

// Enterprise Security Headers Middleware (Prevent Open API scraping & XSS)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// HTTP request pipeline
app.UseCors("AllowAll");

// Serve compiled React frontend from wwwroot if present
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

// Map SignalR WebSockets Hub
app.MapHub<QuickBiteHub>("/hubs/quickbite");

// Map API Controllers
app.MapControllers();

// Fallback to React index.html for client-side routing
app.MapFallbackToFile("index.html");

app.Run();
