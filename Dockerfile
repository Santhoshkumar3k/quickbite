# Stage 1: Build .NET API and compile assets
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY QuickBite.Api/QuickBite.Api.csproj QuickBite.Api/
RUN dotnet restore QuickBite.Api/QuickBite.Api.csproj

# Copy the rest and publish
COPY QuickBite.Api/ QuickBite.Api/
WORKDIR /src/QuickBite.Api
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime environment
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Environment configuration
ENV ASPNETCORE_URLS=http://+:8080
ENV ConnectionStrings__DefaultConnection="Data Source=quickbite.db"
EXPOSE 8080

ENTRYPOINT ["dotnet", "QuickBite.Api.dll"]
