using Microsoft.EntityFrameworkCore;
using QuickBite.Api.Models;

namespace QuickBite.Api.Data;

public static class DbInitializer
{
    public static void Initialize(QuickBiteDbContext context)
    {
        context.Database.EnsureCreated();

        // Ensure Users table exists for existing databases created with EnsureCreated()
        try
        {
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
                BEGIN
                    CREATE TABLE [Users] (
                        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [Name] NVARCHAR(150) NOT NULL,
                        [Phone] NVARCHAR(20) NOT NULL,
                        [Address] NVARCHAR(500) NULL,
                        [HomeAddress] NVARCHAR(500) NULL,
                        [WorkAddress] NVARCHAR(500) NULL,
                        [ActiveAddressType] NVARCHAR(20) NULL,
                        [WalletBalance] DECIMAL(18,2) NOT NULL DEFAULT 0,
                        [ReferredBy] NVARCHAR(50) NULL,
                        [ReferralCode] NVARCHAR(50) NULL,
                        [JoinedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                    );
                    CREATE UNIQUE INDEX [IX_Users_Phone] ON [Users]([Phone]);
                END
                ELSE
                BEGIN
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ReferralCode')
                    BEGIN
                        ALTER TABLE [Users] ADD [ReferralCode] NVARCHAR(50) NULL;
                    END
                END
            ");
        }
        catch
        {
            // Fallback or ignore if table already exists or SQLite/other provider
        }

        // Ensure pure vegetarian restaurants never have non-veg images in existing databases
        try
        {
            context.Database.ExecuteSqlRaw(@"
                -- 1. Fix MTR - Mavalli Tiffin Room (replace tandoori chicken legs with South Indian dosa & idli)
                UPDATE [Restaurants] 
                SET [BannerUrl] = 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=800&auto=format&fit=crop&q=80'
                WHERE [Name] LIKE '%MTR%' OR [Name] LIKE '%Mavalli%';

                UPDATE [MenuItems]
                SET [ImageUrl] = 'https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=600&auto=format&fit=crop&q=80'
                WHERE [Name] LIKE '%Rava Idli%' AND [RestaurantId] IN (SELECT [Id] FROM [Restaurants] WHERE [Name] LIKE '%MTR%' OR [Name] LIKE '%Mavalli%');

                -- 2. Fix Brahmin's Coffee Bar (pure veg tiffin)
                UPDATE [Restaurants] 
                SET [BannerUrl] = 'https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=800&auto=format&fit=crop&q=80'
                WHERE [Name] LIKE '%Brahmin%';

                UPDATE [MenuItems]
                SET [ImageUrl] = 'https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=600&auto=format&fit=crop&q=80'
                WHERE [Name] LIKE '%Idli Vada%' AND [RestaurantId] IN (SELECT [Id] FROM [Restaurants] WHERE [Name] LIKE '%Brahmin%');

                UPDATE [MenuItems]
                SET [ImageUrl] = 'https://images.unsplash.com/photo-1694849789325-914b71ab4075?w=600&auto=format&fit=crop&q=80'
                WHERE [Name] LIKE '%Khara Bath%' AND [RestaurantId] IN (SELECT [Id] FROM [Restaurants] WHERE [Name] LIKE '%Brahmin%');

                -- 3. Fix Chai Point & Samosa Party (pure veg samosas)
                UPDATE [MenuItems]
                SET [ImageUrl] = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
                WHERE [Name] LIKE '%Samosa%' AND [RestaurantId] IN (SELECT [Id] FROM [Restaurants] WHERE [Name] LIKE '%Chai Point%' OR [Name] LIKE '%Samosa%');
            ");
        }
        catch
        {
            // Ignore if tables not yet populated
        }

        if (context.Restaurants.Any())
        {
            return;
        }

        var restaurants = new List<Restaurant>
        {
            // 0. Mudde Mane & Naati Oota (Healthy Superfoods)
            new Restaurant
            {
                Name = "Mudde Mane & Naati Oota",
                Cuisine = "Healthy Ragi Mudde, Bassaru & Naati Oota",
                Rating = 4.9m,
                ReviewCount = 7800,
                DeliveryMinutes = 20,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
                Address = "14th Main, Rajajinagar & Jayanagar 4th Block, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Traditional Ragi Mudde with Soppina Bassaru & Palya",
                        Category = "Healthy",
                        Price = 150m,
                        Description = "Nutrient-dense organic finger millet steamed ball served with piping hot spiced greens bassaru, dill leaves palya, pure ghee, and roasted papad. Rich in fiber and calcium with zero refined oil.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Choose Mudde Count\",\"mandatory\":true,\"options\":[{\"name\":\"1 Ragi Mudde with Full Saaru\",\"price\":0},{\"name\":\"2 Ragi Muddes with Extra Saaru\",\"price\":50}]},{\"id\":\"ghee\",\"title\":\"Ghee Preference\",\"mandatory\":true,\"options\":[{\"name\":\"Pure Desi Cow Ghee Topping\",\"price\":0},{\"name\":\"No Ghee (Vegan Healthy)\",\"price\":0}]},{\"id\":\"sides\",\"title\":\"Healthy Add-ons\",\"mandatory\":false,\"options\":[{\"name\":\"Extra Soppina Palya Cup\",\"price\":30},{\"name\":\"Roasted Masala Papad (2 pcs)\",\"price\":20}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Ragi Mudde with Naati Koli Saaru (Country Chicken)",
                        Category = "Healthy",
                        Price = 270m,
                        Description = "Authentic steamed hot Ragi Mudde paired with slow-simmered free-range country chicken saaru made with freshly ground coriander, pepper, and coconut masala.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Choose Mudde Count\",\"mandatory\":true,\"options\":[{\"name\":\"1 Ragi Mudde Combo\",\"price\":0},{\"name\":\"2 Ragi Muddes Jumbo Combo\",\"price\":50}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Crispy Jowar Rotti with Ennegayi & Shenga Chutney",
                        Category = "Healthy",
                        Price = 130m,
                        Description = "Two thin gluten-free North Karnataka Jowar (sorghum) rottis served with stuffed spicy brinjal curry and roasted peanut chutney powder.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },
            // 1. Meghana Foods
            new Restaurant
            {
                Name = "Meghana Foods",
                Cuisine = "Andhra Biryani & Spicy Curries",
                Rating = 4.9m,
                ReviewCount = 8520,
                DeliveryMinutes = 25,
                DeliveryFee = 35m,
                MinOrder = 199m,
                BannerUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
                Address = "5th Block, Koramangala & Indiranagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Meghana Special Chicken Biryani",
                        Category = "Biryani",
                        Price = 360m,
                        Description = "The legendary signature boneless chicken layered in spiced saffron basmati rice with fiery red chili masala gravy and cooling cucumber raita.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Choose Portion Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular (Serves 1-2)\",\"price\":0},{\"name\":\"Large (Serves 2-3)\",\"price\":120},{\"name\":\"Family Jumbo Box\",\"price\":280}]},{\"id\":\"spice\",\"title\":\"Spice Level\",\"mandatory\":true,\"options\":[{\"name\":\"Authentic Meghana Fiery Hot\",\"price\":0},{\"name\":\"Medium Spicy\",\"price\":0},{\"name\":\"Mild\",\"price\":0}]},{\"id\":\"addons\",\"title\":\"Extra Sides\",\"mandatory\":false,\"options\":[{\"name\":\"Extra Boiled Egg (2 pcs)\",\"price\":30},{\"name\":\"Extra Burhani Raita\",\"price\":25},{\"name\":\"Extra Mirchi Salan Gravy\",\"price\":25}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Meghana Boneless Mutton Biryani",
                        Category = "Biryani",
                        Price = 440m,
                        Description = "Tender boneless lamb pieces slow-dum cooked with authentic Rayalaseema spices and long-grain basmati.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Choose Portion Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular (Serves 1-2)\",\"price\":0},{\"name\":\"Large (Serves 2-3)\",\"price\":150}]},{\"id\":\"spice\",\"title\":\"Spice Level\",\"mandatory\":true,\"options\":[{\"name\":\"Spicy\",\"price\":0},{\"name\":\"Medium\",\"price\":0}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Andhra Chicken 65 (Dry)",
                        Category = "Starters",
                        Price = 270m,
                        Description = "Crispy boneless chicken bites tossed with fresh curry leaves, crushed pepper, and green chilies.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Paneer Dum Biryani",
                        Category = "Biryani",
                        Price = 290m,
                        Description = "Fresh Malai paneer cubes slow-cooked in rich Andhra spices with saffron basmati rice.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Portion Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular\",\"price\":0},{\"name\":\"Large\",\"price\":90}]}]"
                    }
                }
            },

            // 2. Mani's Dum Biryani
            new Restaurant
            {
                Name = "Mani's Dum Biryani",
                Cuisine = "Ambur & Traditional Dum Biryani",
                Rating = 4.8m,
                ReviewCount = 6120,
                DeliveryMinutes = 30,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80",
                Address = "7th Sector, HSR Layout, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Mani's Signature Chicken Dum Biryani",
                        Category = "Biryani",
                        Price = 280m,
                        Description = "Traditional wood-fired seergasamba dum biryani packed with juicy chicken, boiled egg, brinjal gravy, and raita.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Choose Portion Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular (Serves 1)\",\"price\":0},{\"name\":\"Jumbo Pack (Serves 2-3)\",\"price\":140}]},{\"id\":\"egg\",\"title\":\"Egg Selection\",\"mandatory\":true,\"options\":[{\"name\":\"Include Boiled Egg\",\"price\":0},{\"name\":\"No Egg\",\"price\":0}]},{\"id\":\"extra\",\"title\":\"Add-ons\",\"mandatory\":false,\"options\":[{\"name\":\"Brinjal Gravy (Ennai Kathirikai)\",\"price\":25},{\"name\":\"Extra Onion Raita\",\"price\":20}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Mani's Mutton Dum Biryani",
                        Category = "Biryani",
                        Price = 390m,
                        Description = "Authentic tender mutton pieces simmered in rich curd and mint broth with fragrant seeraga samba rice.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Pepper Chicken Roast",
                        Category = "Starters",
                        Price = 220m,
                        Description = "Dark roasted tender chicken sauteed with freshly crushed Tellicherry black peppercorns.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 3. Al Nahdi Mandi
            new Restaurant
            {
                Name = "Al Nahdi Mandi",
                Cuisine = "Arabian Mandi & Charcoal Grills",
                Rating = 4.8m,
                ReviewCount = 4280,
                DeliveryMinutes = 35,
                DeliveryFee = 45m,
                MinOrder = 249m,
                BannerUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
                Address = "Frazer Town & Bannerghatta Road, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Royal Lamb Shank Mandi",
                        Category = "Arabian",
                        Price = 580m,
                        Description = "Fall-off-the-bone tender smoked lamb shank on an aromatic bed of Yemeni long-grain basmati rice, served with Dakous tomato salsa, spicy green chutney, and fried cashews.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"size\",\"title\":\"Select Mandi Portion\",\"mandatory\":true,\"options\":[{\"name\":\"Single Platter (Serves 1)\",\"price\":0},{\"name\":\"Double Platter (Serves 2-3)\",\"price\":290},{\"name\":\"Family Thaal (Serves 4-5)\",\"price\":650}]},{\"id\":\"rice\",\"title\":\"Rice Type\",\"mandatory\":true,\"options\":[{\"name\":\"Smoked Mandi Rice\",\"price\":0},{\"name\":\"Spicy Bukhari Rice\",\"price\":0}]},{\"id\":\"extra\",\"title\":\"Arabian Extras\",\"mandatory\":false,\"options\":[{\"name\":\"Extra Garlic Toum Sauce\",\"price\":40},{\"name\":\"Extra Spicy Dakous Salsa\",\"price\":25}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Chicken Faham Mandi",
                        Category = "Arabian",
                        Price = 360m,
                        Description = "Charcoal grilled half chicken marinated in Middle-Eastern herbs, served with smoked Mandi rice.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Kunafa with Rose Pistachio",
                        Category = "Desserts",
                        Price = 240m,
                        Description = "Crispy golden kataifi pastry layered with gooey melted Akkawi cheese, sweet orange blossom syrup, and crushed pistachios.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 4. Empire Restaurant
            new Restaurant
            {
                Name = "Empire Restaurant",
                Cuisine = "Bengaluru Midnight Icon & Shawarma",
                Rating = 4.7m,
                ReviewCount = 14800,
                DeliveryMinutes = 20,
                DeliveryFee = 35m,
                MinOrder = 199m,
                BannerUrl = "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80",
                Address = "Church Street, Indiranagar & Kammanahalli, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Empire Special Chicken Shawarma Jumbo",
                        Category = "FastFood",
                        Price = 130m,
                        Description = "Juicy shaved spit-roasted chicken wrapped in freshly baked rumali roti with garlic toum, pickled cabbage, and jalapeños.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"wrap\",\"title\":\"Choose Wrap Base\",\"mandatory\":true,\"options\":[{\"name\":\"Rumali Roti\",\"price\":0},{\"name\":\"Khubz Pita Pocket\",\"price\":0.50}]},{\"id\":\"spicy\",\"title\":\"Spice Preference\",\"mandatory\":true,\"options\":[{\"name\":\"Spicy with Green Chilies\",\"price\":0},{\"name\":\"Regular Garlic Mild\",\"price\":0}]},{\"id\":\"extra\",\"title\":\"Add-ons\",\"mandatory\":false,\"options\":[{\"name\":\"Extra Chicken Filling\",\"price\":1.80},{\"name\":\"Extra Garlic Mayo\",\"price\":20}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Ghee Rice with Empire Butter Chicken",
                        Category = "Curries",
                        Price = 290m,
                        Description = "Aromatic jeera ghee rice with roasted cashews and crispy fried onions, paired with Empire's velvety butter chicken.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Coin Parotta (Pack of 3)",
                        Category = "Breads",
                        Price = 75m,
                        Description = "Flaky, layered Malabar coin parottas cooked on flat tawa with pure butter.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 5. Truffles
            new Restaurant
            {
                Name = "Truffles",
                Cuisine = "American Burgers, Steaks & Shakes",
                Rating = 4.9m,
                ReviewCount = 18900,
                DeliveryMinutes = 25,
                DeliveryFee = 45m,
                MinOrder = 199m,
                BannerUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
                Address = "St. Marks Road & Koramangala 4th Block, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "All American Cheese Burger",
                        Category = "Burgers",
                        Price = 270m,
                        Description = "Truffles' signature juicy chicken or tenderloin patty, double yellow cheddar, gherkins, caramelized onions, and signature house burger sauce.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"size\",\"title\":\"Choose Burger Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular Single Patty\",\"price\":0},{\"name\":\"XL Double Smash Patty\",\"price\":3.20}]},{\"id\":\"pattyType\",\"title\":\"Patty Preference\",\"mandatory\":true,\"options\":[{\"name\":\"Juicy Grilled Chicken\",\"price\":0},{\"name\":\"Crispy Fried Chicken\",\"price\":0.50},{\"name\":\"Veggie Supreme Patty\",\"price\":-1.00}]},{\"id\":\"combo\",\"title\":\"Make it a Combo\",\"mandatory\":false,\"options\":[{\"name\":\"Add Peri Peri Fries + Soft Drink\",\"price\":3.49},{\"name\":\"Extra Bacon Strips\",\"price\":40}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Ferrero Rocher Thick Shake",
                        Category = "Drinks",
                        Price = 210m,
                        Description = "Thick blended shake with whole Ferrero Rocher chocolates, Nutella, hazelnut syrup, and whipped cream.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Peri Peri Chicken Wings (6 pcs)",
                        Category = "Starters",
                        Price = 230m,
                        Description = "Crispy batter-fried wings tossed in zesty African bird's eye chili seasoning.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 6. Nagarjuna Andhra Bhavan
            new Restaurant
            {
                Name = "Nagarjuna Andhra Bhavan",
                Cuisine = "Fiery Andhra Meals & Sholay Kebab",
                Rating = 4.8m,
                ReviewCount = 7400,
                DeliveryMinutes = 25,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80",
                Address = "Residency Road & Indiranagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Nagarjuna Chicken Sholay Kebab",
                        Category = "Starters",
                        Price = 310m,
                        Description = "Boneless chicken bites tossed with fried green chilies, yogurt masala, and crunchy curry leaves. The pride of Bangalore!",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"portion\",\"title\":\"Portion Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular (8 pcs)\",\"price\":0},{\"name\":\"Full Platter (14 pcs)\",\"price\":120}]},{\"id\":\"spice\",\"title\":\"Heat Level\",\"mandatory\":true,\"options\":[{\"name\":\"Extra Andhra Chilly\",\"price\":0},{\"name\":\"Regular Spicy\",\"price\":0}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Traditional Andhra Veg Meal Box",
                        Category = "Meals",
                        Price = 260m,
                        Description = "Unlimited style meal box with Steamed Sona Masoori rice, Guntur Pappu (dal), Gongura pickle, Podi with Pure Ghee, Sambar, Rasam, and Curd.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 7. Corner House Ice Creams
            new Restaurant
            {
                Name = "Corner House Ice Creams",
                Cuisine = "Legendary DBC & Ice Cream Sundaes",
                Rating = 4.9m,
                ReviewCount = 22000,
                DeliveryMinutes = 15,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80",
                Address = "Koramangala, Indiranagar, Jayanagar & Whitefield",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Death By Chocolate (DBC)",
                        Category = "Desserts",
                        Price = 150m,
                        Description = "Warm fudge brownie base with creamy vanilla ice cream scoops, drowned in hot Belgian chocolate sauce, roasted peanuts, and dark chocolate cherries.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"nuts\",\"title\":\"Nuts Preference\",\"mandatory\":true,\"options\":[{\"name\":\"With Roasted Peanuts\",\"price\":0},{\"name\":\"Without Peanuts (Nut-Free)\",\"price\":0}]},{\"id\":\"extraFudge\",\"title\":\"Extra Hot Fudge Sauce\",\"mandatory\":false,\"options\":[{\"name\":\"Add Extra Hot Chocolate Fudge Cup\",\"price\":40}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Trilogy Sundae",
                        Category = "Desserts",
                        Price = 130m,
                        Description = "Three rich scoops of Butterscotch, Pista, and Strawberry drizzled with fruit compote and nuts.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 8. Vidyarthi Bhavan
            new Restaurant
            {
                Name = "Vidyarthi Bhavan",
                Cuisine = "Heritage South Indian Tiffins",
                Rating = 4.9m,
                ReviewCount = 31000,
                DeliveryMinutes = 20,
                DeliveryFee = 30m,
                MinOrder = 99m,
                BannerUrl = "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80",
                Address = "Gandhi Bazaar, Basavanagudi, Bengaluru (Est. 1943)",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Heritage Masala Dosa",
                        Category = "Breakfast",
                        Price = 85m,
                        Description = "Thick, crispy, deep-golden butter dosa stuffed with mild potato palya, served with signature coconut chutney.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"butter\",\"title\":\"Butter Preference\",\"mandatory\":true,\"options\":[{\"name\":\"Traditional Rich Benne (Butter)\",\"price\":0},{\"name\":\"Light Butter\",\"price\":0}]},{\"id\":\"sides\",\"title\":\"Extra Sides\",\"mandatory\":false,\"options\":[{\"name\":\"Extra Coconut Chutney Cup\",\"price\":15},{\"name\":\"Add Filter Coffee\",\"price\":30}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Degree Filter Coffee (Flask for 2)",
                        Category = "Drinks",
                        Price = 60m,
                        Description = "Strong chicory-blended South Indian filter kaapi brewed with fresh whole milk.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 9. CTR (Shri Sagar Malleshwaram)
            new Restaurant
            {
                Name = "CTR - Shri Sagar",
                Cuisine = "Legendary Benne Dosa & Tiffins",
                Rating = 4.9m,
                ReviewCount = 28000,
                DeliveryMinutes = 20,
                DeliveryFee = 30m,
                MinOrder = 99m,
                BannerUrl = "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80",
                Address = "7th Cross, Margosa Road, Malleshwaram, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "CTR Benne Masala Dosa",
                        Category = "Breakfast",
                        Price = 95m,
                        Description = "Iconic crispy golden exterior and cloud-soft interior, drenched in pure butter and loaded with spiced potato sagu.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"type\",\"title\":\"Dosa Choice\",\"mandatory\":true,\"options\":[{\"name\":\"Benne Masala Dosa\",\"price\":0},{\"name\":\"Benne Plain Dosa\",\"price\":-0.50}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Crispy Mangalore Bajji (4 pcs)",
                        Category = "Starters",
                        Price = 60m,
                        Description = "Golden fluffy fried maida and curd fritters with ginger, green chili, and coconut chutney.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 10. Toit Brewpub & Kitchen
            new Restaurant
            {
                Name = "Toit Kitchen & Pub Fare",
                Cuisine = "Woodfired Pizza, Buffalo Wings & Burgers",
                Rating = 4.8m,
                ReviewCount = 16500,
                DeliveryMinutes = 30,
                DeliveryFee = 45m,
                MinOrder = 249m,
                BannerUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
                Address = "100ft Road, Indiranagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Toit Baked Woodfired Pizza",
                        Category = "Pizza",
                        Price = 360m,
                        Description = "Hand-stretched sourdough pizza with smoked scarmoza, spiced pepperoni, roasted garlic, and hot honey drizzle.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"crust\",\"title\":\"Choose Pizza Crust\",\"mandatory\":true,\"options\":[{\"name\":\"Classic Sourdough Thin Crust\",\"price\":0},{\"name\":\"Cheese Stuffed Crust\",\"price\":50}]},{\"id\":\"toppings\",\"title\":\"Extra Gourmet Toppings\",\"mandatory\":false,\"options\":[{\"name\":\"Extra Buffalo Mozzarella\",\"price\":40},{\"name\":\"Jalapenos and Black Olives\",\"price\":25}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Toit Spicy Buffalo Wings",
                        Category = "Starters",
                        Price = 220m,
                        Description = "Crispy wings coated in tangy New York buffalo sauce, served with blue cheese dip and celery sticks.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 11. Glen's Bakehouse
            new Restaurant
            {
                Name = "Glen's Bakehouse",
                Cuisine = "Artisan Pastries, Lasagna & Cheesecakes",
                Rating = 4.8m,
                ReviewCount = 9800,
                DeliveryMinutes = 20,
                DeliveryFee = 35m,
                MinOrder = 199m,
                BannerUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
                Address = "Lavelle Road & Indiranagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Famous Red Velvet Mini Cupcakes (Box of 6)",
                        Category = "Desserts",
                        Price = 180m,
                        Description = "Glen's legendary soft red cocoa sponge with smooth Philadelphia cream cheese frosting.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Creamy Chicken & Spinach Lasagna",
                        Category = "Pasta",
                        Price = 290m,
                        Description = "Layered handmade pasta sheets with tender shredded chicken, baby spinach, bechamel, and melted mozzarella.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 12. Leon's Burgers & Wings
            new Restaurant
            {
                Name = "Leon's Burgers & Wings",
                Cuisine = "Crispy Chicken Burgers & Peri Peri",
                Rating = 4.7m,
                ReviewCount = 11200,
                DeliveryMinutes = 25,
                DeliveryFee = 35m,
                MinOrder = 199m,
                BannerUrl = "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=80",
                Address = "Koramangala, HSR Layout & Kalyan Nagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Leon Jumbo Crispy Chicken Burger",
                        Category = "Burgers",
                        Price = 270m,
                        Description = "Crunchy marinated whole chicken breast, spicy secret mayo, fresh iceberg lettuce, toasted butter bun.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"patty\",\"title\":\"Patty Style\",\"mandatory\":true,\"options\":[{\"name\":\"Fiery Spicy Crispy\",\"price\":0},{\"name\":\"Herbed Grilled\",\"price\":0}]},{\"id\":\"cheese\",\"title\":\"Cheese Slice\",\"mandatory\":false,\"options\":[{\"name\":\"Add American Cheddar Slice\",\"price\":20}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Peri Peri Crinkle Fries",
                        Category = "Sides",
                        Price = 75m,
                        Description = "Crispy crinkle cut fries shaken in hot peri peri spice dust.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 13. Brahmin's Coffee Bar
            new Restaurant
            {
                Name = "Brahmin's Coffee Bar",
                Cuisine = "Legendary Idli, Vada & Chutney",
                Rating = 4.9m,
                ReviewCount = 35000,
                DeliveryMinutes = 15,
                DeliveryFee = 30m,
                MinOrder = 70m,
                BannerUrl = "https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=800&auto=format&fit=crop&q=80",
                Address = "Ranga Rao Road, Shankarpuram, Bengaluru (Est. 1965)",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Idli Vada Combo (2 Idli + 1 Crispy Vada)",
                        Category = "Breakfast",
                        Price = 75m,
                        Description = "Melt-in-mouth steaming rice cakes and golden crunchy medu vada submerged in endless spiced coconut chutney.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Khara Bath & Kesari Bath (Chow Chow Bath)",
                        Category = "Breakfast",
                        Price = 75m,
                        Description = "Spiced roasted semolina upma paired with saffron pineapple ghee halwa.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 14. Third Wave Coffee
            new Restaurant
            {
                Name = "Third Wave Coffee",
                Cuisine = "Artisan Roasts, Bagels & Sandwiches",
                Rating = 4.8m,
                ReviewCount = 8900,
                DeliveryMinutes = 20,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
                Address = "Indiranagar, Koramangala & Sadashivanagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Sea Salt Mocha Cold Brew",
                        Category = "Drinks",
                        Price = 80m,
                        Description = "18-hour steeped single-origin cold brew with dark chocolate syrup and sea salt sweet cream.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"milk\",\"title\":\"Choose Milk Base\",\"mandatory\":true,\"options\":[{\"name\":\"Whole Dairy Milk\",\"price\":0},{\"name\":\"Oat Milk\",\"price\":20},{\"name\":\"Almond Milk\",\"price\":20}]},{\"id\":\"sweet\",\"title\":\"Sweetness Level\",\"mandatory\":true,\"options\":[{\"name\":\"Regular Sweetness\",\"price\":0},{\"name\":\"Less Sweet\",\"price\":0},{\"name\":\"Unsweetened\",\"price\":0}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Toasted Everything Bagel with Cream Cheese",
                        Category = "Breakfast",
                        Price = 95m,
                        Description = "Chewy artisan bagel with sesame, poppy seeds, and roasted garlic, served with scallion cream cheese.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1585827552668-d0947b078e38?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 15. Paradise Biryani
            new Restaurant
            {
                Name = "Paradise Biryani",
                Cuisine = "Hyderabadi Nizami Dum Biryani",
                Rating = 4.7m,
                ReviewCount = 13500,
                DeliveryMinutes = 30,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&auto=format&fit=crop&q=80",
                Address = "Indiranagar 100ft Road & Electronic City, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Nizami Special Chicken Dum Biryani",
                        Category = "Biryani",
                        Price = 320m,
                        Description = "World-famous Hyderabadi dum biryani cooked in copper handi with rich saffron rice, succulent marinated chicken, and Mirchi Ka Salan.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"pack\",\"title\":\"Pack Size\",\"mandatory\":true,\"options\":[{\"name\":\"Regular (Single)\",\"price\":0},{\"name\":\"Double Pack\",\"price\":140}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Mutton Seekh Kebab",
                        Category = "Starters",
                        Price = 220m,
                        Description = "Minced spiced mutton skewered and roasted in clay tandoor oven, served with mint chutney and lemon wedges.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 16. MTR (Mavalli Tiffin Room)
            new Restaurant
            {
                Name = "MTR - Mavalli Tiffin Room",
                Cuisine = "Heritage Karnataka Cuisine & Rava Idli",
                Rating = 4.9m,
                ReviewCount = 42000,
                DeliveryMinutes = 20,
                DeliveryFee = 35m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=800&auto=format&fit=crop&q=80",
                Address = "Lalbagh Road, Bengaluru (Heritage Est. 1924)",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Authentic MTR Rava Idli (Invented by MTR)",
                        Category = "Breakfast",
                        Price = 95m,
                        Description = "Semolina steamed cake with cashews, mustard seeds, green chilies, and a dollop of pure Desi ghee with potato sagu and chutney.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1788621879512-0aefb7a774ff?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "MTR Bisibelebath with Boondi",
                        Category = "Meals",
                        Price = 210m,
                        Description = "Spiced lentil rice cooked with vegetables, tamarind, nutmeg, pure ghee, and crispy kara boondi.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 17. Beijing Bites
            new Restaurant
            {
                Name = "Beijing Bites",
                Cuisine = "Indo-Chinese, Dimsums & Noodles",
                Rating = 4.6m,
                ReviewCount = 7600,
                DeliveryMinutes = 25,
                DeliveryFee = 35m,
                MinOrder = 199m,
                BannerUrl = "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80",
                Address = "Indiranagar, Koramangala & JP Nagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Chili Garlic Hakka Noodles",
                        Category = "Chinese",
                        Price = 220m,
                        Description = "Wok-tossed noodles with shredded cabbage, bell peppers, spring onions, and roasted red chili garlic oil.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"protein\",\"title\":\"Add Protein Choice\",\"mandatory\":true,\"options\":[{\"name\":\"Veggie Only\",\"price\":0},{\"name\":\"Add Shredded Chicken\",\"price\":2.00},{\"name\":\"Add Prawns\",\"price\":90}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Steamed Chicken Dimsums (6 pcs)",
                        Category = "Starters",
                        Price = 240m,
                        Description = "Translucent dumplings filled with seasoned minced chicken, served with fiery red chili dip.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 18. Onesta
            new Restaurant
            {
                Name = "Onesta Italian Pizzeria",
                Cuisine = "Gourmet Pizzas & Desserts",
                Rating = 4.7m,
                ReviewCount = 8900,
                DeliveryMinutes = 30,
                DeliveryFee = 45m,
                MinOrder = 149m,
                BannerUrl = "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80",
                Address = "Koramangala 4th Block, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Farm Fresh Veggie Pizza",
                        Category = "Pizza",
                        Price = 270m,
                        Description = "Thin crust pizza topped with bell peppers, mushrooms, sweet corn, black olives, and melted mozzarella.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Authentic Classic Tiramisu",
                        Category = "Desserts",
                        Price = 210m,
                        Description = "Espresso-soaked ladyfinger biscuits layered with rich mascarpone cheese and cocoa powder.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 19. The Fatty Bao
            new Restaurant
            {
                Name = "The Fatty Bao",
                Cuisine = "Asian Gastro-Pub & Baos",
                Rating = 4.8m,
                ReviewCount = 5400,
                DeliveryMinutes = 30,
                DeliveryFee = 45m,
                MinOrder = 249m,
                BannerUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80",
                Address = "12th Main Road, Indiranagar, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Char Siu Pork Bao (2 pcs)",
                        Category = "Asian",
                        Price = 380m,
                        Description = "Fluffy steamed lotus leaf buns filled with slow-braised barbecue pork belly, green apple kimchi, and hoisin sauce.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80"
                    },
                    new MenuItem
                    {
                        Name = "Chashu Tonkotsu Ramen Bowl",
                        Category = "Asian",
                        Price = 520m,
                        Description = "Rich 24-hour pork bone broth, springy ramen noodles, marinated soft boiled egg, menma, and nori.",
                        IsVeg = false,
                        ImageUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 20. Chai Point & Samosa Party
            new Restaurant
            {
                Name = "Chai Point & Samosa Party",
                Cuisine = "Fresh Ginger Chai & Punjabi Samosas",
                Rating = 4.8m,
                ReviewCount = 19400,
                DeliveryMinutes = 15,
                DeliveryFee = 30m,
                MinOrder = 99m,
                BannerUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
                Address = "Across all Bengaluru Tech Parks & Metro Stations",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Fresh Ginger Cardamom Chai Flask (Serves 4)",
                        Category = "Drinks",
                        Price = 140m,
                        Description = "Freshly pounded ginger and green cardamom brewed in hot Assam tea leaves with fresh milk in heat-retaining flask.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
                        ModifiersJson = "[{\"id\":\"sugar\",\"title\":\"Sugar Level\",\"mandatory\":true,\"options\":[{\"name\":\"Medium Sweetness\",\"price\":0},{\"name\":\"Sugar-Free (Jaggery)\",\"price\":20},{\"name\":\"No Sugar\",\"price\":0}]}]"
                    },
                    new MenuItem
                    {
                        Name = "Crispy Punjabi Aloo Samosas (Box of 4)",
                        Category = "Starters",
                        Price = 95m,
                        Description = "Golden crisp flaky pastry triangles stuffed with spiced cumin potatoes and green peas, served with mint and tamarind chutney.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"
                    }
                }
            },

            // 21. Polar Bear Ice Cream Sundaes
            new Restaurant
            {
                Name = "Polar Bear Sundaes",
                Cuisine = "Ice Cream Sundaes & Milkshakes",
                Rating = 4.7m,
                ReviewCount = 8900,
                DeliveryMinutes = 20,
                DeliveryFee = 35m,
                MinOrder = 120m,
                BannerUrl = "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&auto=format&fit=crop&q=80",
                Address = "Koramangala, Jayanagar & Whitefield, Bengaluru",
                IsOpen = true,
                MenuItems = new List<MenuItem>
                {
                    new MenuItem
                    {
                        Name = "Gudbud Special Sundae",
                        Category = "Desserts",
                        Price = 210m,
                        Description = "The iconic Coastal Karnataka ice cream sundae layered with strawberry, mango, vanilla ice cream, assorted fruits, jelly, and dry fruits.",
                        IsVeg = true,
                        ImageUrl = "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600&auto=format&fit=crop&q=80"
                    }
                }
            }
        };

        context.Restaurants.AddRange(restaurants);
        context.SaveChanges();

        // Seed a demo initial order from Meghana Foods
        var meghana = context.Restaurants.First(r => r.Name == "Meghana Foods");
        var biryaniItem = meghana.MenuItems.First(m => m.Name.Contains("Biryani"));

        var demoOrder = new Order
        {
            OrderNumber = "QB-518290",
            RestaurantId = meghana.Id,
            RestaurantName = meghana.Name,
            CustomerName = "Santhosh Kumar",
            Phone = "+91 98765 43210",
            DeliveryAddress = "Flat 402, Tower B, Prestige Green Valley, Bengaluru",
            Status = "Preparing",
            Subtotal = 360m,
            DeliveryFee = 35m,
            Tax = 18m,
            TotalAmount = 413m,
            PaymentMethod = "CARD",
            EstimatedMinutes = 25,
            DeliveryRiderName = "Rajesh Gowda",
            DeliveryRiderVehicle = "TVS Raider - KA 03 HX 9942",
            CreatedAt = DateTime.UtcNow.AddMinutes(-12),
            Items = new List<OrderItem>
            {
                new OrderItem
                {
                    MenuItemId = biryaniItem.Id,
                    ItemName = biryaniItem.Name,
                    Quantity = 1,
                    UnitPrice = biryaniItem.Price,
                    Subtotal = biryaniItem.Price,
                    ImageUrl = biryaniItem.ImageUrl,
                    SelectedModifiers = "Regular (Serves 1-2), Authentic Meghana Fiery Hot"
                }
            },
            Payment = new PaymentTransaction
            {
                TransactionId = "TXN-20261007-518290",
                Method = "CARD",
                Status = "SUCCESS",
                Amount = 413m,
                ProcessedAt = DateTime.UtcNow.AddMinutes(-12)
            }
        };

        context.Orders.Add(demoOrder);
        context.SaveChanges();
    }
}
