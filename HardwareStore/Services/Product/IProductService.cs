using HardwareStore.DTOs.Response;

namespace HardwareStore.Services.Product
{
    public interface IProductService
    {
        Task<ProductListResponse?> GetByCategoryAsync(int categoryId, int? brandId = null, int pageNumber = 1);
        Task<ProductListResponse?> GetByBrandAsync(int brandId, int? categoryId = null, int pageNumber = 1);
        Task<ProductResponse?> GetByIdAsync(int productId);
        Task<ProductListResponse?> SearchAsync(string searchTerm, int? categoryId = null, int? brandId = null, int pageNumber = 1);
        Task<ProductListResponse?> FilterAsync(int? categoryId, int? brandId, string? capacity, string? term1, string? term2, bool ssdOnly, bool hddOnly, int pageNumber = 1);
    }
}
