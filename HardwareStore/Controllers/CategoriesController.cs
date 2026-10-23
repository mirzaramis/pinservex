using HardwareStore.DTOs.Response;
using HardwareStore.Services.Category;
using HardwareStore.Services.Product;
using Microsoft.AspNetCore.Mvc;

namespace HardwareStore.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IProductService _productService;

        public CategoriesController(ICategoryService categoryService, IProductService productService)
        {
            _categoryService = categoryService;
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("brands-map")]
        public async Task<ActionResult<IEnumerable<CategoryBrandMapItemResponse>>> GetBrandsMap()
        {
            var items = await _categoryService.GetBrandsMapAsync();
            return Ok(items);
        }

        [HttpGet("{categoryId}/brands")]
        public async Task<ActionResult<IEnumerable<CategoryBrandResponse>>> GetBrands(int categoryId)
        {
            var brands = await _categoryService.GetBrandsAsync(categoryId);
            if (brands == null)
                return NotFound();

            return Ok(brands);
        }

        [HttpGet("{categoryId}/products")]
        public async Task<ActionResult<ProductListResponse>> GetProductsByCategory(int categoryId, [FromQuery] int? brandId = null, [FromQuery] int pageNumber = 1)
        {
            var result = await _productService.GetByCategoryAsync(categoryId, brandId, pageNumber);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}
