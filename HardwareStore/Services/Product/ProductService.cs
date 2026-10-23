using HardwareStore.DTOs.Response;
using HardwareStore.Repositories.Product;

namespace HardwareStore.Services.Product
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public Task<ProductListResponse?> GetByCategoryAsync(int categoryId, int? brandId = null, int pageNumber = 1)
        {
            return _productRepository.GetByCategoryAsync(categoryId, brandId, pageNumber);
        }

        public Task<ProductListResponse?> GetByBrandAsync(int brandId, int? categoryId = null, int pageNumber = 1)
        {
            return _productRepository.GetByBrandAsync(brandId, categoryId, pageNumber);
        }

        public Task<ProductListResponse?> SearchAsync(string searchTerm, int? categoryId = null, int? brandId = null, int pageNumber = 1)
        {
            return _productRepository.SearchAsync(searchTerm, categoryId, brandId, pageNumber);
        }

        public Task<ProductListResponse?> FilterAsync(int? categoryId, int? brandId, string? capacity, string? term1, string? term2, bool ssdOnly, bool hddOnly, int pageNumber = 1)
        {
            return _productRepository.FilterAsync(categoryId, brandId, capacity, term1, term2, ssdOnly, hddOnly, pageNumber);
        }

        public Task<ProductResponse?> GetByIdAsync(int productId)
        {
            return _productRepository.GetByIdAsync(productId);
        }
    }
}
