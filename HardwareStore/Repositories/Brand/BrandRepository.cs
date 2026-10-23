using System.Data;
using HardwareStore.DTOs.Response;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HardwareStore.Repositories.Brand
{
    public class BrandRepository : IBrandRepository
    {
        private readonly string _connectionString;

        public BrandRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<IEnumerable<BrandResponse>> GetAllAsync()
        {
            var brands = new List<BrandResponse>();

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Brand_GetAll", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                brands.Add(new BrandResponse
                {
                    Id = reader.GetInt32(reader.GetOrdinal("BrandId")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    Tier = reader.GetString(reader.GetOrdinal("Tier")),
                });
            }

            return brands;
        }
    }
}
