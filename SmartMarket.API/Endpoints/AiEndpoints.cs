using Dapper;
using Microsoft.AspNetCore.Mvc;
using SmartMarket.API.Services;
using System.Data;

namespace SmartMarket.API.Endpoints;

public static class AiEndpoints
{
    public static void MapAiEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/ai").WithTags("AI");

        group.MapPost("/report", async (ReportRequest req, [FromServices] GroqAiService ai, [FromServices] IDbConnection db) =>
        {
            try
            {
                // 1. AI'dan ham SQL'i al
                string sql = await ai.GenerateSqlQueryAsync(req.Prompt);
                
                // 2. SQL'i veritabanında çalıştır (Loglamak istersen konsola yazdırabilirsin)
                var result = await db.QueryAsync<dynamic>(sql);
                
                // 3. Sonucu döndür
                return Results.Ok(new {
                    query = sql, // Frontend'de debug için göstermek istersen
                    data = result
                });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });
    }
}

public record ReportRequest(string Prompt);