using Dapper;
using Microsoft.AspNetCore.Mvc;
using SmartMarket.API.Models;
using System.Data;

namespace SmartMarket.API.Endpoints;

public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        // Yeni ürün tanımlama
        group.MapPost("/", async (CreateProductDto dto, [FromServices] IDbConnection db) =>
        {
            // Veritabanı bağlantısı kapalıysa aç (Connection pooling zaten arkada bunu optimize eder)
            if (db.State != ConnectionState.Open)
                db.Open();

            // 1. Barkod kontrolü (Aynı barkoddan var mı?)
            const string checkSql = "SELECT COUNT(1) FROM products WHERE barcode = @Barcode";
            
            // ExecuteScalarAsync ile tek bir değer (0 veya 1) çekmek performansı artırır
            var exists = await db.ExecuteScalarAsync<int>(checkSql, new { dto.Barcode }) > 0;

            if (exists)
            {
                return Results.BadRequest(new { message = "Bu barkod numarası sistemde zaten kayıtlı!" });
            }

            // 2. Yeni ürünü ekle ve PostgreSQL'in nimetlerinden faydalanarak oluşturulan ID'yi anında al
            const string insertSql = @"
                INSERT INTO products (barcode, name, price, stock, tax_rate, created_at) 
                VALUES (@Barcode, @Name, @Price, @Stock, @TaxRate, NOW()) 
                RETURNING id;";

            try
            {
                var newId = await db.ExecuteScalarAsync<int>(insertSql, new 
                { 
                    dto.Barcode, 
                    dto.Name, 
                    dto.Price, 
                    dto.Stock, 
                    dto.TaxRate 
                });

                // 3. Başarılı yanıtı, oluşturulan ID ile birlikte dön (Frontend bu ID'yi sepette kullanabilir)
                var createdProduct = new Product
                {
                    Id = newId,
                    Barcode = dto.Barcode,
                    Name = dto.Name,
                    Price = dto.Price,
                    Stock = dto.Stock,
                    TaxRate = dto.TaxRate,
                    CreatedAt = DateTime.UtcNow // C# tarafında temsili olarak set ediyoruz
                };

                return Results.Ok(createdProduct);
            }
            catch (Exception ex)
            {
                // Gerçek senaryoda ILogger ile loglanmalı
                return Results.Problem("Ürün eklenirken veritabanında bir hata oluştu: " + ex.Message);
            }
        });
    }
}

// Frontend'den (React) gelecek payload
public record CreateProductDto(string Barcode, string Name, decimal Price, int Stock, int TaxRate);