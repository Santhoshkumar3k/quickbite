using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Models;

namespace QuickBite.Api.Data;

public class QuickBiteDbContext : DbContext
{
    public QuickBiteDbContext(DbContextOptions<QuickBiteDbContext> options) : base(options)
    {
    }

    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Restaurant <-> MenuItems relationship
        modelBuilder.Entity<Restaurant>()
            .HasMany(r => r.MenuItems)
            .WithOne(m => m.Restaurant)
            .HasForeignKey(m => m.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Order <-> OrderItems relationship
        modelBuilder.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Order <-> PaymentTransaction (1:1)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Payment)
            .WithOne(p => p.Order)
            .HasForeignKey<PaymentTransaction>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderNumber)
            .IsUnique();

        modelBuilder.Entity<PaymentTransaction>()
            .HasIndex(p => p.TransactionId)
            .IsUnique();

        modelBuilder.Entity<MenuItem>()
            .HasIndex(m => m.Category);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Phone)
            .IsUnique();
    }
}
