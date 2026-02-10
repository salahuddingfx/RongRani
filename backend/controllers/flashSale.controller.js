const FlashSale = require('../models/FlashSale');
const Product = require('../models/Product');

// Get the current active flash sale
exports.getActiveFlashSale = async (req, res) => {
    try {
        const now = new Date();

        // Find active sale within current time range
        const flashSale = await FlashSale.findOne({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).populate('products.product'); // Populate product details

        if (!flashSale) {
            return res.status(200).json({ success: true, flashSale: null });
        }

        res.status(200).json({
            success: true,
            flashSale
        });
    } catch (error) {
        console.error('Error fetching active flash sale:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Create a new flash sale (Admin)
exports.createFlashSale = async (req, res) => {
    try {
        const { name, startTime, endTime, products, backgroundColor } = req.body;

        // Basic validation
        if (!name || !startTime || !endTime || !products || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const flashSale = await FlashSale.create({
            name,
            startTime,
            endTime,
            products,
            backgroundColor
        });

        res.status(201).json({
            success: true,
            flashSale
        });
    } catch (error) {
        console.error('Error creating flash sale:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// Update flash sale (Admin)
exports.updateFlashSale = async (req, res) => {
    try {
        const flashSale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!flashSale) {
            return res.status(404).json({
                success: false,
                message: 'Flash sale not found'
            });
        }

        res.status(200).json({
            success: true,
            flashSale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// Delete flash sale (Admin)
exports.deleteFlashSale = async (req, res) => {
    try {
        const flashSale = await FlashSale.findByIdAndDelete(req.params.id);

        if (!flashSale) {
            return res.status(404).json({
                success: false,
                message: 'Flash sale not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Flash sale deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Get all flash sales (Admin)
exports.getAllFlashSales = async (req, res) => {
    try {
        const flashSales = await FlashSale.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashSales.length,
            flashSales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
