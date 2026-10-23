import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import ProductPickCard from '../components/ProductPickCard'
import audioBanner from '../assets/audio-banner.jpg'
import cablesBanner from '../assets/cables-banner.jpg'
import camerasBanner from '../assets/cameras-banner.jpg'
import computerAccessoriesBanner from '../assets/computer-accessories-banner.jpg'
import inputDevicesBanner from '../assets/input-devices-banner.jpg'
import memoryBanner from '../assets/memory-banner.jpg'
import monitorsBanner from '../assets/monitors-banner.jpg'
import motherboardsBanner from '../assets/motherboards-banner.jpg'
import networkAccessoriesBanner from '../assets/network-accessories-banner.jpg'
import pcServersBanner from '../assets/pc-servers-banner.jpg'
import powerEquipmentBanner from '../assets/power-equipment-banner.jpg'
import printersScannersBanner from '../assets/printers-scanners-banner.jpg'
import processorsBanner from '../assets/processors-banner.jpg'
import storageDevicesBanner from '../assets/storage-devices-banner.jpg'
import systemCoolingBanner from '../assets/system-cooling-banner.jpg'
import videoComponentsBanner from '../assets/video-components-banner.jpg'
import './ProductsPage.css'

// Per-category hero banners (keyed by category id). Categories listed here
// render an image-only hero instead of the default text hero.
const CATEGORY_BANNERS = {
  9: storageDevicesBanner,       // Storage Devices
  66: memoryBanner,              // Memory
  82: networkAccessoriesBanner,  // Network & Accessories
  109: pcServersBanner,          // PC & Servers
  124: motherboardsBanner,       // Motherboards
  136: printersScannersBanner,   // Printers & Scanners
  155: powerEquipmentBanner,     // Power Equipment
  165: processorsBanner,         // Processors
  170: videoComponentsBanner,    // Video Components
  177: inputDevicesBanner,       // Input Devices
  186: camerasBanner,            // Cameras
  191: cablesBanner,             // Cables
  195: systemCoolingBanner,      // System Cooling Parts
  202: monitorsBanner,           // Monitors
  204: computerAccessoriesBanner,// Computer Accessories
  212: audioBanner,              // Audio
}

// ── Memory-page (catId 66) extra filters ──────────────────────────────
// Each selection contributes a keyword to the product search (AND-combined
// server-side), so the filters stack. Values are the tokens that appear in
// the product names; labels are what the shopper sees.
const MEMORY_CATEGORY_ID = 66
const MEMORY_TYPES = [
  { label: 'RAM', value: 'RAM' },
  { label: 'SSD', value: 'SSD' },
]
const MEMORY_FORMS = [
  { label: 'Server Memory', value: 'RDIMM' },
  { label: 'Desktop Memory', value: 'UDIMM' },
  { label: 'Laptop Memory', value: 'SODIMM' },
]
const MEMORY_CAPACITIES = ['1TB', '512GB', '256GB', '128GB', '64GB', '32GB', '16GB', '8GB', '4GB', '2GB', '1GB']
const MEMORY_STANDARDS = [
  { label: 'DDR2-400 / PC2-3200', value: 'DDR2-400' },
  { label: 'DDR3-1066 / PC3-8500', value: 'DDR3-1066' },
  { label: 'DDR3-1333 / PC3-10600', value: 'DDR3-1333' },
  { label: 'DDR3-1600 / PC3-12800', value: 'DDR3-1600' },
  { label: 'DDR3-1866 / PC3-14900', value: 'DDR3-1866' },
  { label: 'DDR4-2133 / PC4-17000', value: 'DDR4-2133' },
  { label: 'DDR4-2400 / PC4-19200', value: 'DDR4-2400' },
  { label: 'DDR4-2666 / PC4-21300', value: 'DDR4-2666' },
  { label: 'DDR4-2933 / PC4-23400', value: 'DDR4-2933' },
  { label: 'DDR4-3200 / PC4-25600', value: 'DDR4-3200' },
  { label: 'DDR5-4800 / PC5-38400', value: 'DDR5-4800' },
  { label: 'DDR5-5600 / PC5-44800', value: 'DDR5-5600' },
  { label: 'DDR5-6000 / PC5-48000', value: 'DDR5-6000' },
  { label: 'DDR5-6400 / PC5-51200', value: 'DDR5-6400' },
  { label: 'DDR5-6800 / PC5-54400', value: 'DDR5-6800' },
]

