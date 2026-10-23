/* ============================================================
   STORED PROCEDURES — updated for Brand
   ============================================================ */

USE HardwareStore;
GO

-- Unchanged: Category has no Brand relationship.
CREATE OR ALTER PROCEDURE usp_Category_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CategoryId, Name
    FROM Category
    ORDER BY Name ASC;
END
GO

CREATE OR ALTER PROCEDURE usp_Brand_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT BrandId, Name, Tier
    FROM Brand
    ORDER BY Name ASC;
END
GO

CREATE OR ALTER PROCEDURE usp_Product_GetByCategory
    @CategoryId INT,
    @BrandId INT = NULL,
    @PageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Category WHERE CategoryId = @CategoryId)
    BEGIN
        SELECT CAST(-1 AS INT) AS ErrorCode;  -- unknown category
        RETURN;
    END

    IF @BrandId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Brand WHERE BrandId = @BrandId)
    BEGIN
        SELECT CAST(-2 AS INT) AS ErrorCode;  -- unknown brand
        RETURN;
    END

    IF @PageNumber < 1 SET @PageNumber = 1;
    DECLARE @PageSize INT = 12;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT p.ProductId, p.CategoryId, p.SKU, p.Name, p.ImageUrl,
           p.BrandId, b.Name AS BrandName
    FROM Product p
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    WHERE p.CategoryId = @CategoryId
      AND (@BrandId IS NULL OR p.BrandId = @BrandId)
    ORDER BY p.Name ASC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM Product p
    WHERE p.CategoryId = @CategoryId
      AND (@BrandId IS NULL OR p.BrandId = @BrandId);
END
GO

CREATE OR ALTER PROCEDURE usp_Product_GetByBrand
    @BrandId INT,
    @CategoryId INT = NULL,
    @PageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Brand WHERE BrandId = @BrandId)
    BEGIN
        SELECT CAST(-2 AS INT) AS ErrorCode;  -- unknown brand
        RETURN;
    END

    IF @CategoryId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Category WHERE CategoryId = @CategoryId)
    BEGIN
        SELECT CAST(-1 AS INT) AS ErrorCode;  -- unknown category
        RETURN;
    END

    IF @PageNumber < 1 SET @PageNumber = 1;
    DECLARE @PageSize INT = 12;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT p.ProductId, p.CategoryId, c.Name AS CategoryName, p.SKU, p.Name, p.ImageUrl,
           p.BrandId, b.Name AS BrandName
    FROM Product p
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    INNER JOIN Category c ON c.CategoryId = p.CategoryId
    WHERE p.BrandId = @BrandId
      AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
    ORDER BY p.Name ASC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM Product p
    WHERE p.BrandId = @BrandId
      AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId);
END
GO

CREATE OR ALTER PROCEDURE usp_Category_GetBrands
    @CategoryId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Category WHERE CategoryId = @CategoryId)
    BEGIN
        SELECT CAST(-1 AS INT) AS ErrorCode;  -- unknown category
        RETURN;
    END

    SELECT
        b.BrandId,
        b.Name AS BrandName,
        b.Tier,
        COUNT(*) AS ProductCount
    FROM Product p
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    WHERE p.CategoryId = @CategoryId
    GROUP BY b.BrandId, b.Name, b.Tier
    ORDER BY b.Name ASC;
END
GO

-- Bulk variant for the navbar: one call returns every category's brand list
-- in a flat result set (CategoryId, CategoryName, BrandId, BrandName, ProductCount).
-- The frontend groups client-side by CategoryId once, then hover is instant --
-- no per-hover network round trip.
CREATE OR ALTER PROCEDURE usp_Category_GetBrandsMap
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.CategoryId,
        c.Name AS CategoryName,
        b.BrandId,
        b.Name AS BrandName,
        COUNT(*) AS ProductCount
    FROM Product p
    INNER JOIN Category c ON c.CategoryId = p.CategoryId
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    GROUP BY c.CategoryId, c.Name, b.BrandId, b.Name
    ORDER BY c.Name ASC, b.Name ASC;
END
GO

CREATE OR ALTER PROCEDURE usp_Product_GetById
    @ProductId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.ProductId, p.CategoryId, c.Name AS CategoryName, p.SKU, p.Name, p.ImageUrl,
           p.BrandId, b.Name AS BrandName
    FROM Product p
    INNER JOIN Category c ON c.CategoryId = p.CategoryId
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    WHERE p.ProductId = @ProductId;
END
GO

