using HardwareStore.Repositories.Brand;
using HardwareStore.Repositories.Category;
using HardwareStore.Repositories.Product;
using HardwareStore.Services.Brand;
using HardwareStore.Services.Category;
using HardwareStore.Services.Email;
using HardwareStore.Services.Product;
using HardwareStore.Services.Turnstile;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddScoped<IBrandRepository, BrandRepository>();
builder.Services.AddScoped<IBrandService, BrandService>();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.Configure<TurnstileSettings>(builder.Configuration.GetSection("Turnstile"));
builder.Services.AddHttpClient<ITurnstileVerifier, TurnstileVerifier>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                    return false;
                return uri.Host is "localhost" or "127.0.0.1";
            });
        }
        else
        {
            policy.WithOrigins("http://localhost:5173", "https://localhost:5173");
        }

        policy.AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

// Serve the built React SPA (copied into wwwroot at publish time). API routes
// are handled by controllers; any other path falls back to index.html so
// client-side routing works.
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var path = ctx.Context.Request.Path.Value ?? string.Empty;
        // Vite content-hashes everything under /assets, so it can be cached forever.
        // Icons and other public files change rarely; a day is a safe default.
        // index.html must always be revalidated so a new deploy is picked up.
        var cache = path.StartsWith("/assets/", StringComparison.OrdinalIgnoreCase)
            ? "public, max-age=31536000, immutable"
            : path.EndsWith(".html", StringComparison.OrdinalIgnoreCase)
                ? "no-cache"
                : "public, max-age=86400";
        ctx.Context.Response.Headers.CacheControl = cache;
    }
});

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html", new StaticFileOptions
{
    OnPrepareResponse = ctx => ctx.Context.Response.Headers.CacheControl = "no-cache"
});

app.Run();