// ── Storage Devices page (catId 9) filters ──
// Shoppers first pick a drive type (SSD or Hard Drive); the type then reveals
// its own capacity / interface (and, for hard drives, category) dropdowns.
// Values are the substrings matched against the product name server-side, so
// they use the spelling that appears in the catalog (e.g. '960GB', 'NVMe 3.0 x4').
const STORAGE_CATEGORY_ID = 9
const STORAGE_TYPES = [
  { label: 'SSD', value: 'SSD' },
  { label: 'Hard Drive', value: 'HDD' },
]
const SSD_CAPACITIES = ['61.44TB', '30.72TB', '25.6TB', '15.36TB', '12.8TB', '8TB', '7.68TB', '6.4TB', '4TB', '3.84TB', '3.2TB', '2TB', '1.92TB', '1.6TB', '1TB', '960GB', '800GB', '512GB', '500GB', '400GB', '256GB', '240GB']
const SSD_INTERFACES = [
  { label: '6Gb/s SAS', value: '6Gb/s SAS' },
  { label: '6Gb/s SATA', value: '6Gb/s SATA' },
  { label: '12Gb/s SAS', value: '12Gb/s SAS' },
  { label: '24Gb/s SAS', value: '24Gb/s SAS' },
  { label: 'PCI Express NVMe 3.0', value: 'NVMe 3.0' },
  { label: 'PCI Express NVMe 3.0 x2', value: 'NVMe 3.0 x2' },
  { label: 'PCI Express NVMe 3.0 x4', value: 'NVMe 3.0 x4' },
  { label: 'PCI Express NVMe 3.0 x8', value: 'NVMe 3.0 x8' },
  { label: 'PCI Express NVMe 4.0', value: 'NVMe 4.0' },
  { label: 'PCI Express NVMe 4.0 x4', value: 'NVMe 4.0 x4' },
  { label: 'PCI Express NVMe 4.0 x8', value: 'NVMe 4.0 x8' },
  { label: 'PCI Express NVMe 5.0', value: 'NVMe 5.0' },
  { label: 'PCI Express NVMe 5.0 x4', value: 'NVMe 5.0 x4' },
]
const HDD_CATEGORIES = [
  { label: 'Desktop Hard Drives', value: 'Desktop' },
  { label: 'Laptop Hard Drives', value: 'Laptop' },
  { label: 'Server Hard Drives', value: 'Server' },
]
const HDD_CAPACITIES = ['28TB', '27TB', '26TB', '25TB', '22TB', '20TB', '18TB', '16TB', '14TB', '12TB', '10TB', '8TB', '6TB', '5TB', '4TB', '3TB', '2TB', '1.8TB', '1.2TB', '1TB', '900GB', '600GB', '500GB', '450GB', '300GB', '250GB']
const HDD_INTERFACES = [
  { label: '6Gb/s SATA', value: '6Gb/s SATA' },
  { label: '6Gb/s SAS', value: '6Gb/s SAS' },
  { label: '12Gb/s SAS', value: '12Gb/s SAS' },
]

// ── Networking page (catId 82) sub-category filter ──
const NETWORK_CATEGORY_ID = 82
const NETWORK_CATEGORIES = [
  { label: 'Management Controller Module', value: 'Controller Module' },
  { label: 'Wireless Networking', value: 'Wireless' },
  { label: 'Network Switches', value: 'Switch' },
  { label: 'Routers', value: 'Router' },
  { label: 'VoIP Gateways', value: 'VoIP' },
  { label: 'Media Converter', value: 'Media Converter' },
  { label: 'Network Adapters', value: 'Network Adapter' },
  { label: 'Network Accessories', value: 'Accessor' },
  { label: 'Transceivers', value: 'Transceiver' },
  { label: 'Switch Module', value: 'Switch Module' },
  { label: 'Modems', value: 'Modem' },
  { label: 'Powerline Network Adapters', value: 'Powerline' },
  { label: 'Power Over Ethernet Adapters', value: 'PoE' },
  { label: 'Network Security & Firewall Devices', value: 'Firewall' },
  { label: 'IP Phones', value: 'IP Phone' },
]

