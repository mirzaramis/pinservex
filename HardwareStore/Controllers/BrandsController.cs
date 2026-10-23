using HardwareStore.DTOs.Response;
using HardwareStore.Services.Brand;
using HardwareStore.Services.Product;
using Microsoft.AspNetCore.Mvc;

namespace HardwareStore.Controllers
{
    [ApiController]
    [Route("api/brands")]
    public class BrandsController : ControllerBase
    {
        private readonly IBrandService _brandService;
        private readonly IProductService _productService;

        public BrandsController(IBrandService brandService, IProductService productService)
        {
            _brandService = brandService;
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BrandResponse>>> GetAll()
        {
            var brands = await _brandService.GetAllAsync();
            return Ok(brands);
        }

        [HttpGet("{brandId}/products")]
        public async Task<ActionResult<ProductListResponse>> GetProductsByBrand(int brandId, [FromQuery] int? categoryId = null, [FromQuery] int pageNumber = 1)
        {
            var result = await _productService.GetByBrandAsync(brandId, categoryId, pageNumber);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}
