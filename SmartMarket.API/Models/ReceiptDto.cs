namespace SmartMarket.API.Models;

public class ReceiptItemDto
{
    public long ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class CreateReceiptDto
{
    public List<ReceiptItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
}