const FALLBACK_PRODUCTS = [
  { id: 1, brand: 'Dell', name: 'PowerEdge R750xs', specs: '2x Xeon Silver 4310 · 64GB DDR4 · 1.2TB SAS', price: '$4,299', tag: 'Best Seller', condition: 'New' },
  { id: 2, brand: 'HPE', name: 'ProLiant DL380 Gen10', specs: '2x Xeon Gold 5218 · 128GB DDR4 · 4×960GB SSD', price: '$2,849', tag: 'Hot Deal', condition: 'Refurbished' },
  { id: 3, brand: 'Kingston', name: '64GB DDR4 ECC RAM', specs: '3200MHz · Registered DIMM · Server Grade', price: '$189', tag: 'Memory', condition: 'New' },
  { id: 4, brand: 'Intel', name: 'Xeon Gold 6326', specs: '16 Cores · 2.9GHz · 185W TDP · Ice Lake', price: '$749', tag: 'Processors', condition: 'New' },
  { id: 5, brand: 'Asus', name: 'ROG Strix Z790-E', specs: 'DDR5 · PCIe 5.0 · WiFi 6E · LGA1700', price: '$449', tag: 'Motherboards', condition: 'New' },
  { id: 6, brand: 'Cisco', name: 'Catalyst 9300-48P', specs: '48-Port PoE+ · 4x 10G Uplink · DNAC Ready', price: '$3,199', tag: 'Networking', condition: 'New' },
]

