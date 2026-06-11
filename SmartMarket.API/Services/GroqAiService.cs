using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace SmartMarket.API.Services;

public class GroqAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GroqAiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GroqApiKey"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new InvalidOperationException("GroqApiKey environment variable is missing.");
        }

        _httpClient.BaseAddress = new Uri("https://api.groq.com/openai/v1/chat/completions");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<string> GenerateSqlQueryAsync(string userPrompt)
    {
        // LLM'i sadece SQL üretmeye zorlayan katı bir System Prompt
        var systemPrompt = @"Sen bir PostgreSQL uzmanısın. 
Görev: Verilen doğal dil isteğini SADECE geçerli bir PostgreSQL SELECT sorgusuna çevir.
Tablo Şeması: products (id BIGINT, barcode VARCHAR, name VARCHAR, price DECIMAL, stock INT)
Kurallar:
1. SADECE SQL sorgusunu döndür. Açıklama, markdown (```sql) veya ekstra metin KESİNLİKLE yazma.
2. Sadece SELECT işlemlerine izin verilir.
3. Arama yaparken ILIKE veya B-Tree/GIN indexlerine uygun sorgular yaz. Örn: name ILIKE '%kelime%'
4. Her zaman LIMIT 50 ekle.";

        var payload = new
        {
            model = "llama-3.1-8b-instant", // Groq üzerindeki hızlı ve mantıksal kapasitesi yüksek model
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.0 // Halüsinasyonu önlemek için sıfır
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("", content);

        if (!response.IsSuccessStatusCode)
            throw new Exception("Groq AI API hatası: " + await response.Content.ReadAsStringAsync());

        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseString);
        
        // ... (JSON parse kısmından sonrası)

        var rawContent = jsonDoc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;

        // ÇOK DAHA AGRESİF TEMİZLEME:
        // 1. Markdown bloklarını kaldır
        var cleanSql = rawContent.Replace("```sql", "").Replace("```", "").Trim();
        
        // 2. "SELECT" kelimesini ara, ondan önceki her şeyi sil
        var selectIndex = cleanSql.IndexOf("SELECT", StringComparison.OrdinalIgnoreCase);
        
        // 3. Eğer SELECT bulunamazsa, AI saçmalamıştır, hata fırlat
        if (selectIndex == -1)
        {
            throw new Exception("AI geçerli bir SELECT sorgusu üretemedi. Yanıt: " + cleanSql);
        }

        // 4. Sadece SELECT'ten sonrasını al
        cleanSql = cleanSql.Substring(selectIndex);

        // 5. Sorgunun sonunda gelebilecek gereksiz açıklamaları (noktalardan sonrasını) kes
        // Bazen AI "SELECT...; İşte sonuçlar" diyebilir.
        var semicolonIndex = cleanSql.IndexOf(';');
        if (semicolonIndex != -1)
        {
            cleanSql = cleanSql.Substring(0, semicolonIndex + 1);
        }

        return cleanSql;
    }
}
