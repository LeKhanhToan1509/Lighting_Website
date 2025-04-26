import express from 'express';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();
import {redisClient} from './redisdb.js';
import Product from '../models/product.model.js';

const router = express.Router();

// Enhanced Elasticsearch client configuration
const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'txm1509'
    },
    maxRetries: 5,
    requestTimeout: 30000,
    sniffOnStart: false, // Disable sniffing to prevent connection issues
    tls: {
        rejectUnauthorized: false // Only use this in development
    }
});

let isConnected = false;
let isElasticsearchRequired = false; // Set to false to allow running without Elasticsearch

const getResponseData = (response) => {
  if (!response) return null;
  if (response.hits || response.aggregations) return response;
  if (response.body && (response.body.hits || response.body.aggregations)) return response.body;
  return null;
};

// Update index creation with proper field mappings
const createIndex = async () => {
    try {
        const indexExists = await client.indices.exists({ index: 'products' });
        if (indexExists) {
            await client.indices.delete({ index: 'products' });
            console.log('Deleted existing products index');
        }

        await client.indices.create({
            index: 'products',
            body: {
                settings: {
                    index: {
                        max_result_window: 10000, // Giới hạn hợp lý
                        number_of_shards: 5,
                        number_of_replicas: 1
                    }
                },
                mappings: {
                    properties: {
                        name: {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword',
                                    ignore_above: 256
                                }
                            }
                        },
                        name_suggest: {
                            type: 'completion',
                            analyzer: 'standard'
                        },
                        description: {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword',
                                    ignore_above: 256
                                }
                            }
                        },
                        category: {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword',
                                    ignore_above: 256
                                }
                            }
                        },
                        colors: {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword',
                                    ignore_above: 256
                                }
                            }
                        },
                        price: { type: 'double' },
                        stock: { type: 'integer' },
                        views: { type: 'integer', null_value: 0 },
                        sold: { type: 'integer', null_value: 0 },
                        status: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' },
                        deletedAt: { type: 'date' }
                    }
                }
            }
        });
        console.log('Created products index with updated mappings');
    } catch (error) {
        console.error('Error creating index:', error);
        throw error;
    }
};

