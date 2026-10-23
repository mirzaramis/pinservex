namespace HardwareStore.DTOs.Response
{
    public class ProductListResponse
    {
        public IEnumerable<ProductResponse> Items { get; set; } = new List<ProductResponse>();
        public int TotalCount { get; set; }
    }
}
