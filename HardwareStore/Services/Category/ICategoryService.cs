using HardwareStore.DTOs.Response;

namespace HardwareStore.Services.Category
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponse>> GetAllAsync();
        Task<IEnumerable<CategoryBrandResponse>?> GetBrandsAsync(int categoryId);
        Task<IEnumerable<CategoryBrandMapItemResponse>> GetBrandsMapAsync();
    }
}