const checkElasticsearchConnection = async () => {
    try {
        const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
        
        try {
            const response = await fetch(esUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('Elasticsearch server is reachable');
        } catch (error) {
            console.error('Cannot reach Elasticsearch server:', error.message);
            
            throw new Error('Elasticsearch server is not reachable');
        }

        const response = await client.ping();
        console.log('Elasticsearch ping response:', response);
        
        if (response === true || 
            (response && response.statusCode === 200) || 
            (response && response.body === true)) {
            console.log('Successfully connected to Elasticsearch');
            
            // Try to get cluster info
            try {
                const info = await client.info();
                console.log('Elasticsearch info:', info);
                const version = info.body?.version?.number || info.version?.number || 'unknown';
                console.log(`Elasticsearch version: ${version}`);
                
                // Check if the products index exists
                const indexExists = await client.indices.exists({ index: 'products' });
                console.log('Products index exists:', indexExists);
                
                if (!indexExists) {
                    console.log('Creating products index...');
                    await createIndex();
                }
            } catch (infoError) {
                console.error('Error getting Elasticsearch info:', infoError);
            }
            
            isConnected = true;
            return true;
        }
        
        console.error('Unexpected response from Elasticsearch ping:', response);
        isConnected = false;
        return false;
    } catch (error) {
        console.error('Elasticsearch connection error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        isConnected = false;
        return false;
    }
};

const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        console.log(`Connection attempt ${i + 1}/${retries}`);
        isConnected = await checkElasticsearchConnection();
        if (isConnected) {
            console.log('Successfully connected to Elasticsearch');
            break;
        }
        if (i < retries - 1) {
            const nextDelay = delay * Math.pow(2, i);
            console.log(`Retrying in ${nextDelay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, nextDelay));
        }
    }
    if (!isConnected) {
        console.error('Failed to connect to Elasticsearch after multiple retries');
        console.error('Please check if Elasticsearch is running and accessible at:', 
            process.env.ELASTICSEARCH_URL || 'http://localhost:9200');
        
        if (isElasticsearchRequired) {
            console.error('\nThe application requires Elasticsearch to be running.');
            console.error('Please follow the instructions above to start Elasticsearch.');
            process.exit(1); // Exit if Elasticsearch is required
        } else {
            console.warn('\nRunning in degraded mode without Elasticsearch.');
            console.warn('Some features may not be available.');
        }
    }
};

// Initial connection attempt
connectWithRetry();

// Middleware to check Elasticsearch connection before handling requests
const checkConnection = (req, res, next) => {
    if (!isConnected && isElasticsearchRequired) {
        console.error('Elasticsearch connection not established');
        return res.status(503).json({ 
            message: 'Service temporarily unavailable',
            error: 'Elasticsearch connection not established',
            details: 'Please check if Elasticsearch is running and accessible',
            help: 'Make sure Elasticsearch is running and the connection URL is correct in your .env file',
            instructions: [
                '1. Install Docker from https://www.docker.com/products/docker-desktop',
                '2. Run: docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:8.12.1',
                'Or download Elasticsearch from https://www.elastic.co/downloads/elasticsearch'
            ]
        });
    }
    next();
};

// Apply connection check to all routes
router.use(checkConnection);
// Get single product by ID

router.get('/elk/product/:id', async (req, res) => {
    const { id } = req.params;
  
    if (!isConnected) {
      return res.status(503).json({ 
        message: 'Elasticsearch is not available',
        error: 'Cannot retrieve product'
      });
    }
  
    try {
      const result = await client.get({
        index: 'products',
        id
      });
  
      const product = result.body?._source || result._source;
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json({ 
        ...product,
        _id: result.body?._id || result._id
      });
  
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({ 
        message: 'Error retrieving product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });
  
router.get('/elk/search', async (req, res) => {
    if (!isConnected) {
        return res.json({
            products: [],
            total: 0,
            page: parseInt(req.query.page || 1),
            pages: 0,
            aggregations: {
                categories: { buckets: [] },
                colors: { buckets: [] },
                price_stats: { min: 0, max: 0, avg: 0 }
            }
        });
    }

    const { 
        page = 1, 
        limit = 20, 
        query = '', 
        category, 
        minPrice, 
        maxPrice, 
        colors,
        sort = 'newest'
    } = req.query;

    const cacheKey = `search:${JSON.stringify({
        page, limit, query, category, minPrice, maxPrice, colors, sort
    })}`;

    try {
        // Check cache
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
            // Add cache headers
            res.set('X-Cache', 'HIT');
            return res.json(JSON.parse(cachedResults));
        }
        res.set('X-Cache', 'MISS');

        const must = [];
        const filter = [];

        if (query && query.trim() !== '') {
            must.push({
                bool: {
                    should: [
                        {
                            match_phrase_prefix: {
                                name: {
                                    query: query,
                                    boost: 10,
                                    max_expansions: 10
                                }
                            }
                        },
                        {
                            match: {
                                name: {
                                    query: query,
                                    boost: 5,
                                    fuzziness: "AUTO",
                                    prefix_length: 1
                                }
                            }
                        },
                        {
                            match: {
                                description: {
                                    query: query,
                                    fuzziness: "AUTO",
                                    prefix_length: 1
                                }
                            }
                        }
                    ],
                    minimum_should_match: 1
                }
            });
        }

        // Category filter
        if (category && category !== 'all') {
            filter.push({ term: { 'category.keyword': category } });
        }

        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceRange = { range: { price: {} } };
            if (minPrice !== undefined) priceRange.range.price.gte = Number(minPrice);
            if (maxPrice !== undefined) priceRange.range.price.lte = Number(maxPrice);
            filter.push(priceRange);
        }

        // Colors filter
        if (colors) {
            const colorList = colors.split(',');
            filter.push({ terms: { 'colors.keyword': colorList } });
        }

        // Sort configuration
        let sortOptions = [];
        switch (sort) {
            case 'price_asc':
                sortOptions = [{ price: 'asc' }];
                break;
            case 'price_desc':
                sortOptions = [{ price: 'desc' }];
                break;
            case 'name_asc':
                sortOptions = [{ 'name.keyword': 'asc' }];
                break;
            case 'name_desc':
                sortOptions = [{ 'name.keyword': 'desc' }];
                break;
            case 'newest':
            default:
                sortOptions = [{ createdAt: 'desc' }];
                break;
        }

        const pageSize = parseInt(limit);
        const currentPage = parseInt(page);
        const from = (currentPage - 1) * pageSize;

        // Add a hard limit to prevent excessive resource usage
        if (from > 10000) {
            return res.status(400).json({ 
                message: 'Pagination limit exceeded. Please refine your search.',
                suggestion: 'Try using more specific search terms or filters.'
            });
        }

        const searchParams = {
            index: 'products',
            body: {
                size: pageSize,
                from: from,
                query: {
                    bool: {
                        must,
                        filter,
                        must_not: [
                            { exists: { field: 'deletedAt' } }
                        ]
                    }
                },
                sort: sortOptions,
                _source: {
                    includes: ['name', 'price', 'description', 'category', 'colors', 'images', 'stock', 'sold', 'views', 'createdAt']
                },
                aggs: {
                    categories: {
                        terms: {
                            field: 'category.keyword',
                            size: 20
                        }
                    },
                    colors: {
                        terms: {
                            field: 'colors.keyword',
                            size: 30
                        }
                    },
                    price_stats: {
                        stats: {
                            field: 'price'
                        }
                    }
                }
            },
            track_total_hits: true
        };

        const result = await client.search(searchParams);
        const responseData = getResponseData(result);

        if (!responseData || !responseData.hits) {
            return res.status(500).json({ message: 'Invalid Elasticsearch response structure' });
        }

        const products = responseData.hits.hits.map(hit => ({
            ...hit._source,
            _id: hit._id,
            _score: hit._score
        }));

        const total = responseData.hits.total.value;
        const totalPages = Math.min(Math.ceil(total / pageSize), 500); // Limit to 500 pages

        // Add smart search suggestions if few results
        let suggestions = [];
        if (query && products.length < 5) {
            try {
                const suggestResponse = await client.search({
                    index: 'products',
                    body: {
                        suggest: {
                            text: query,
                            term_suggestions: {
                                term: {
                                    field: 'name',
                                    suggest_mode: 'popular',
                                    size: 5
                                }
                            }
                        },
                        size: 0
                    }
                });
                
                const suggestData = getResponseData(suggestResponse);
                if (suggestData?.suggest?.term_suggestions?.[0]?.options) {
                    suggestions = suggestData.suggest.term_suggestions[0].options.map(option => option.text);
                }
            } catch (suggestError) {
                console.error('Suggestion error:', suggestError);
            }
        }

        const response = {
            products,
            total,
            page: currentPage,
            pages: totalPages,
            aggregations: responseData.aggregations || {},
            suggestions: suggestions.length > 0 ? suggestions : undefined
        };

        // Cache results for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

        res.json(response);
    } catch (error) {
        console.error('Elasticsearch error:', error);
        res.status(500).json({ 
            message: 'Error searching products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Get all available colors
router.get('/elk/colors', async (req, res) => {
    if (!isConnected) {
        console.warn('Elasticsearch is not available - returning fixed colors list');
        return res.json({ 
            colors: [
                { name: 'Đỏ', count: 42 },
                { name: 'Xanh lá', count: 36 },
                { name: 'Xanh dương', count: 28 },
                { name: 'Vàng', count: 24 },
                { name: 'Đen', count: 56 },
                { name: 'Trắng', count: 48 },
                { name: 'Hồng', count: 18 },
                { name: 'Tím', count: 22 },
                { name: 'Cam', count: 15 },
                { name: 'Xám', count: 31 },
                { name: 'Nâu', count: 20 },
                { name: 'Bạc', count: 12 }
            ]
        });
    }
    
    // Trả về danh sách màu cứng thay vì query từ Elasticsearch
    res.json({ 
        colors: [
            { name: 'Đỏ', count: 42 },
            { name: 'Xanh lá', count: 36 },
            { name: 'Xanh dương', count: 28 },
            { name: 'Vàng', count: 24 },
            { name: 'Đen', count: 56 },
            { name: 'Trắng', count: 48 },
            { name: 'Hồng', count: 18 },
            { name: 'Tím', count: 22 },
            { name: 'Cam', count: 15 },
            { name: 'Xám', count: 31 },
            { name: 'Nâu', count: 20 },
            { name: 'Bạc', count: 12 }
        ]
    });
});

// Get all available colors
router.get('/elk/categories', async (req, res) => {
    if (!isConnected) {
        console.warn('Elasticsearch is not available - returning empty categories list');
        return res.json({ 
            categories: [],
            message: 'Category filtering is temporarily unavailable - running in degraded mode'
        });
    }
  const cacheKey = 'product:categories';
  
  try {
    // Kiểm tra cache
    const cachedCategories = await redisClient.get(cacheKey);
    if (cachedCategories) {
      return res.json({ categories: JSON.parse(cachedCategories) });
    }
    
    const result = await client.search({
      index: 'products',
      size: 0,
      aggs: {
        categories: {
          terms: {
            field: 'category.keyword',
            size: 50
          }
        }
      }
    });
    
    const responseData = getResponseData(result);
    if (!responseData || !responseData.aggregations) {
      return res.status(500).json({ message: 'Invalid Elasticsearch response structure' });
    }
    
    const categories = responseData.aggregations.categories?.buckets?.map(bucket => ({
      name: bucket.key,
      count: bucket.doc_count
    })) || [];
    
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categories));
    
    res.json({ categories });
  } catch (error) {
    console.error('Elasticsearch error:', error);
    res.status(500).json({ message: 'Error fetching product categories' });
  }
});

// Search suggestions endpoint
router.get('/elk/suggest', async (req, res) => {
    if (!isConnected) {
        return res.json({ suggestions: [] });
    }
    
    const { query } = req.query;
    if (!query || query.length < 2) {
        return res.json({ suggestions: [] });
    }
    
    const cacheKey = `product:suggestions:${query.toLowerCase()}`;
    
    try {
        // Check cache
        const cachedSuggestions = await redisClient.get(cacheKey);
        if (cachedSuggestions) {
            return res.json({ suggestions: JSON.parse(cachedSuggestions) });
        }
        
        // Use term suggestions instead of completion
        const result = await client.search({
            index: 'products',
            body: {
                size: 0,
                suggest: {
                    text: query,
                    term_suggest: {
                        term: {
                            field: 'name',
                            suggest_mode: 'popular',
                            size: 5
                        }
                    }
                },
                aggs: {
                    name_suggestions: {
                        terms: {
                            field: 'name.keyword',
                            include: `.*${query}.*`,
                            size: 5
                        }
                    }
                }
            }
        });
        
        const responseData = getResponseData(result);
        
        let suggestions = [];
        
        // Get exact matches from aggregations
        if (responseData?.aggregations?.name_suggestions?.buckets) {
            suggestions = responseData.aggregations.name_suggestions.buckets.map(bucket => bucket.key);
        }
        
        // Get suggestions from term suggester
        if (responseData?.suggest?.term_suggest?.[0]?.options) {
            const termSuggestions = responseData.suggest.term_suggest[0].options.map(option => option.text);
            suggestions = [...new Set([...suggestions, ...termSuggestions])];
        }
        
        // Cache results
        await redisClient.setEx(cacheKey, 600, JSON.stringify(suggestions.slice(0, 5)));
        
        res.json({ suggestions: suggestions.slice(0, 5) });
    } catch (error) {
        console.error('Elasticsearch suggestion error:', error);
        res.status(500).json({ 
            message: 'Error fetching search suggestions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.get('/elk/categories', async (req, res) => {
  try {
    const result = await client.search({
      index: 'products',
      size: 0,
      aggs: {
        categories: {
          terms: {
            field: 'category.keyword',
            size: 50
          }
        }
      }
    });
    
    const responseData = getResponseData(result);
    
    if (!responseData || !responseData.aggregations) {
      return res.status(500).json({ message: 'Invalid Elasticsearch response structure' });
    }
    const categories = responseData.aggregations.categories?.buckets?.map(bucket => ({
      name: bucket.key,
      count: bucket.doc_count
    })) || [];
    
    res.json({ categories });
  } catch (error) {
    console.error('Elasticsearch error:', error);
    res.status(500).json({ message: 'Error fetching product categories' });
  }
});

// Get price ranges
router.get('/elk/price-ranges', async (req, res) => {
    if (!isConnected) {
        console.warn('Elasticsearch is not available - returning empty price ranges');
        return res.json({
            stats: { min: 0, max: 0, avg: 0, sum: 0 },
            ranges: [],
            message: 'Price filtering is temporarily unavailable - running in degraded mode'
        });
    }
  try {
    const result = await client.search({
      index: 'products',
      size: 0,
      aggs: {
        price_stats: {
          stats: {
            field: 'price'
          }
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { to: 500000 },
              { from: 500000, to: 1000000 },
              { from: 1000000, to: 2000000 },
              { from: 2000000, to: 5000000 },
              { from: 5000000 }
            ]
          }
        }
      }
    });
    
    const responseData = getResponseData(result);
    
    if (!responseData || !responseData.aggregations) {
      return res.status(500).json({ message: 'Invalid Elasticsearch response structure' });
    }
    
    res.json({
      stats: responseData.aggregations.price_stats || {},
      ranges: responseData.aggregations.price_ranges?.buckets || []
    });
  } catch (error) {
    console.error('Elasticsearch error:', error);
    res.status(500).json({ message: 'Error fetching price ranges' });
  }
});

// Get trending/popular products
router.get('/elk/trending', async (req, res) => {
    if (!isConnected) {
        console.warn('Elasticsearch is not available - returning empty trending products');
        return res.json({ 
            products: [],
            message: 'Trending products are temporarily unavailable - running in degraded mode'
        });
    }

    try {
        const { limit = 10 } = req.query;
        const result = await client.search({
            index: 'products',
            size: parseInt(limit),
            query: {
                function_score: {
                    query: { match_all: {} },
                    functions: [
                        {
                            field_value_factor: {
                                field: 'views',
                                factor: 1,
                                modifier: 'log1p',
                                missing: 0
                            }
                        },
                        {
                            field_value_factor: {
                                field: 'sold',
                                factor: 0.5,
                                modifier: 'log1p',
                                missing: 0
                            }
                        }
                    ],
                    boost_mode: 'sum'
                }
            }
        });

        const responseData = getResponseData(result);
        if (!responseData || !responseData.hits) {
            return res.status(500).json({ message: 'Invalid Elasticsearch response structure' });
        }

        const products = responseData.hits.hits.map(hit => ({
            ...hit._source,
            _id: hit._id
        }));

        res.json({ products });
    } catch (error) {
        console.error('Elasticsearch error:', error);
        res.status(500).json({ 
            message: 'Error fetching trending products',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Related products endpoint
router.get('/elk/related/:productId', async (req, res) => {
    if (!isConnected) {
        console.warn('Elasticsearch is not available - returning empty related products');
        return res.json({ 
            products: [],
            message: 'Related products are temporarily unavailable - running in degraded mode'
        });
    }
  const { productId } = req.params;
  const { limit = 10 } = req.query;
  
  try {
    // First get the product
    const product = await client.get({
      index: 'products',
      id: productId
    });
    
    const productData = product.body || product;
    
    if (!productData || !productData.found) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get related products based on category and features
    const result = await client.search({
      index: 'products',
      size: parseInt(limit),
      query: {
        bool: {
          must_not: {
            term: { _id: productId }
          },
          should: [
            { term: { 'category.keyword': { value: productData._source.category, boost: 2.0 } } },
            { terms: { 'colors.keyword': productData._source.colors || [] } }
          ],
          minimum_should_match: 1
        }
      }
    });
    
    const responseData = getResponseData(result);
    
    if (!responseData || !responseData.hits) {
      return res.status(500).json({ message: 'Invalid Elasticsearch response structure' });
    }
    
    const relatedProducts = responseData.hits.hits.map(hit => ({
      ...hit._source,
      _id: hit._id
    }));
    
    res.json({ products: relatedProducts });
  } catch (error) {
    console.error('Elasticsearch error:', error);
    res.status(500).json({ 
      message: 'Error fetching related products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Reindex endpoint
router.post('/elk/reindex', async (req, res) => {
    if (!isConnected) {
        return res.status(503).json({
            message: 'Elasticsearch is not available',
            error: 'Cannot reindex without Elasticsearch connection'
        });
    }

    try {
        await createIndex();
        console.log('✅ Index recreated');

        const BATCH_SIZE = 5000;
        let totalIndexed = 0;
        let lastId = null;
        let batchCount = 0;

        while (true) {
            const query = lastId ? { _id: { $gt: lastId } } : {};
            const docs = await Product.find(query)
                .sort({ _id: 1 })
                .limit(BATCH_SIZE)
                .lean();

            if (docs.length === 0) break;

            const body = docs.flatMap(doc => [
                { index: { _index: 'products', _id: doc._id.toString() } },
                doc
            ]);

            const bulkResponse = await client.bulk({ refresh: false, body });

            if (bulkResponse.errors) {
                const errored = bulkResponse.items.filter(i => i.index && i.index.error);
                console.error(`❌ Bulk error in batch ${batchCount}`, errored.slice(0, 3));
            }

            totalIndexed += docs.length;
            lastId = docs[docs.length - 1]._id;
            batchCount++;

            console.log(`📦 Batch ${batchCount}: Indexed ${totalIndexed} docs`);
        }

        await client.indices.refresh({ index: 'products' });

        res.status(200).json({
            message: '🎉 Reindex completed using _id paging!',
            totalIndexed,
            totalBatches: batchCount
        });

    } catch (error) {
        console.error('❌ Reindex error:', error);
        res.status(500).json({
            message: 'Error during reindex',
            error: error.message
        });
    }
});



router.get('/elk/test', async (req, res) => {
    if (!isConnected) {
        return res.json({
            connected: false,
            message: 'Elasticsearch is not available - running in degraded mode',
            instructions: [
                '1. Install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop',
                '2. Run: docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" elasticsearch:8.12.1'
            ]
        });
    }
  try {
    const response = await client.ping();
    res.json({
      connected: true,
      response: response
    });
  } catch (error) {
    console.error('Elasticsearch test error:', error);
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});
router.delete('/elk/product/:productId', async (req, res) => {
  const { productId } = req.params;
  
  try {
    const exists = await client.exists({
      index: 'products',
      id: productId
    });
    
    const existsResult = exists.body !== undefined ? exists.body : exists;
    
    if (!existsResult) {
      return res.status(404).json({ message: 'Product not found in Elasticsearch' });
    }
    
    const result = await client.delete({
      index: 'products',
      id: productId
    });
    
    const productKeys = await redisClient.keys('product:*');
    const searchKeys = await redisClient.keys('search:*');

    const allKeysToDelete = [...productKeys, ...searchKeys];
    if (allKeysToDelete.length > 0) {
        await redisClient.del(allKeysToDelete);
    }
    
    res.json({ 
      message: 'Product successfully deleted from Elasticsearch',
      result: result.body || result
    });
    
  } catch (error) {
    console.error('Elasticsearch delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting product from Elasticsearch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export { client };
export default router;