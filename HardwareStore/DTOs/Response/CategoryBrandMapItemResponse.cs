namespace HardwareStore.DTOs.Response
{
    public class CategoryBrandMapItemResponse
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }
}
