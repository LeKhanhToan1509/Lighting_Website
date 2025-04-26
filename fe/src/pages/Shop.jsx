import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import Slider from '../components/ui/slider';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';

const Shop = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [tempPriceRange, setTempPriceRange] = useState([0, 10000000]);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Danh sách màu sắc cứng
    const availableColors = [
        { name: 'Đỏ', count: 42, hex: '#FF0000' },
        { name: 'Xanh lá', count: 36, hex: '#00FF00' },
        { name: 'Xanh dương', count: 28, hex: '#0000FF' },
        { name: 'Vàng', count: 24, hex: '#FFFF00' },
        { name: 'Đen', count: 56, hex: '#000000' },
        { name: 'Trắng', count: 48, hex: '#FFFFFF' },
        { name: 'Hồng', count: 18, hex: '#FFC0CB' },
        { name: 'Tím', count: 22, hex: '#800080' },
        { name: 'Cam', count: 15, hex: '#FFA500' },
        { name: 'Xám', count: 31, hex: '#808080' },
        { name: 'Nâu', count: 20, hex: '#A52A2A' },
        { name: 'Bạc', count: 12, hex: '#C0C0C0' }
    ];

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((term) => {
            setDebouncedTerm(term);
            setCurrentPage(1); // Reset page when search changes
            if (term.length > 0) {
                fetchSuggestions(term);
            } else {
                setSuggestions([]);
            }
        }, 500),
        []
    );

    // Handle search input
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
        setShowSuggestions(value.length > 0);
    }, [debouncedSearch]);

    // Fetch search suggestions
    const fetchSuggestions = async (query) => {
        if (query.length < 2) return;
        
        try {
            const response = await axios.get(`/elk/suggest?query=${encodeURIComponent(query)}`);
            setSuggestions(response.data.suggestions || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    // Apply suggestion
    const applySuggestion = useCallback((suggestion) => {
        setSearchTerm(suggestion);
        setDebouncedTerm(suggestion);
        setShowSuggestions(false);
        setCurrentPage(1);
    }, []);

    // Debounced price range function
    const debouncedPriceRange = useCallback(
        debounce((newRange) => {
            setPriceRange(newRange);
            setCurrentPage(1); // Reset page when price changes
        }, 500),
        []
    );

    // Handle price range change
    const handlePriceRangeChange = useCallback((newRange) => {
        setTempPriceRange(newRange);
        debouncedPriceRange(newRange);
    }, [debouncedPriceRange]);

    // Handle category change
    const handleCategoryChange = useCallback((category) => {
        setSelectedCategory(category);
        setCurrentPage(1); // Reset page when category changes
    }, []);

    // Handle color selection
    const handleColorChange = useCallback((color) => {
        setSelectedColors(prev => {
            const newColors = prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color];
            return newColors;
        });
        setCurrentPage(1); // Reset page when colors change
    }, []);

    // Handle sort change
    const handleSortChange = useCallback((sort) => {
        setSortBy(sort);
        setCurrentPage(1); // Reset page when sort changes
    }, []);

    // Fetch products with memoized dependencies
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                query: debouncedTerm,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                sort: sortBy,
                ...(selectedCategory && { category: selectedCategory }),
                ...(selectedColors.length > 0 && { colors: selectedColors.join(',') })
            });

            const response = await axios.get(`/elk/search?${params}`);
            const { products, total, pages, suggestions: searchSuggestions = [] } = response.data;

            setProductList(products);
            setTotalPages(pages);
            setTotalProducts(total);

            // Show search suggestions if available
            if (searchSuggestions && searchSuggestions.length > 0 && products.length < 5) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        Không tìm thấy đủ kết quả
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Bạn có thể thử tìm:
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {searchSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    applySuggestion(suggestion);
                                                    toast.dismiss(t.id);
                                                }}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                ), { duration: 5000 });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response && error.response.status === 400 && error.response.data.message.includes('Pagination limit')) {
                toast.error('Đã đạt đến giới hạn phân trang. Hãy sử dụng các bộ lọc để thu hẹp kết quả.', {
                    duration: 5000
                });
                
                // Reset to page 1
                setCurrentPage(1);
            } else {
                toast.error('Có lỗi xảy ra khi tìm kiếm sản phẩm.', {
                    duration: 3000
                });
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedTerm, priceRange, sortBy, selectedCategory, selectedColors, applySuggestion]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get('/elk/categories');
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle click outside suggestions
    useEffect(() => {
        const handleClickOutside = () => {
            setShowSuggestions(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Memoize category options
    const categoryOptions = useMemo(() => {
        return categories.map(cat => ({
            value: cat.name,
            label: `${cat.name} (${cat.count})`,
        }));
    }, [categories]);

    // Handle pagination
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [totalPages]);

    // Generate pagination range
    const getPaginationRange = useCallback(() => {
        const maxButtons = 5;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    const paginationRange = useMemo(() => getPaginationRange(), [getPaginationRange]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search input with suggestions */}
            <div className="mb-6 relative">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSuggestions(searchTerm.length > 0);
                        }}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                
                {/* Search suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    applySuggestion(suggestion);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Filters sidebar */}
                <div className="space-y-6 bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="font-semibold text-lg border-b pb-2">Bộ lọc</h3>
                    
                    {/* Categories */}
                    <div>
                        <h4 className="font-medium mb-2">Danh mục</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={!selectedCategory}
                                    onChange={() => handleCategoryChange('')}
                                    className="form-radio text-blue-600"
                                />
                                <span>Tất cả</span>
                            </label>
                            {categoryOptions.map(({ value, label }) => (
                                <label key={value} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={selectedCategory === value}
                                        onChange={() => handleCategoryChange(value)}
                                        className="form-radio text-blue-600"
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <h4 className="font-medium mb-2">Màu sắc</h4>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {availableColors.map(({ name, count, hex }) => (
                                <button
                                    key={name}
                                    onClick={() => handleColorChange(name)}
                                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                        selectedColors.includes(name)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    <span 
                                        className="w-3 h-3 rounded-full inline-block" 
                                        style={{ backgroundColor: hex }}
                                    ></span>
                                    {name} ({count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h4 className="font-medium mb-2">Khoảng giá</h4>
                        <Slider
                            range
                            min={0}
                            max={10000000}
                            value={tempPriceRange}
                            onChange={handlePriceRangeChange}
                            tooltip={{
                                formatter: (value) => `${value.toLocaleString()}đ`
                            }}
                        />
                        <div className="flex justify-between text-sm mt-2">
                            <span>{tempPriceRange[0].toLocaleString()}đ</span>
                            <span>{tempPriceRange[1].toLocaleString()}đ</span>
                        </div>
                    </div>

                    {/* Sort options */}
                    <div>
                        <h4 className="font-medium mb-2">Sắp xếp theo</h4>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price_asc">Giá: Thấp đến cao</option>
                            <option value="price_desc">Giá: Cao đến thấp</option>
                            <option value="name_asc">Tên: A-Z</option>
                            <option value="name_desc">Tên: Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Products grid */}
                <div className="md:col-span-3">
                    {/* Results count */}
                    <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
                        <p className="text-gray-600">
                            Hiển thị {productList.length} trong số {totalProducts.toLocaleString()} sản phẩm
                        </p>
                        
                        <p className="text-gray-500 text-sm">
                            Trang {currentPage}/{totalPages}
                        </p>
                    </div>

                    {/* Products grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : productList.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
                            <p className="mt-1 text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productList.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Improved pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-8 space-x-1">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-2 rounded-md ${
                                            currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white hover:bg-gray-100 text-gray-700'
                                        } border`}
                                    >
                                        <span className="sr-only">Trang đầu</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-2 rounded-md ${
                                            currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white hover:bg-gray-100 text-gray-700'
                                        } border`}
                                    >
                                        <span className="sr-only">Trang trước</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {paginationRange.map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 rounded-md ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white hover:bg-gray-100 text-gray-700'
                                            } border`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-2 rounded-md ${
                                            currentPage === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white hover:bg-gray-100 text-gray-700'
                                        } border`}
                                    >
                                        <span className="sr-only">Trang tiếp</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-2 rounded-md ${
                                            currentPage === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white hover:bg-gray-100 text-gray-700'
                                        } border`}
                                    >
                                        <span className="sr-only">Trang cuối</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop; 