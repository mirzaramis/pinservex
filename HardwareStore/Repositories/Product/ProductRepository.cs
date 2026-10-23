using System.Data;
using HardwareStore.DTOs.Response;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HardwareStore.Repositories.Product
{
    public class ProductRepository : IProductRepository
    {
        private readonly string _connectionString;

        public ProductRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        public async Task<ProductListResponse?> GetByCategoryAsync(int categoryId, int? brandId = null, int pageNumber = 1)
        {
            var result = new ProductListResponse { Items = new List<ProductResponse>(), TotalCount = 0 };

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Product_GetByCategory", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@CategoryId", SqlDbType.Int) { Value = categoryId });
            command.Parameters.Add(new SqlParameter("@BrandId", SqlDbType.Int) { Value = brandId.HasValue ? (object)brandId.Value : DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PageNumber", SqlDbType.Int) { Value = pageNumber });

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                if (reader.FieldCount == 1 && reader.GetName(0) == "ErrorCode")
                {
                    if (await reader.ReadAsync())
                    {
                        var errorCode = Convert.ToInt32(reader.GetValue(0));
                        if (errorCode is -1 or -2)
                            return null;
                    }
                }
                else
                {
                    while (await reader.ReadAsync())
                    {
                        ((List<ProductResponse>)result.Items).Add(MapProductRow(reader, includeCategoryName: false));
                    }
                }
            }

            if (await reader.NextResultAsync())
            {
                if (await reader.ReadAsync())
                {
                    result.TotalCount = Convert.ToInt32(reader.GetValue(0));
                }
            }

            return result;
        }

        public async Task<ProductListResponse?> GetByBrandAsync(int brandId, int? categoryId = null, int pageNumber = 1)
        {
            var result = new ProductListResponse { Items = new List<ProductResponse>(), TotalCount = 0 };

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Product_GetByBrand", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@BrandId", SqlDbType.Int) { Value = brandId });
            command.Parameters.Add(new SqlParameter("@CategoryId", SqlDbType.Int) { Value = categoryId.HasValue ? (object)categoryId.Value : DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PageNumber", SqlDbType.Int) { Value = pageNumber });

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                if (reader.FieldCount == 1 && reader.GetName(0) == "ErrorCode")
                {
                    if (await reader.ReadAsync())
                    {
                        var errorCode = Convert.ToInt32(reader.GetValue(0));
                        if (errorCode is -1 or -2)
                            return null;
                    }
                }
                else
                {
                    while (await reader.ReadAsync())
                    {
                        ((List<ProductResponse>)result.Items).Add(MapProductRow(reader, includeCategoryName: true));
                    }
                }
            }

            if (await reader.NextResultAsync())
            {
                if (await reader.ReadAsync())
                {
                    result.TotalCount = Convert.ToInt32(reader.GetValue(0));
                }
            }

            return result;
        }

        public async Task<ProductListResponse?> SearchAsync(string searchTerm, int? categoryId = null, int? brandId = null, int pageNumber = 1)
        {
            var result = new ProductListResponse { Items = new List<ProductResponse>(), TotalCount = 0 };

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Product_Search", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@SearchTerm", SqlDbType.NVarChar, 100) { Value = searchTerm });
            command.Parameters.Add(new SqlParameter("@CategoryId", SqlDbType.Int) { Value = categoryId.HasValue ? (object)categoryId.Value : DBNull.Value });
            command.Parameters.Add(new SqlParameter("@BrandId", SqlDbType.Int) { Value = brandId.HasValue ? (object)brandId.Value : DBNull.Value });
            command.Parameters.Add(new SqlParameter("@PageNumber", SqlDbType.Int) { Value = pageNumber });

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                if (reader.FieldCount == 1 && reader.GetName(0) == "ErrorCode")
                {
                    if (await reader.ReadAsync())
                    {
                        var errorCode = Convert.ToInt32(reader.GetValue(0));
                        if (errorCode is -1 or -2)
                            return null;
                    }
                }
                else
                {
                    while (await reader.ReadAsync())
                    {
                        ((List<ProductResponse>)result.Items).Add(MapProductRow(reader, includeCategoryName: true));
                    }
                }
            }

            if (await reader.NextResultAsync())
            {
                if (await reader.ReadAsync())
                {
                    result.TotalCount = Convert.ToInt32(reader.GetValue(0));
                }
            }

            return result;
        }

        public async Task<ProductResponse?> GetByIdAsync(int productId)
        {
            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Product_GetById", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.Add(new SqlParameter("@ProductId", SqlDbType.BigInt) { Value = productId });

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (!reader.HasRows)
                return null;

            if (await reader.ReadAsync())
            {
                return MapProductRow(reader, includeCategoryName: true);
            }

            return null;
        }

        public async Task<ProductListResponse?> FilterAsync(int? categoryId, int? brandId, string? capacity, string? term1, string? term2, bool ssdOnly, bool hddOnly, int pageNumber = 1)
        {
            var result = new ProductListResponse { Items = new List<ProductResponse>(), TotalCount = 0 };

            await using var connection = new SqlConnection(_connectionString);
            await using var command = new SqlCommand("usp_Product_Filter", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            static object Val(string? s) => string.IsNullOrWhiteSpace(s) ? DBNull.Value : s.Trim();

            command.Parameters.Add(new SqlParameter("@CategoryId", SqlDbType.Int) { Value = categoryId.HasValue ? (object)categoryId.Value : DBNull.Value });
            command.Parameters.Add(new SqlParameter("@BrandId", SqlDbType.Int) { Value = brandId.HasValue ? (object)brandId.Value : DBNull.Value });
            command.Parameters.Add(new SqlParameter("@Capacity", SqlDbType.NVarChar, 20) { Value = Val(capacity) });
            command.Parameters.Add(new SqlParameter("@Term1", SqlDbType.NVarChar, 60) { Value = Val(term1) });
            command.Parameters.Add(new SqlParameter("@Term2", SqlDbType.NVarChar, 60) { Value = Val(term2) });
            command.Parameters.Add(new SqlParameter("@SsdOnly", SqlDbType.Bit) { Value = ssdOnly });
            command.Parameters.Add(new SqlParameter("@HddOnly", SqlDbType.Bit) { Value = hddOnly });
            command.Parameters.Add(new SqlParameter("@PageNumber", SqlDbType.Int) { Value = pageNumber });

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows)
            {
                while (await reader.ReadAsync())
                {
                    ((List<ProductResponse>)result.Items).Add(MapProductRow(reader, includeCategoryName: true));
                }
            }

            if (await reader.NextResultAsync())
            {
                if (await reader.ReadAsync())
                {
                    result.TotalCount = Convert.ToInt32(reader.GetValue(0));
                }
            }

            return result;
        }

        private static ProductResponse MapProductRow(SqlDataReader reader, bool includeCategoryName)
        {
            var product = new ProductResponse
            {
                Id = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("ProductId"))),
                CategoryId = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("CategoryId"))),
                BrandId = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("BrandId"))),
                BrandName = reader.GetString(reader.GetOrdinal("BrandName")),
                SKU = reader.GetString(reader.GetOrdinal("SKU")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl")) ? null : reader.GetString(reader.GetOrdinal("ImageUrl"))
            };

            if (includeCategoryName)
            {
                product.CategoryName = reader.GetString(reader.GetOrdinal("CategoryName"));
            }

            return product;
        }
    }
}
