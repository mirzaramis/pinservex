using HardwareStore.DTOs.Response;
using HardwareStore.Repositories.Category;
using Microsoft.Extensions.Caching.Memory;

namespace HardwareStore.Services.Category
{
    public class CategoryService : ICategoryService
    {
        // The category list and the brand->category map change only when the
        // catalogue is reloaded, but the navbar requests both on every page
        // view. On Azure SQL Basic (5 DTU) the brands-map aggregation over
        // ~15k products was taking multiple seconds per visitor, so both are
        // held in process memory for an hour.
        private static readonly TimeSpan CacheTtl = TimeSpan.FromHours(1);
        private const string CategoriesKey = "categories:all";
        private const string BrandsMapKey = "categories:brands-map";

        private readonly ICategoryRepository _categoryRepository;
        private readonly IMemoryCache _cache;

        public CategoryService(ICategoryRepository categoryRepository, IMemoryCache cache)
        {
            _categoryRepository = categoryRepository;
            _cache = cache;
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
        {
            var items = await _cache.GetOrCreateAsync(CategoriesKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheTtl;
                return (await _categoryRepository.GetAllAsync()).ToList();
            });
            return items ?? Enumerable.Empty<CategoryResponse>();
        }

        public Task<IEnumerable<CategoryBrandResponse>?> GetBrandsAsync(int categoryId)
        {
            return _categoryRepository.GetBrandsAsync(categoryId);
        }

        public async Task<IEnumerable<CategoryBrandMapItemResponse>> GetBrandsMapAsync()
        {
            var items = await _cache.GetOrCreateAsync(BrandsMapKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheTtl;
                return (await _categoryRepository.GetBrandsMapAsync()).ToList();
            });
            return items ?? Enumerable.Empty<CategoryBrandMapItemResponse>();
        }
    }
}
