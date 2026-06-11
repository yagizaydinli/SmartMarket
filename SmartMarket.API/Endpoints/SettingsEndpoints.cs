using Dapper;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using SmartMarket.API.Models; // <-- StoreSetting model'ını kullanmak için
namespace SmartMarket.API.Endpoints;

public static class SettingsEndpoints
{
    public static void MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings").WithTags("Settings");

        // Ayarları Getir
        group.MapGet("/", async ([FromServices] IDbConnection db) =>
        {
            const string sql = "SELECT * FROM store_settings LIMIT 1";
            var settings = await db.QueryFirstOrDefaultAsync<StoreSetting>(sql);
            return Results.Ok(settings ?? new StoreSetting());
        });

        // Ayarları Güncelle (Upsert)
        group.MapPut("/", async (StoreSetting settings, [FromServices] IDbConnection db) =>
        {
            const string sql = @"
                INSERT INTO store_settings (id, company_name, address, phone, mersis_no, currency)
                VALUES (1, @CompanyName, @Address, @Phone, @MersisNo, @Currency)
                ON CONFLICT (id) DO UPDATE SET
                    company_name = EXCLUDED.company_name,
                    address = EXCLUDED.address,
                    phone = EXCLUDED.phone,
                    mersis_no = EXCLUDED.mersis_no,
                    currency = EXCLUDED.currency;";

            await db.ExecuteAsync(sql, settings);
            return Results.Ok(settings);
        });
    }
}