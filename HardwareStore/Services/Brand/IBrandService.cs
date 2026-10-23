using HardwareStore.DTOs.Response;

namespace HardwareStore.Services.Brand
{
    public interface IBrandService
    {
        Task<IEnumerable<BrandResponse>> GetAllAsync();
    }
}
