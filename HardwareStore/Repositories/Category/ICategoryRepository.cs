using HardwareStore.DTOs.Response;

namespace HardwareStore.Repositories.Category
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<CategoryResponse>> GetAllAsync();
        Task<IEnumerable<CategoryBrandResponse>?> GetBrandsAsync(int categoryId);
        Task<IEnumerable<CategoryBrandMapItemResponse>> GetBrandsMapAsync();
    }
}
