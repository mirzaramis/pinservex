using System.Data;
using HardwareStore.DTOs.Response;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HardwareStore.Repositories.Category
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly string _connectionString;

        public CategoryRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllAsync()
        {
            var categories = new List<CategoryResponse>();

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Category_GetAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                categories.Add(new CategoryResponse
                {
                    Id = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                });
            }

            return categories;
        }

        public async Task<IEnumerable<CategoryBrandResponse>?> GetBrandsAsync(int categoryId)
        {
            var brands = new List<CategoryBrandResponse>();

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Category_GetBrands", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@CategoryId", SqlDbType.Int) { Value = categoryId });

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (!reader.HasRows)
                return brands;

            if (reader.FieldCount == 1 && reader.GetName(0) == "ErrorCode")
            {
                if (await reader.ReadAsync())
                {
                    var errorCode = Convert.ToInt32(reader.GetValue(0));
                    if (errorCode == -1)
                        return null;
                }

                return brands;
            }

            while (await reader.ReadAsync())
            {
                brands.Add(new CategoryBrandResponse
                {
                    Id = reader.GetInt32(reader.GetOrdinal("BrandId")),
                    Name = reader.GetString(reader.GetOrdinal("BrandName")),
                    Tier = reader.GetString(reader.GetOrdinal("Tier")),
                    ProductCount = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("ProductCount"))),
                });
            }

            return brands;
        }

        public async Task<IEnumerable<CategoryBrandMapItemResponse>> GetBrandsMapAsync()
        {
            var items = new List<CategoryBrandMapItemResponse>();

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Category_GetBrandsMap", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                items.Add(new CategoryBrandMapItemResponse
                {
                    CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                    CategoryName = reader.GetString(reader.GetOrdinal("CategoryName")),
                    BrandId = reader.GetInt32(reader.GetOrdinal("BrandId")),
                    BrandName = reader.GetString(reader.GetOrdinal("BrandName")),
                    ProductCount = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("ProductCount"))),
                });
            }

            return items;
        }
    }
}
