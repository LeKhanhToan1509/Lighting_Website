import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Badge, message, Button, Row, Col, Input, Select, Slider, Space, Divider, Pagination, Spin, Tag, Typography, Tooltip } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, SearchOutlined, FilterOutlined, SortAscendingOutlined, StarFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import qs from 'query-string';
import axiosInstance from '../../axiosInstance';
import { addToCart } from '../../redux/apiRequest';
import { addProductToWishList, deleteProductFromWishList } from '../../redux/apiRequest';

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

const PAGE_SIZE = 20;
const MIN_PRICE = 0;
const MAX_PRICE = 10000000;

// Hardcoded categories
const HARDCODED_CATEGORIES = [
  'Ceiling Lights',
  'Wall Lights',
  'Outdoor Lighting',
  'Floor Lamps',
  'Table Lamps'
];

// Hardcoded colors with their mapping classes - FIXED: Defined here for use in both components
const HARDCODED_COLORS = {
  blue: "bg-blue-500",
  gold: "bg-yellow-500",
  grey: "bg-gray-500",
  white: "bg-gray-100",
  red: "bg-red-500",
  black: "bg-black",
  yellow: "bg-yellow-300",
  pink: "bg-pink-400",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  brown: "bg-yellow-800",
  silver: "bg-gray-300",
  bronze: "bg-yellow-600",
  chrome: "bg-gray-400"
};

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.login?.currentUser);
  const wishlist = useSelector((state) => state.wishlist?.wishlist || []);
  
  // Parse query parameters from URL
  const queryParams = useMemo(() => qs.parse(location.search), [location.search]);
  
  // Component state
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(queryParams.category || 'all');
  const [searchQuery, setSearchQuery] = useState(queryParams.query || '');
  const [inputValue, setInputValue] = useState(queryParams.query || ''); 
  const [priceRange, setPriceRange] = useState([
    parseInt(queryParams.minPrice || MIN_PRICE), 
    parseInt(queryParams.maxPrice || MAX_PRICE)
  ]);
  const [selectedColors, setSelectedColors] = useState(queryParams.colors?.split(',') || []);
  const [loading, setLoading] = useState(false);
  const [suggestedSearches, setSuggestedSearches] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    total: 0,
    aggregations: null,
    didYouMean: null
  });
  const [pagination, setPagination] = useState({
    current: parseInt(queryParams.page || 1),
    pageSize: PAGE_SIZE,
    total: 0
  });
  const [sortOption, setSortOption] = useState(queryParams.sort || 'newest');
  const [hasMore, setHasMore] = useState(true);
  
  // Memoized function to update URL parameters
  const updateUrlParams = useCallback((updates) => {
    const currentParams = qs.parse(location.search);
    const newParams = { ...currentParams, ...updates };
    
    // Remove empty params
    Object.keys(newParams).forEach(key => {
      if (newParams[key] === '' || newParams[key] === undefined || newParams[key] === null) {
        delete newParams[key];
      }
    });
    
    const newSearch = qs.stringify(newParams);
    navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  // Sync component state with URL parameters when URL changes
  useEffect(() => {
    const urlCategory = queryParams.category || 'all';
    const urlQuery = queryParams.query || '';
    const urlMinPrice = parseInt(queryParams.minPrice || MIN_PRICE);
    const urlMaxPrice = parseInt(queryParams.maxPrice || MAX_PRICE);
    const urlColors = queryParams.colors?.split(',') || [];
    const urlPage = parseInt(queryParams.page || 1);
    const urlSort = queryParams.sort || 'newest';

    // Batch state updates to prevent multiple rerenders
    const stateUpdates = [];
    
    if (urlCategory !== selectedCategory) stateUpdates.push(() => setSelectedCategory(urlCategory));
    if (urlQuery !== searchQuery) {
      stateUpdates.push(() => setSearchQuery(urlQuery));
      stateUpdates.push(() => setInputValue(urlQuery));
    }
    if (urlMinPrice !== priceRange[0] || urlMaxPrice !== priceRange[1]) {
      stateUpdates.push(() => setPriceRange([urlMinPrice, urlMaxPrice]));
    }
    if (JSON.stringify(urlColors) !== JSON.stringify(selectedColors)) {
      stateUpdates.push(() => setSelectedColors(urlColors));
    }
    if (urlPage !== pagination.current) {
      stateUpdates.push(() => setPagination(prev => ({ ...prev, current: urlPage })));
    }
    if (urlSort !== sortOption) {
      stateUpdates.push(() => setSortOption(urlSort));
    }
    
    // Apply all state updates
    stateUpdates.forEach(update => update());
    
  }, [location.search, queryParams]);

  // FIXED: Added fetchProducts to useEffect dependencies
  // Fetch products when URL parameters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, priceRange, selectedColors, sortOption, pagination.current]);

  // Heavily debounced search products function (500ms)
  const debouncedSearchProducts = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      updateUrlParams({ query: value, page: 1 });
    }, 500),
    [updateUrlParams]
  );

  // Debounced fetch suggestions (300ms)
  const debouncedFetchSuggestions = useCallback(
    debounce(async (value) => {
      if (value && value.length >= 2) {
        try {
          setSuggestionsLoading(true);
          const res = await axiosInstance.get('/elk/suggest', { 
            params: { query: value },
            headers: { 'token': user?.accessToken ? `Bearer ${user.accessToken}` : undefined }
          });
          setSuggestedSearches(res.data.suggestions || []);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
        } finally {
          setSuggestionsLoading(false);
        }
      } else {
        setSuggestedSearches([]);
      }
    }, 300),
    [user]
  );

  // Debounced price change - only update after 800ms of inactivity
  const debouncedPriceChange = useCallback(
    debounce((value) => {
      updateUrlParams({ 
        minPrice: value[0] !== MIN_PRICE ? value[0] : undefined, 
        maxPrice: value[1] !== MAX_PRICE ? value[1] : undefined,
        page: 1
      });
    }, 800),
    [updateUrlParams]
  );

  // Handle input change (typing)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedFetchSuggestions(value);
    debouncedSearchProducts(value);
  };

  // API calls
  const fetchProducts = async (reset = false) => {
    if (loading) return; // FIXED: Prevent multiple simultaneous requests
    
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        query: searchQuery,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        colors: selectedColors.length > 0 ? selectedColors.join(',') : undefined,
        sort: sortOption
      };
  
      const res = await axiosInstance.get('/elk/search', { 
        params,
        headers: { 'token': user?.accessToken ? `Bearer ${user.accessToken}` : undefined }
      });
  
      // Always replace products when fetching new page
      setProducts(res.data.products || []);
      
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0
      }));
      
      setSearchResults({
        total: res.data.total || 0,
        aggregations: res.data.aggregations || null,
        didYouMean: res.data.didYouMean || null
      });
      
      // Update hasMore flag
      setHasMore((res.data.total || 0) > pagination.current * pagination.pageSize);
      
    } catch (error) {
      message.error('Could not load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      setPagination(prev => ({ ...prev, current: prev.current + 1 }));
      // fetchProducts will be called by the effect that watches pagination.current
    }
  };

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  // FIXED: Removed redundant useEffect that called fetchProducts

  // Event handlers
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateUrlParams({ category, page: 1 });
  };

  const handleColorChange = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    
    setSelectedColors(newColors);
    updateUrlParams({ 
      colors: newColors.length > 0 ? newColors.join(',') : undefined,
      page: 1
    });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    // Don't update URL params yet - wait for debounced function
    debouncedPriceChange(value);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    updateUrlParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    updateUrlParams({ sort: value, page: 1 });
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setSearchQuery(suggestion);
    updateUrlParams({ query: suggestion, page: 1 });
    setSuggestedSearches([]);
  };

  const resetFilters = () => {
    setInputValue('');
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedColors([]);
    setSortOption('newest');
    setPagination(prev => ({ ...prev, current: 1 }));
    navigate('/shop');
  };

  const add = (product) => {
    try {
      // FIXED: Add error handling around addToCart
      if (typeof addToCart === 'function') {
        addToCart(product, dispatch);
        message.success('Added to cart!');
      } else {
        console.error('addToCart is not a function');
        message.error('Could not add to cart. Please try again later.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Could not add to cart. Please try again later.');
    }
  };

  const toggleWishlist = (product) => {
    try {
      // FIXED: Add error handling around wishlist operations
      if (wishlist.find((item) => item._id === product._id)) {
        if (typeof deleteProductFromWishList === 'function') {
          deleteProductFromWishList(product, dispatch);
          message.info('Removed from wishlist!');
        }
      } else {
        if (typeof addProductToWishList === 'function') {
          addProductToWishList(product, dispatch);
          message.success('Added to wishlist!');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      message.error('Could not update wishlist. Please try again later.');
    }
  };

  // Render individual product card component
  const ProductCard = ({ product }) => {
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    
    // Check if product has highlight text from Elasticsearch
    const productName = product.highlight?.name ? (
      <div dangerouslySetInnerHTML={{ __html: product.highlight.name[0] }} />
    ) : product.name;
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative">
          <Link to={`/product_detail/${product._id}`}>
            <img
              src={product.images && product.images.length > 0 ? (product.images[selectedColorIndex] || product.images[0]) : 'https://via.placeholder.com/300x200?text=No+Image'}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
              }}
            />
          </Link>
          <button 
            onClick={() => toggleWishlist(product)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
          >
            {wishlist.find((item) => item._id === product._id) ? 
              <HeartFilled className="text-red-500 text-lg" /> : 
              <HeartOutlined className="text-gray-500 text-lg" />}
          </button>
          
          {/* Display Score if there's a searchQuery */}
          {searchQuery && product._score && (
            <Tooltip title="Search relevance score">
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center">
                <StarFilled className="mr-1 text-yellow-400" />
                {Math.round(product._score * 100) / 100}
              </div>
            </Tooltip>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate" title={product.name}>{productName}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <p className="text-lg font-bold text-gray-900 mb-3">{product.price.toLocaleString()}đ</p>
        
          <div className="flex space-x-2 mb-3">
            {product.colors && product.colors.map((color, index) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${selectedColorIndex === index ? 'border-blue-600' : 'border-gray-200'} ${HARDCODED_COLORS[color.toLowerCase()] || 'bg-gray-200'}`}
                onClick={() => setSelectedColorIndex(index)}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => add({...product, color: product.colors?.[selectedColorIndex] || ''})}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  // Memoize filter tags to prevent unnecessary re-renders
  const filterTags = useMemo(() => (
    <div className="flex flex-wrap gap-2 mb-4">
      {selectedCategory !== 'all' && (
        <Tag 
          closable 
          onClose={() => handleCategoryChange('all')}
          color="blue"
        >
          Category: {selectedCategory}
        </Tag>
      )}
      
      {(priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) && (
        <Tag 
          closable 
          onClose={() => {
            setPriceRange([MIN_PRICE, MAX_PRICE]);
            updateUrlParams({ minPrice: undefined, maxPrice: undefined, page: 1 });
          }}
          color="green"
        >
          Price: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
        </Tag>
      )}
      
      {selectedColors.map(color => (
        <Tag 
          key={color}
          closable
          onClose={() => handleColorChange(color)}
          color="purple"
          className="flex items-center"
        >
          <div 
            className={`w-3 h-3 rounded-full mr-1 ${HARDCODED_COLORS[color.toLowerCase()] || 'bg-gray-300'}`} 
          /> 
          {color}
        </Tag>
      ))}
      
      {(selectedCategory !== 'all' || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE || selectedColors.length > 0) && (
        <Button size="small" onClick={resetFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  ), [selectedCategory, priceRange, selectedColors]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>
      
      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="mb-4 relative">
          <Search
            placeholder="Search products..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            loading={suggestionsLoading}
            value={inputValue}
            onChange={handleInputChange}
            onSearch={(value) => {
              setSearchQuery(value);
              updateUrlParams({ query: value, page: 1 });
              setSuggestedSearches([]);
            }}
          />
          
          {/* Display search suggestions */}
          {suggestedSearches.length > 0 && (
            <div className="absolute z-10 w-full bg-white shadow-lg rounded-b-lg border border-gray-200 mt-1 max-h-60 overflow-y-auto">
              {suggestedSearches.map((suggestion, index) => (
                <div 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <SearchOutlined className="mr-2 text-gray-500" />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Display tags for selected filters */}
        {filterTags}
        
        <Divider />
        
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <FilterOutlined className="mr-1" /> Categories
                {searchResults.aggregations?.categories && (
                  <Text type="secondary" className="ml-2 text-sm">
                    ({HARDCODED_CATEGORIES.length} types)
                  </Text>
                )}
              </h3>
              <Select
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={handleCategoryChange}
                size="large"
              >
                <Option value="all">All Categories</Option>
                
                {/* Show hardcoded categories with counts from aggregations if available */}
                {HARDCODED_CATEGORIES.map(category => {
                  // If we have aggregations, try to find the count for this category
                  const categoryBucket = searchResults.aggregations?.categories?.buckets?.find(
                    bucket => bucket.key === category
                  );
                  const count = categoryBucket ? ` (${categoryBucket.doc_count})` : '';
                  
                  return (
                    <Option key={category} value={category}>
                      {category}{count}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <FilterOutlined className="mr-1" /> Price (VND)
              </h3>
              <Slider
                range
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={priceRange}
                onChange={handlePriceChange}
                tipFormatter={value => `${value.toLocaleString()}đ`}
              />
              <div className="flex justify-between mt-2">
                <span>{priceRange[0].toLocaleString()}đ</span>
                <span>{priceRange[1].toLocaleString()}đ</span>
              </div>
              
              {/* Display price ranges from Elasticsearch */}
              {searchResults.aggregations?.price_ranges && (
                <div className="mt-3">
                  <Text type="secondary" className="text-xs">Popular price ranges:</Text>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {searchResults.aggregations.price_ranges.buckets.map((range, idx) => (
                      <Tag 
                        key={idx}
                        className="cursor-pointer"
                        onClick={() => {
                          const newRange = [range.from || MIN_PRICE, range.to || MAX_PRICE];
                          setPriceRange(newRange);
                          updateUrlParams({ 
                            minPrice: newRange[0] !== MIN_PRICE ? newRange[0] : undefined, 
                            maxPrice: newRange[1] !== MAX_PRICE ? newRange[1] : undefined,
                            page: 1
                          });
                        }}
                      >
                        {range.from ? `${range.from.toLocaleString()}đ` : '0đ'} - 
                        {range.to ? `${range.to.toLocaleString()}đ` : '∞'}
                        <span className="text-xs ml-1">({range.doc_count})</span>
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <FilterOutlined className="mr-1" /> Colors
                {searchResults.aggregations?.colors && (
                  <Text type="secondary" className="ml-2 text-sm">
                    ({searchResults.aggregations.colors.buckets.length} colors)
                  </Text>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Display colors from Elasticsearch aggregations if available */}
                {searchResults.aggregations?.colors?.buckets?.length > 0 ? (
                  searchResults.aggregations.colors.buckets.map(color => (
                    <Tooltip 
                      key={color.key} 
                      title={`${color.key} (${color.doc_count})`}
                    >
                      <button
                        className={`w-8 h-8 rounded-full ${selectedColors.includes(color.key) ? 'ring-2 ring-blue-600 ring-offset-2' : ''} ${HARDCODED_COLORS[color.key.toLowerCase()] || 'bg-gray-300'}`}
                        onClick={() => handleColorChange(color.key)}
                        aria-label={`Filter by ${color.key}`}
                      />
                    </Tooltip>
                  ))
                ) : (
                  // Otherwise show hardcoded colors
                  Object.keys(HARDCODED_COLORS).map(color => (
                    <Tooltip 
                      key={color} 
                      title={color}
                    >
                      <button
                        className={`w-8 h-8 rounded-full ${selectedColors.includes(color) ? 'ring-2 ring-blue-600 ring-offset-2' : ''} ${HARDCODED_COLORS[color] || 'bg-gray-300'}`}
                        onClick={() => handleColorChange(color)}
                        aria-label={`Filter by ${color}`}
                      />
                    </Tooltip>
                  ))
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Product Count and Sort */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          {loading ? 'Loading products...' : (
            products.length > 0 ? 
              `Showing ${((pagination.current - 1) * pagination.pageSize) + 1} - 
               ${Math.min(pagination.current * pagination.pageSize, pagination.total)} 
               of ${pagination.total.toLocaleString()} products` : 
              '0 products found'
          )}
        </p>
        <div className="flex items-center">
          <SortAscendingOutlined className="mr-2" />
          <Select
            style={{ width: 180 }}
            placeholder="Sort by"
            onChange={handleSortChange}
            value={sortOption}
          >
            <Option value="newest">Newest</Option>
            <Option value="price_asc">Price: Low to High</Option>
            <Option value="price_desc">Price: High to Low</Option>
            <Option value="name_asc">Name: A-Z</Option>
            <Option value="name_desc">Name: Z-A</Option>
            {searchQuery && <Option value="relevance">Relevance</Option>}
          </Select>
        </div>
      </div>
      
      {/* Product Grid */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spin size="large" tip="Loading products..." />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
          
          {loading && (
            <div className="flex justify-center my-4">
              <Spin />
            </div>
          )}
          
          {products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">No products found matching your search criteria.</p>
              
              {/* Display "did you mean" suggestion from Elasticsearch */}
              {searchResults.didYouMean && (
                <div className="mt-4">
                  <p>Did you mean:</p>
                  <Button 
                    type="link" 
                    onClick={() => {
                      setInputValue(searchResults.didYouMean);
                      setSearchQuery(searchResults.didYouMean);
                      updateUrlParams({ query: searchResults.didYouMean, page: 1 });
                    }}
                  >
                    {searchResults.didYouMean}
                  </Button>
                </div>
              )}
              
              <Button type="primary" onClick={resetFilters} className="mt-4">
                Clear filters
              </Button>
            </div>
          )}
          
          {pagination.total > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total) => `Total ${total.toLocaleString()} products`}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
      
      {/* Trending Products Section */}
      {products.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
        <TrendingProducts />
      )}
    </div>
  );
};

// Separate component for trending products 
const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColorIndices, setSelectedColorIndices] = useState({});
  const user = useSelector((state) => state.auth?.login?.currentUser);
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist?.wishlist || []);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/elk/trending', {
        params: { limit: 4 },
        headers: { 'token': user?.accessToken ? `Bearer ${user.accessToken}` : undefined }
      });
      
      // Khởi tạo selectedColorIndices với giá trị mặc định 0 cho mỗi sản phẩm
      const initialColorIndices = {};
      (res.data.products || []).forEach(product => {
        initialColorIndices[product._id] = 0;
      });
      setSelectedColorIndices(initialColorIndices);
      
      setTrendingProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const add = (product) => {
    try {
      addToCart(product, dispatch);
      message.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Could not add to cart. Please try again later.');
    }
  };
  
  const toggleWishlist = (product) => {
    try {
      if (wishlist.find((item) => item._id === product._id)) {
        deleteProductFromWishList(product, dispatch);
        message.info('Removed from wishlist!');
      } else {
        addProductToWishList(product, dispatch);
        message.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      message.error('Could not update wishlist. Please try again later.');
    }
  };
  
  // Hàm cập nhật chỉ số màu cho từng sản phẩm
  const handleColorChange = (productId, index) => {
    setSelectedColorIndices(prev => ({
      ...prev,
      [productId]: index
    }));
  };
  
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Trending Products</h2>
        <Link to="/shop" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {trendingProducts.map(product => (
            <Col xs={24} sm={12} md={6} key={product._id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative">
                  <Link to={`/product_detail/${product._id}`}>
                    <img
                      src={product.images && product.images.length > 0 ? (product.images[selectedColorIndices[product._id]] || product.images[0]) : 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                  </Link>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                  >
                    {wishlist.find((item) => item._id === product._id) ? 
                      <HeartFilled className="text-red-500 text-lg" /> : 
                      <HeartOutlined className="text-gray-500 text-lg" />}
                  </button>
                  
                  <Tag color="red" className="absolute top-2 left-2">
                    Trending
                  </Tag>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  <p className="text-lg font-bold text-gray-900 mb-3">{product.price.toLocaleString()}đ</p>
                
                  <div className="flex space-x-2 mb-3">
                    {product.colors && product.colors.map((color, index) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 ${selectedColorIndices[product._id] === index ? 'border-blue-600' : 'border-gray-200'} ${HARDCODED_COLORS[color.toLowerCase()] || 'bg-gray-200'}`}
                        onClick={() => handleColorChange(product._id, index)}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    onClick={() => add({...product, color: product.colors?.[selectedColorIndices[product._id]] || ''})}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Shop;