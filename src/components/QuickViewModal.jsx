import React, { useState, useEffect } from 'react';
import { X, Eye, ArrowRight, ShoppingCart, Star, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';


const QuickViewModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  const handleViewFull = () => {
    navigate(`/product/${product._id}`);
    onClose();
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-cream-dark p-4 flex items-center justify-between z-50 rounded-t-3xl">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-maroon" />
            <h2 className="text-xl font-bold text-charcoal">Quick View</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-charcoal" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="h-full space-y-4">
            <div className="relative group aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border-2 border-maroon/5 shadow-lg">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImage]?.url || product.images[activeImage] || ''}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Package className="h-16 w-16 opacity-50" />
                </div>
              )}

              {/* Discount Tag */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-maroon text-white font-bold px-4 py-1 rounded-full shadow-lg text-sm">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${activeImage === index
                      ? 'border-maroon scale-105 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img.url || img || ''}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-charcoal mb-2">{product.name}</h3>

              {/* Category */}
              {product.category && (
                <div className="mb-3">
                  <span className="inline-block bg-cream px-3 py-1 rounded-full text-sm text-charcoal">
                    {typeof product.category === 'string' ? product.category : product.category.name}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-maroon">৳{product.price?.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-slate line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating)
                          ? 'text-gold fill-gold'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-charcoal-light mb-6 line-clamp-4">{product.description}</p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center text-green-600 font-semibold">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-600 font-semibold">
                    ✗ Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-charcoal mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-cream-dark rounded-lg hover:bg-cream transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-charcoal min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 border border-cream-dark rounded-lg hover:bg-cream transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-cream-dark">
              {product.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-full btn btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              )}
              <button
                onClick={handleViewFull}
                className="w-full btn btn-secondary flex items-center justify-center space-x-2"
              >
                <Eye className="h-5 w-5" />
                <span>View Full Details</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
