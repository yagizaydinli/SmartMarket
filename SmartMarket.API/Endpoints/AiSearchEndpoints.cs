using Dapper;
using Microsoft.AspNetCore.Mvc;
using SmartMarket.API.Models;
using SmartMarket.API.Services;
using System.Data;

namespace SmartMarket.API.Endpoints;

public static class AiSearchEndpoints
{
    public static void MapAiSearchEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/ai").WithTags("AI Search");

        group.MapGet("/search", async ([FromQuery] string query, 
                                       [FromServices] GroqAiService groqService, 
                                       [FromServices] IDbConnection db) =>
        {
            if (string.IsNullOrWhiteSpace(query))
                return Results.BadRequest("Arama sorgusu boş olamaz.");

            try
            {
                // 1. Groq'tan SQL'i al
                var generatedSql = await groqService.GenerateSqlQueryAsync(query);

                // Güvenlik katmanı: Dönen string gerçekten bir SELECT ile mi başlıyor? (Temel kontrol)
                if (!generatedSql.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
                    return Results.BadRequest("Üretilen sorgu güvenli değil veya anlaşılamadı.");

                // 2. Dapper ile dinamik SQL'i çalıştır
                var products = await db.QueryAsync<Product>(generatedSql);

                return Results.Ok(new 
                { 
                    GeneratedSql = generatedSql, // Frontend'de developer modunda veya UI'da göstermek havalı olabilir
                    Results = products 
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"AI arama sırasında hata: {ex.Message}");
            }
        });
    }
}