CREATE OR ALTER PROCEDURE usp_Product_Search
(
    @SearchTerm NVARCHAR(100),
    @CategoryId INT = NULL,
    @BrandId INT = NULL,
    @PageNumber INT = 1
)
AS
BEGIN
    SET NOCOUNT ON;

    SET @SearchTerm = LTRIM(RTRIM(@SearchTerm));

    IF @SearchTerm IS NULL OR @SearchTerm = ''
    BEGIN
        RAISERROR('Search term cannot be empty.', 16, 1);
        RETURN;
    END

    IF @PageNumber < 1
        SET @PageNumber = 1;

    DECLARE @PageSize INT = 12;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    ---------------------------------------------------------
    -- Search Results
    ---------------------------------------------------------
    SELECT
        p.ProductId,
        p.CategoryId,
        c.Name AS CategoryName,
        p.SKU,
        p.Name,
        p.ImageUrl,
        p.BrandId,
        b.Name AS BrandName
    FROM Product p
    INNER JOIN Category c ON c.CategoryId = p.CategoryId
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    WHERE
    (
        p.Name LIKE '%' + @SearchTerm + '%'
        OR p.SKU LIKE '%' + @SearchTerm + '%'
    )
    AND ( @CategoryId IS NULL OR p.CategoryId = @CategoryId )
    AND ( @BrandId IS NULL OR p.BrandId = @BrandId )
    ORDER BY
        p.Name ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    ---------------------------------------------------------
    -- Total matching rows (for pagination)
    ---------------------------------------------------------
    SELECT
        COUNT(*) AS TotalCount
    FROM Product p
    WHERE
    (
        p.Name LIKE '%' + @SearchTerm + '%'
        OR p.SKU LIKE '%' + @SearchTerm + '%'
    )
    AND ( @CategoryId IS NULL OR p.CategoryId = @CategoryId )
    AND ( @BrandId IS NULL OR p.BrandId = @BrandId );
END
GO

-- Faceted product filter (used by the Memory-page RAM/SSD filters). Each
-- optional criterion is an INDEPENDENT substring match on the product name, so
-- the filters combine with true AND regardless of word order (unlike the
-- ordered single-substring search).
--   @Capacity uses a [^0-9.] guard so e.g. '4GB' doesn't match '64GB' and
--             '2TB' doesn't match '3.2TB'/'1.92TB'.
--   @Term1/@Term2 are free tokens (memory standard + form factor, or SSD
--             interface), plain substring matches.
--   @SsdOnly = 1 restricts to solid-state drives (name has 'SSD' or
--             'Solid State Drive'), so SAS/SATA HDDs are excluded.
--   @HddOnly = 1 restricts to spinning/hybrid hard drives (name has 'HDD',
--             'Hard Drive', or 'SSHD'), so SSDs are excluded.
CREATE OR ALTER PROCEDURE usp_Product_Filter
    @CategoryId  INT           = NULL,
    @BrandId     INT           = NULL,
    @Capacity    NVARCHAR(20)  = NULL,
    @Term1       NVARCHAR(60)  = NULL,
    @Term2       NVARCHAR(60)  = NULL,
    @SsdOnly     BIT           = 0,
    @HddOnly     BIT           = 0,
    @PageNumber  INT           = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber < 1 SET @PageNumber = 1;
    DECLARE @PageSize INT = 12;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT p.ProductId, p.CategoryId, c.Name AS CategoryName, p.SKU, p.Name, p.ImageUrl,
           p.BrandId, b.Name AS BrandName
    FROM Product p
    INNER JOIN Category c ON c.CategoryId = p.CategoryId
    INNER JOIN Brand b ON b.BrandId = p.BrandId
    WHERE ( @CategoryId IS NULL OR p.CategoryId = @CategoryId )
      AND ( @BrandId    IS NULL OR p.BrandId = @BrandId )
      AND ( @Capacity   IS NULL OR p.Name LIKE '%[^0-9.]' + @Capacity + '%' )
      AND ( @Term1      IS NULL OR p.Name LIKE '%' + @Term1 + '%' )
      AND ( @Term2      IS NULL OR p.Name LIKE '%' + @Term2 + '%' )
      AND ( @SsdOnly = 0 OR p.Name LIKE '%SSD%' OR p.Name LIKE '%Solid State Drive%' )
      AND ( @HddOnly = 0 OR p.Name LIKE '%HDD%' OR p.Name LIKE '%Hard Drive%' OR p.Name LIKE '%SSHD%' )
    ORDER BY p.Name ASC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount
    FROM Product p
    WHERE ( @CategoryId IS NULL OR p.CategoryId = @CategoryId )
      AND ( @BrandId    IS NULL OR p.BrandId = @BrandId )
      AND ( @Capacity   IS NULL OR p.Name LIKE '%[^0-9.]' + @Capacity + '%' )
      AND ( @Term1      IS NULL OR p.Name LIKE '%' + @Term1 + '%' )
      AND ( @Term2      IS NULL OR p.Name LIKE '%' + @Term2 + '%' )
      AND ( @SsdOnly = 0 OR p.Name LIKE '%SSD%' OR p.Name LIKE '%Solid State Drive%' )
      AND ( @HddOnly = 0 OR p.Name LIKE '%HDD%' OR p.Name LIKE '%Hard Drive%' OR p.Name LIKE '%SSHD%' );
END
GO
