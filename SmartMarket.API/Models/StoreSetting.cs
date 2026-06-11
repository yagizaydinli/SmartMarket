using System.ComponentModel.DataAnnotations;
public class StoreSetting
{
    [Key]
    public int Id { get; set; } // Tek bir satır olacak (id: 1)
    public string? CompanyName { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? MersisNo { get; set; }
    public string? Currency { get; set; } // "₺", "€", "Ft"
}