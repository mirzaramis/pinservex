using HardwareStore.DTOs.Response;
using HardwareStore.Repositories.Brand;

namespace HardwareStore.Services.Brand
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _brandRepository;

        public BrandService(IBrandRepository brandRepository)
        {
            _brandRepository = brandRepository;
        }

        public Task<IEnumerable<BrandResponse>> GetAllAsync()
        {
            return _brandRepository.GetAllAsync();
        }
    }
}
