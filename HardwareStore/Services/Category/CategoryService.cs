using HardwareStore.DTOs.Response;
using HardwareStore.Repositories.Category;

namespace HardwareStore.Services.Category
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public Task<IEnumerable<CategoryResponse>> GetAllAsync()
        {
            return _categoryRepository.GetAllAsync();
        }

        public Task<IEnumerable<CategoryBrandResponse>?> GetBrandsAsync(int categoryId)
        {
            return _categoryRepository.GetBrandsAsync(categoryId);
        }

        public Task<IEnumerable<CategoryBrandMapItemResponse>> GetBrandsMapAsync()
        {
            return _categoryRepository.GetBrandsMapAsync();
        }
    }
}
