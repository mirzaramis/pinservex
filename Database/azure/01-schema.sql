/* ============================================================
   HardwareStore â€” canonical schema (fresh-install DDL)
   Consolidated from: original schema + 01_create_brand_table.sql
                       + 02_alter_product_add_brand.sql (folded in as
                         NOT NULL from creation, since this is not a
                         migration against an existing populated table)
   ============================================================ */

GO

GO

IF OBJECT_ID('Product', 'U') IS NOT NULL DROP TABLE Product;
IF OBJECT_ID('Category', 'U') IS NOT NULL DROP TABLE Category;
IF OBJECT_ID('Brand', 'U') IS NOT NULL DROP TABLE Brand;
GO

CREATE TABLE Category
(
    CategoryId INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE Brand
(
    BrandId INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Tier NVARCHAR(20) NOT NULL  -- 'SILICON' (chip/component designer) or 'OEM' (finished-product manufacturer)
);
GO

CREATE TABLE Product
(
    ProductId BIGINT PRIMARY KEY,
    CategoryId INT NOT NULL,
    BrandId INT NOT NULL,
    SKU NVARCHAR(100) NOT NULL,
    Name NVARCHAR(500) NOT NULL,
    ImageUrl NVARCHAR(MAX) NOT NULL,

    CONSTRAINT FK_Product_Category
        FOREIGN KEY (CategoryId)
        REFERENCES Category(CategoryId),

    CONSTRAINT FK_Product_Brand
        FOREIGN KEY (BrandId)
        REFERENCES Brand(BrandId)
);
GO

-- Covers usp_Product_GetByCategory / usp_Product_Search (category-filtered path).
-- BrandId included because every SP selects it alongside these columns --
-- without it, this index stops being covering and forces a key lookup per row.
CREATE NONCLUSTERED INDEX IX_Product_CategoryId
    ON Product (CategoryId)
    INCLUDE (Name, SKU, ImageUrl, BrandId);
GO

-- Covers usp_Product_GetByBrand (brand-filtered path).
CREATE NONCLUSTERED INDEX IX_Product_BrandId
    ON Product (BrandId)
    INCLUDE (Name, SKU, ImageUrl, CategoryId);
GO
