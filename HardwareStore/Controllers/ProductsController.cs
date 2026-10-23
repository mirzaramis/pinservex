using HardwareStore.DTOs.Response;
using HardwareStore.Services.Product;
using Microsoft.AspNetCore.Mvc;

namespace HardwareStore.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet("search")]
        public async Task<ActionResult<ProductListResponse>> Search([FromQuery(Name = "q")] string? q, [FromQuery] int? categoryId = null, [FromQuery] int? brandId = null, [FromQuery] int pageNumber = 1)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("Query parameter 'q' is required.");

            var result = await _productService.SearchAsync(q, categoryId, brandId, pageNumber);
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("filter")]
        public async Task<ActionResult<ProductListResponse>> Filter(
            [FromQuery] int? categoryId = null,
            [FromQuery] int? brandId = null,
            [FromQuery] string? capacity = null,
            [FromQuery] string? term1 = null,
            [FromQuery] string? term2 = null,
            [FromQuery] bool ssdOnly = false,
            [FromQuery] bool hddOnly = false,
            [FromQuery] int pageNumber = 1)
        {
            var result = await _productService.FilterAsync(categoryId, brandId, capacity, term1, term2, ssdOnly, hddOnly, pageNumber);
            return Ok(result);
        }

        [HttpGet("{productId}")]
        public async Task<ActionResult<ProductResponse>> GetById(int productId)
        {
            var product = await _productService.GetByIdAsync(productId);
            if (product == null)
                return NotFound();

            return Ok(product);
        }
    }
}
