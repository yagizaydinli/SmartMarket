using Dapper;
using Microsoft.AspNetCore.Mvc;
using SmartMarket.API.Models;
using System.Data;

namespace SmartMarket.API.Endpoints;

public static class PosEndpoints
{
    public static void MapPosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/pos").WithTags("Point of Sale");

        // 1. Barkod ile ms hızında ürün getirme (B-Tree Index kullanır)
        group.MapGet("/product/{barcode}", async (string barcode, [FromServices] IDbConnection db) =>
        {
            const string sql = "SELECT id, barcode, name, price, stock FROM products WHERE barcode = @Barcode LIMIT 1";
            var product = await db.QuerySingleOrDefaultAsync<Product>(sql, new { Barcode = barcode });

            return product is not null ? Results.Ok(product) : Results.NotFound("Ürün bulunamadı.");
        });

        // 2. Fiş kesme ve stok düşme işlemi (ACID Transaction)
        group.MapPost("/checkout", async (CreateReceiptDto dto, [FromServices] IDbConnection db) =>

        {
            if (db.State != ConnectionState.Open)
                db.Open();

            // Transaction başlatıyoruz. Fiş kesilirken hata olursa veya stok yetmezse her şey geri alınacak (Rollback).
            using var transaction = db.BeginTransaction();

            try
            {
                // A. Ana fiş kaydını oluştur ve ID'sini al
                const string insertReceiptSql = @"
                    INSERT INTO receipts (total_amount) 
                    VALUES (@TotalAmount) RETURNING id;";
                
                var receiptId = await db.ExecuteScalarAsync<long>(insertReceiptSql, new { dto.TotalAmount }, transaction);

                // B. Fiş detaylarını (satılan ürünleri) ekle ve stokları güncelle
                const string insertItemSql = @"
                    INSERT INTO receipt_items (receipt_id, product_id, quantity, unit_price) 
                    VALUES (@ReceiptId, @ProductId, @Quantity, @UnitPrice);";

                const string updateStockSql = @"
                    UPDATE products 
                    SET stock = stock - @Quantity, updated_at = NOW() 
                    WHERE id = @ProductId AND stock >= @Quantity;";

                foreach (var item in dto.Items)
                {
                    // Fiş detayını yaz
                    await db.ExecuteAsync(insertItemSql, new 
                    { 
                        ReceiptId = receiptId, 
                        item.ProductId, 
                        item.Quantity, 
                        item.UnitPrice 
                    }, transaction);

                    // Stoğu düş (Stok eksiye düşmemeli, veritabanında check constraint de eklenebilir ama kod seviyesinde de koruyoruz)
                    var affectedRows = await db.ExecuteAsync(updateStockSql, new 
                    { 
                        item.Quantity, 
                        item.ProductId 
                    }, transaction);

                    if (affectedRows == 0)
                    {
                        // Eğer update 0 dönerse ya ürün yoktur ya da stok yetersizdir. Transaction iptal!
                        transaction.Rollback();
                        return Results.BadRequest($"Ürün ID {item.ProductId} için yetersiz stok veya geçersiz ürün.");
                    }
                }

                transaction.Commit();
                return Results.Ok(new { Message = "İşlem başarılı, fiş oluşturuldu.", ReceiptId = receiptId });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                // Gerçek senaryoda burada ILogger ile loglama yapılmalı
                return Results.Problem("Satış işlemi sırasında bir hata oluştu: " + ex.Message);
            }
        });
        // PosEndpoints.cs (Doğru Tablo İsimleriyle)
        group.MapGet("/sales", async (int page, int pageSize, [FromServices] IDbConnection db) =>
{
    var offset = (page - 1) * pageSize;
    
    // receipts tablosunu kullanıyoruz
    const string countSql = "SELECT COUNT(*) FROM receipts";
    var totalItems = await db.ExecuteScalarAsync<int>(countSql);
    
    // Tablonun ismi 'receipts'
    const string sql = @"
        SELECT * FROM receipts 
        ORDER BY created_at DESC 
        LIMIT @pageSize OFFSET @offset";
        
    var sales = await db.QueryAsync<dynamic>(sql, new { pageSize, offset });
    
    return Results.Ok(new {
        items = sales,
        totalPages = (int)Math.Ceiling((double)totalItems / pageSize),
        currentPage = page,
        totalItems
    });
});
    }
}