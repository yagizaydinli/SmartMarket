namespace SmartMarket.API.Models;

public class Product
    {
        public int Id { get; set; }
        public string Barcode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int TaxRate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }