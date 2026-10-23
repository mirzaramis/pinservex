using HardwareStore.DTOs.Response;

namespace HardwareStore.Repositories.Brand
{
    public interface IBrandRepository
    {
        Task<IEnumerable<BrandResponse>> GetAllAsync();
    }
}
