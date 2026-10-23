namespace HardwareStore.DTOs.Response
{
    public class CategoryBrandResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Tier { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }
}
