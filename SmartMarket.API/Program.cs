using Npgsql;
using System.Data;
using SmartMarket.API.Endpoints;
using SmartMarket.API.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS politikalarını ekleyelim (Frontend'in API'ye erişebilmesi için)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<GroqAiService>();
builder.Services.AddScoped<GroqAiService>();

// Yüksek performans için NpgsqlDataSource (DbConnection Pool) kaydı
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings__DefaultConnection environment variable is missing.");
}
builder.Services.AddScoped<IDbConnection>(sp => new NpgsqlConnection(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS'u rotalardan ÖNCE çağırıyoruz
app.UseCors();
app.UseHttpsRedirection();

// --- API ENDPOINTS ---
app.MapPosEndpoints();
app.MapAiSearchEndpoints();
app.MapProductEndpoints();
app.MapSettingsEndpoints(); 
app.MapAiEndpoints();
// ---------------------

app.Run();
