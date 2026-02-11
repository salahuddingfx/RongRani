const Product = require('../models/Product');

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        // Search in product names and tags
        const suggestions = await Product.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { tags: { $regex: q, $options: 'i' } },
                        { category: { $regex: q, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    name: 1,
                    category: 1,
                    price: 1,
                    image: { $arrayElemAt: ['$images', 0] },
                    _id: 1
                }
            },
            { $limit: 8 }
        ]);

        // Also get popular searches (you can store these in a separate collection)
        const popularSearches = ['Love Combo', 'Anniversary', 'Birthday', 'Valentine', 'Gifts'];
        const matchingPopular = popularSearches.filter(term =>
            term.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3);

        res.json({
            success: true,
            suggestions: suggestions,
            popularSearches: matchingPopular,
            query: q
        });
    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions',
            error: error.message
        });
    }
};

// @desc    Get trending/popular searches
// @route   GET /api/search/trending
// @access  Public
exports.getTrendingSearches = async (req, res) => {
    try {
        // Get categories with most products
        const trending = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { term: '$_id', _id: 0 } }
        ]);

        res.json({
            success: true,
            trending: trending.map(t => t.term)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trending searches',
            error: error.message
        });
    }
};