const normalize = (value) => (value || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ')

function mapProductToCard(product) {
  const id = product.id ?? product.Id
  const name = product.name ?? product.Name ?? 'Product'
  const sku = product.sku ?? product.SKU
  const category = product.categoryName ?? product.CategoryName ?? product.tag ?? ''
  const brand = product.brand ?? product.brandName ?? product.BrandName ?? ''
  const specs = product.specs ?? ''
  const price = product.price ?? null
  const image = product.imageUrl ?? product.ImageUrl ?? null
  const badge = product.condition === 'New' ? 'New' : (product.tag || category || 'In Stock')

  let specLines = []
  if (specs) {
    specLines = specs.split('·').map((line) => line.trim()).filter(Boolean)
  } else {
    if (sku) specLines.push(`SKU: ${sku}`)
    if (category) specLines.push(category)
  }

  const title = brand ? `${brand} ${name}` : name
  const fallback = (brand || name || 'P')[0]

  return {
    id,
    title,
    badge,
    specLines,
    price,
    image,
    fallback,
    to: id ? `/products/${id}` : '/products',
  }
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [categoryBrandsMap, setCategoryBrandsMap] = useState({})
  const [brandCategoriesMap, setBrandCategoriesMap] = useState({})
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const sort = 'featured'
  const pageSize = 12

  const catId = searchParams.get('catId')
  const catName = searchParams.get('cat')
  const brandId = searchParams.get('brandId')
  const searchQ = searchParams.get('q')
  const currentPage = Number(searchParams.get('page') || '1')

  // Memory-page filters (catId 66) — RAM only
  const memForm = searchParams.get('form') || ''   // RDIMM | UDIMM | SODIMM
  const memCap = searchParams.get('cap') || ''      // 64GB / 3.84TB / …
  const memStd = searchParams.get('std') || ''      // DDR4-3200, …
  const isMemoryPage = String(catId) === String(MEMORY_CATEGORY_ID)

  // Storage-Devices-page filters (catId 9)
  const stType = searchParams.get('stype') || ''    // '' (all) | SSD | HDD
  const stIface = searchParams.get('iface') || ''   // interface standard (SSD or HDD)
  const stCat = searchParams.get('hcat') || ''      // hard-drive category (Desktop/Laptop/Server)
  const isStoragePage = String(catId) === String(STORAGE_CATEGORY_ID)

  // Networking-page filter (catId 82)
  const netCat = searchParams.get('ncat') || ''
  const isNetworkPage = String(catId) === String(NETWORK_CATEGORY_ID)

  // Build the request for the faceted /filter endpoint, or null when no
  // extra filters are active (falls back to the normal category load).
  const filterRequest = useMemo(() => {
    if (isMemoryPage && (memForm || memCap || memStd)) {
      return { categoryId: MEMORY_CATEGORY_ID, capacity: memCap, term1: memStd, term2: memForm, ssdOnly: false, hddOnly: false }
    }
    if (isStoragePage && (stType || memCap || stIface || stCat)) {
      if (stType === 'HDD') {
        // Hard drive: term1 = category keyword, term2 = interface standard.
        return { categoryId: STORAGE_CATEGORY_ID, capacity: memCap, term1: stCat, term2: stIface, ssdOnly: false, hddOnly: true }
      }
      // SSD (or type-less capacity/interface): term1 = interface standard.
      return { categoryId: STORAGE_CATEGORY_ID, capacity: memCap, term1: stIface, term2: '', ssdOnly: stType === 'SSD', hddOnly: false }
    }
    if (isNetworkPage && netCat) {
      return { categoryId: NETWORK_CATEGORY_ID, capacity: '', term1: netCat, term2: '', ssdOnly: false, hddOnly: false }
    }
    return null
  }, [isMemoryPage, isStoragePage, isNetworkPage, memForm, memCap, memStd, stType, stIface, stCat, netCat])

  const filterKey = filterRequest ? JSON.stringify(filterRequest) : ''

  const activeCategory = useMemo(() => {
    if (catId) {
      return categories.find((category) => String(category.id) === String(catId)) ?? null
    }
    if (catName) {
      const normalizedName = normalize(catName)
      return categories.find((category) => {
        const categoryName = normalize(category.name)
        return categoryName === normalizedName || categoryName.includes(normalizedName) || normalizedName.includes(categoryName)
      }) ?? null
    }
    return null
  }, [categories, catId, catName])

  const activeBrand = useMemo(() => {
    if (!brandId) return null
    return brands.find((brand) => String(brand.id ?? brand.Id) === String(brandId)) ?? null
  }, [brands, brandId])

  // A category with a dedicated hero banner renders image-only (no text hero).
  const categoryBanner = activeCategory
    ? CATEGORY_BANNERS[activeCategory.id] ?? CATEGORY_BANNERS[String(activeCategory.id)] ?? null
    : null

  const categoryBrands = useMemo(() => {
    if (!activeCategory) return []
    return categoryBrandsMap[activeCategory.id] ?? categoryBrandsMap[String(activeCategory.id)] ?? []
  }, [activeCategory, categoryBrandsMap])

  // Brand dropdown options: only the brands available in the active category
  // (so each category has a unique list); fall back to all brands otherwise.
  const brandOptions = useMemo(() => {
    if (activeCategory && categoryBrands.length > 0) {
      return categoryBrands.map((brand) => ({ id: brand.id, name: brand.name }))
    }
    return brands.map((brand) => ({ id: brand.id ?? brand.Id, name: brand.name ?? brand.Name }))
  }, [activeCategory, categoryBrands, brands])

  // Categories the active brand carries products in (for the by-brand view).
  const brandCategories = useMemo(() => {
    if (!brandId) return []
    return brandCategoriesMap[brandId] ?? brandCategoriesMap[String(brandId)] ?? []
  }, [brandId, brandCategoriesMap])

  const pageTitle = searchQ
    ? `Results for "${searchQ}"`
    : activeCategory && activeBrand
      ? `${activeCategory.name} — ${activeBrand.name}`
      : activeBrand?.name
        ? `${activeBrand.name} Products`
        : activeCategory?.name ?? 'All Products'

  const pageSubtitle = searchQ
    ? 'Search results across our enterprise hardware catalog'
    : activeCategory && activeBrand
      ? `Browse ${activeBrand.name} products in ${activeCategory.name}`
      : activeBrand
        ? `Browse ${activeBrand.name} hardware from our catalog`
        : activeCategory
          ? `Browse ${activeCategory.name.toLowerCase()} from trusted brands`
          : 'Enterprise IT hardware — memory, processors, motherboards & more'

  useEffect(() => {
    let mounted = true

    const groupBrandsMap = (rows) => {
      const grouped = {}
      for (const row of rows) {
        const categoryId = row.categoryId ?? row.CategoryId
        if (!grouped[categoryId]) grouped[categoryId] = []
        grouped[categoryId].push({
          id: row.brandId ?? row.BrandId,
          name: row.brandName ?? row.BrandName,
          productCount: row.productCount ?? row.ProductCount ?? 0,
        })
      }
      return grouped
    }

    // Inverse grouping: brandId -> categories that brand has products in.
    const groupCategoriesMap = (rows) => {
      const grouped = {}
      for (const row of rows) {
        const brandId = row.brandId ?? row.BrandId
        if (!grouped[brandId]) grouped[brandId] = []
        grouped[brandId].push({
          id: row.categoryId ?? row.CategoryId,
          name: row.categoryName ?? row.CategoryName,
          productCount: row.productCount ?? row.ProductCount ?? 0,
        })
      }
      return grouped
    }

    const loadCategories = async () => {
      setCategoriesLoading(true)
      try {
        const [categoriesResponse, brandsResponse, brandsMapResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/brands`),
          fetch(`${API_BASE_URL}/api/categories/brands-map`),
        ])
        if (!categoriesResponse.ok) throw new Error('Failed to load categories')

        const categoriesData = await categoriesResponse.json()
        const brandsData = brandsResponse.ok ? await brandsResponse.json() : []
        const brandsMapData = brandsMapResponse.ok ? await brandsMapResponse.json() : []

        if (mounted) {
          const mapRows = Array.isArray(brandsMapData) ? brandsMapData : []
          setCategories(Array.isArray(categoriesData) ? categoriesData : [])
          setBrands(Array.isArray(brandsData) ? brandsData : [])
          setCategoryBrandsMap(groupBrandsMap(mapRows))
          setBrandCategoriesMap(groupCategoriesMap(mapRows))
        }
      } catch (error) {
        console.error('Unable to load categories:', error)
        if (mounted) {
          setCategories([])
          setBrands([])
          setCategoryBrandsMap({})
          setBrandCategoriesMap({})
        }
      } finally {
        if (mounted) setCategoriesLoading(false)
      }
    }

    loadCategories()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadProductsByCategoryId = async (id, pageNumber, filterBrandId) => {
      setLoadingProducts(true)
      try {
        const params = new URLSearchParams()
        params.set('pageNumber', String(pageNumber))
        if (filterBrandId) params.set('brandId', filterBrandId)

        const response = await fetch(`${API_BASE_URL}/api/categories/${id}/products?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        if (mounted) {
          const items = Array.isArray(data.items) ? data.items : []
          setProducts(items)
          setTotalCount(data.totalCount ?? data.TotalCount ?? items.length)
          setPage(pageNumber)
        }
      } catch (error) {
        console.error(error)
        if (mounted) setProducts([])
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    }

    const loadProductsByBrandId = async (id, pageNumber, filterCategoryId) => {
      setLoadingProducts(true)
      try {
        const params = new URLSearchParams()
        params.set('pageNumber', String(pageNumber))
        if (filterCategoryId) params.set('categoryId', filterCategoryId)

        const response = await fetch(`${API_BASE_URL}/api/brands/${id}/products?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        if (mounted) {
          const items = Array.isArray(data.items) ? data.items : []
          setProducts(items)
          setTotalCount(data.totalCount ?? data.TotalCount ?? items.length)
          setPage(pageNumber)
        }
      } catch (error) {
        console.error(error)
        if (mounted) setProducts([])
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    }

    const loadSearch = async (query, categoryFilterId, brandFilterId, pageNumber) => {
      setLoadingProducts(true)
      try {
        const params = new URLSearchParams()
        params.set('q', query)
        if (categoryFilterId) params.set('categoryId', categoryFilterId)
        if (brandFilterId) params.set('brandId', brandFilterId)
        params.set('pageNumber', String(pageNumber))

        const response = await fetch(`${API_BASE_URL}/api/products/search?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to search products')
        const data = await response.json()
        if (mounted) {
          const items = Array.isArray(data.items) ? data.items : []
          setProducts(items)
          setTotalCount(data.totalCount ?? data.TotalCount ?? items.length)
          setPage(pageNumber)
        }
      } catch (error) {
        console.error(error)
        if (mounted) setProducts([])
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    }

    const resolveCategoryAndLoad = async (name, pageNumber) => {
      const normalizedName = normalize(name)
      const match = categories.find((category) => {
        const categoryLabel = normalize(category.name)
        return categoryLabel === normalizedName || categoryLabel.includes(normalizedName) || normalizedName.includes(categoryLabel)
      })

      if (match) {
        await loadProductsByCategoryId(match.id, pageNumber, brandId)
      } else if (mounted) {
        setProducts([])
        setTotalCount(0)
        setPage(1)
        setLoadingProducts(false)
      }
    }

    const loadAllProducts = async (pageNumber) => {
      if (categories.length === 0) {
        if (mounted) {
          setProducts([])
          setTotalCount(0)
          setPage(1)
          setLoadingProducts(false)
        }
        return
      }

      setLoadingProducts(true)
      try {
        const responses = await Promise.all(
          categories.map(async (category) => {
            const response = await fetch(`${API_BASE_URL}/api/categories/${category.id}/products?pageNumber=1`)
            if (!response.ok) return []

            const data = await response.json()
            const items = Array.isArray(data.items) ? data.items : []

            return items.map((item) => ({
              ...item,
              categoryName: item.categoryName ?? item.CategoryName ?? category.name,
            }))
          })
        )

        const allItems = responses.flat()
        const start = (pageNumber - 1) * pageSize
        const pagedItems = allItems.slice(start, start + pageSize)

        if (mounted) {
          setProducts(pagedItems)
          setTotalCount(allItems.length)
          setPage(pageNumber)
        }
      } catch (error) {
        console.error(error)
        if (mounted) {
          setProducts(FALLBACK_PRODUCTS)
          setTotalCount(FALLBACK_PRODUCTS.length)
          setPage(1)
        }
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    }

    const loadFilter = async (req, filterBrandId, pageNumber) => {
      setLoadingProducts(true)
      try {
        const params = new URLSearchParams()
        if (req.categoryId) params.set('categoryId', String(req.categoryId))
        if (filterBrandId) params.set('brandId', filterBrandId)
        if (req.capacity) params.set('capacity', req.capacity)
        if (req.term1) params.set('term1', req.term1)
        if (req.term2) params.set('term2', req.term2)
        if (req.ssdOnly) params.set('ssdOnly', 'true')
        if (req.hddOnly) params.set('hddOnly', 'true')
        params.set('pageNumber', String(pageNumber))

        const response = await fetch(`${API_BASE_URL}/api/products/filter?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to filter products')
        const data = await response.json()
        if (mounted) {
          const items = Array.isArray(data.items) ? data.items : []
          setProducts(items)
          setTotalCount(data.totalCount ?? data.TotalCount ?? items.length)
          setPage(pageNumber)
        }
      } catch (error) {
        console.error(error)
        if (mounted) setProducts([])
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    }

    if (!searchQ && !catId && !catName && !brandId) {
      if (categories.length > 0) {
        loadAllProducts(currentPage)
      } else if (!categoriesLoading) {
        setProducts(FALLBACK_PRODUCTS)
        setTotalCount(FALLBACK_PRODUCTS.length)
        setPage(1)
        setLoadingProducts(false)
      }
      return () => { mounted = false }
    }

    if (searchQ) {
      loadSearch(searchQ, catId, brandId, currentPage)
    } else if (filterRequest) {
      // RAM / SSD / networking faceted filters → dedicated filter endpoint.
      loadFilter(filterRequest, brandId, currentPage)
    } else if (catId) {
      loadProductsByCategoryId(catId, currentPage, brandId)
    } else if (brandId) {
      loadProductsByBrandId(brandId, currentPage, null)
    } else if (catName) {
      if (categories.length > 0) {
        resolveCategoryAndLoad(catName, currentPage)
      } else if (!categoriesLoading) {
        setProducts([])
        setTotalCount(0)
        setLoadingProducts(false)
      }
    }

    return () => { mounted = false }
  }, [searchParams, categories, categoriesLoading, catId, catName, brandId, searchQ, currentPage, filterKey])

  const cardProducts = useMemo(() => products.map(mapProductToCard), [products])

  const sortedProducts = useMemo(() => {
    const list = [...cardProducts]
    if (sort === 'price-asc') {
      return list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    }
    if (sort === 'price-desc') {
      return list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    }
    if (sort === 'name') {
      return list.sort((a, b) => a.title.localeCompare(b.title))
    }
    return list
  }, [cardProducts, sort])

  const selectCategory = (category) => {
    if (!category) {
      navigate('/products')
      return
    }
    navigate(`/products?catId=${category.id}`)
  }

  const selectCategoryBrand = (category, brand) => {
    if (!brand) {
      navigate(`/products?catId=${category.id}`)
      return
    }
    navigate(`/products?catId=${category.id}&brandId=${brand.id}`)
  }

  // Global brand dropdown — filters by brand while preserving the current
  // category / search context (page resets to 1).
  const selectBrand = (nextBrandId) => {
    const params = new URLSearchParams()
    if (searchQ) params.set('q', searchQ)
    if (catId) params.set('catId', catId)
    else if (catName) params.set('cat', catName)
    if (nextBrandId) params.set('brandId', nextBrandId)
    const query = params.toString()
    navigate(query ? `/products?${query}` : '/products')
  }

  // By-brand view: narrow the current brand down to one of its categories.
  const selectBrandCategory = (nextCatId) => {
    const params = new URLSearchParams()
    if (searchQ) params.set('q', searchQ)
    if (brandId) params.set('brandId', brandId)
    if (nextCatId) params.set('catId', nextCatId)
    const query = params.toString()
    navigate(query ? `/products?${query}` : '/products')
  }

  // Set/clear one filter param, preserve the rest, reset to page 1.
  const setPageFilter = (catIdValue, key, value) => {
    const params = new URLSearchParams(searchParams)
    params.set('catId', String(catIdValue))
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    navigate(`/products?${params.toString()}`)
  }

  const setMemoryFilter = (key, value) => setPageFilter(MEMORY_CATEGORY_ID, key, value)
  const setStorageFilter = (key, value) => setPageFilter(STORAGE_CATEGORY_ID, key, value)
  const setNetworkFilter = (value) => setPageFilter(NETWORK_CATEGORY_ID, 'ncat', value)

  // Switching SSD/Hard Drive clears the type-specific sub-filters (capacity /
  // interface / category), whose option lists differ per type.
  const setStorageType = (value) => {
    const params = new URLSearchParams()
    params.set('catId', String(STORAGE_CATEGORY_ID))
    if (brandId) params.set('brandId', brandId)
    if (value) params.set('stype', value)
    navigate(`/products?${params.toString()}`)
  }

  const clearMemoryFilters = () => {
    const params = new URLSearchParams()
    params.set('catId', String(MEMORY_CATEGORY_ID))
    if (brandId) params.set('brandId', brandId)
    navigate(`/products?${params.toString()}`)
  }

  const clearStorageFilters = () => {
    const params = new URLSearchParams()
    params.set('catId', String(STORAGE_CATEGORY_ID))
    if (brandId) params.set('brandId', brandId)
    navigate(`/products?${params.toString()}`)
  }

  const hasMemoryFilters = Boolean(memForm || memCap || memStd)
  const hasStorageFilters = Boolean(stType || memCap || stIface || stCat)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="products-page">
      {categoryBanner ? (
        <div className="page-hero page-hero--banner">
          <img
            src={categoryBanner}
            alt={activeCategory.name}
            className="page-hero-banner-img"
            width={2241}
            height={388}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      ) : (
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            {activeCategory && (
              <>
                <span>/</span>
                {activeBrand ? (
                  <Link to={`/products?catId=${activeCategory.id}`}>{activeCategory.name}</Link>
                ) : (
                  <span className="bc-current">{activeCategory.name}</span>
                )}
              </>
            )}
            {activeBrand && (
              <>
                <span>/</span>
                <span className="bc-current">{activeBrand.name}</span>
              </>
            )}
            {!activeCategory && !activeBrand && !searchQ && (
              <>
                <span>/</span>
                <span className="bc-current">All Products</span>
              </>
            )}
            {searchQ && (
              <>
                <span>/</span>
                <span className="bc-current">Search</span>
              </>
            )}
          </nav>
          <h1 className="page-hero-title">{pageTitle}</h1>
          <p className="page-hero-sub">{pageSubtitle}</p>
        </div>
      </div>
      )}

      <div className="container products-layout">
        <aside className="products-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-heading">Categories</h3>
            <button
              type="button"
              className={`sidebar-link${!catId && !catName && !searchQ && !brandId ? ' active' : ''}`}
              onClick={() => selectCategory(null)}
            >
              All Products
            </button>
            {categoriesLoading && <p className="sidebar-status">Loading categories…</p>}
            {!categoriesLoading && categories.map((category) => {
              const isActive = String(activeCategory?.id) === String(category.id)
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`sidebar-link${isActive ? ' active' : ''}`}
                  onClick={() => selectCategory(category)}
                >
                  {category.name}
                </button>
              )
            })}
          </div>

          {activeCategory && categoryBrands.length > 0 && (
            <div className="sidebar-section sidebar-section-brands">
              <h3 className="sidebar-heading">Brands in {activeCategory.name}</h3>
              <div className="sidebar-brands-scroll">
                <button
                  type="button"
                  className={`sidebar-link${!brandId ? ' active' : ''}`}
                  onClick={() => selectCategoryBrand(activeCategory, null)}
                >
                  All brands
                </button>
                {categoryBrands.map((brand) => {
                  const isActive = String(brandId) === String(brand.id)
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      className={`sidebar-link sidebar-brand-link${isActive ? ' active' : ''}`}
                      onClick={() => selectCategoryBrand(activeCategory, brand)}
                    >
                      <span>{brand.name}</span>
                      <span className="sidebar-brand-count">{brand.productCount}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </aside>

        <main className="products-main">
          <div className="products-sort-bar">
            <span className="products-count">
              Showing {sortedProducts.length} of {totalCount || sortedProducts.length} products
            </span>
            <div className="products-sort-controls">
              {brandId ? (
                // Browsing by brand → let the user narrow by category.
                <select
                  className="sort-select brand-select"
                  value={catId || ''}
                  onChange={(event) => selectBrandCategory(event.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {brandCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                // Browsing by category / all → let the user narrow by brand.
                <select
                  className="sort-select brand-select"
                  value={brandId || ''}
                  onChange={(event) => selectBrand(event.target.value)}
                  aria-label="Filter by brand"
                >
                  <option value="">All Brands</option>
                  {brandOptions.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {isMemoryPage && (
            <div className="memory-filter-bar">
              <label className="memory-filter">
                <span>Memory Category</span>
                <select className="sort-select" value={memForm} onChange={(e) => setMemoryFilter('form', e.target.value)}>
                  <option value="">All</option>
                  {MEMORY_FORMS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </label>
              <label className="memory-filter">
                <span>Capacity</span>
                <select className="sort-select" value={memCap} onChange={(e) => setMemoryFilter('cap', e.target.value)}>
                  <option value="">All</option>
                  {MEMORY_CAPACITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="memory-filter">
                <span>Standard</span>
                <select className="sort-select" value={memStd} onChange={(e) => setMemoryFilter('std', e.target.value)}>
                  <option value="">All</option>
                  {MEMORY_STANDARDS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>

              {hasMemoryFilters && (
                <button type="button" className="memory-filter-clear" onClick={clearMemoryFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {isStoragePage && (
            <div className="memory-filter-bar">
              <label className="memory-filter">
                <span>Drive Type</span>
                <select className="sort-select" value={stType} onChange={(e) => setStorageType(e.target.value)}>
                  <option value="">All</option>
                  {STORAGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>

              {stType === 'SSD' && (
                <>
                  <label className="memory-filter">
                    <span>SSD by Capacity</span>
                    <select className="sort-select" value={memCap} onChange={(e) => setStorageFilter('cap', e.target.value)}>
                      <option value="">All</option>
                      {SSD_CAPACITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="memory-filter">
                    <span>SSD by Interface Standard</span>
                    <select className="sort-select" value={stIface} onChange={(e) => setStorageFilter('iface', e.target.value)}>
                      <option value="">All</option>
                      {SSD_INTERFACES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </select>
                  </label>
                </>
              )}

              {stType === 'HDD' && (
                <>
                  <label className="memory-filter">
                    <span>Hard Drive by Category</span>
                    <select className="sort-select" value={stCat} onChange={(e) => setStorageFilter('hcat', e.target.value)}>
                      <option value="">All</option>
                      {HDD_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </label>
                  <label className="memory-filter">
                    <span>Hard Drive by Capacity</span>
                    <select className="sort-select" value={memCap} onChange={(e) => setStorageFilter('cap', e.target.value)}>
                      <option value="">All</option>
                      {HDD_CAPACITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="memory-filter">
                    <span>Hard Drive by Interface Standard</span>
                    <select className="sort-select" value={stIface} onChange={(e) => setStorageFilter('iface', e.target.value)}>
                      <option value="">All</option>
                      {HDD_INTERFACES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                    </select>
                  </label>
                </>
              )}

              {hasStorageFilters && (
                <button type="button" className="memory-filter-clear" onClick={clearStorageFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {isNetworkPage && (
            <div className="memory-filter-bar">
              <label className="memory-filter">
                <span>Category</span>
                <select className="sort-select" value={netCat} onChange={(e) => setNetworkFilter(e.target.value)}>
                  <option value="">All Networking</option>
                  {NETWORK_CATEGORIES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </label>
              {netCat && (
                <button type="button" className="memory-filter-clear" onClick={() => setNetworkFilter('')}>
                  Clear filter
                </button>
              )}
            </div>
          )}

          <div className="product-pick-grid">
            {loadingProducts && <p className="products-status">Loading products…</p>}
            {!loadingProducts && sortedProducts.length === 0 && (
              <p className="products-status">No products found.</p>
            )}
            {!loadingProducts && sortedProducts.map((product) => (
              <ProductPickCard
                key={product.id || product.title}
                title={product.title}
                badge={product.badge}
                specLines={product.specLines}
                price={product.price}
                image={product.image}
                fallback={product.fallback}
                to={product.to}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="products-pagination">
              <button
                type="button"
                className="btn-outline"
                disabled={page <= 1 || loadingProducts}
                onClick={() => navigate(`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) }).toString()}`)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-primary"
                disabled={loadingProducts || page >= totalPages}
                onClick={() => navigate(`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) }).toString()}`)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function parsePrice(value) {
  if (!value) return Number.MAX_SAFE_INTEGER
  const numeric = Number(String(value).replace(/[^0-9.]/g, ''))
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER
}
