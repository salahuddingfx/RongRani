import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([
    {
      _id: '11',
      name: 'Love Combo - RongRani Special',
      price: 2500,
      originalPrice: 3000,
      images: ['https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=500'],
      category: 'Love Combo',
      rating: 5.0,
      inStock: true
    },
    {
      _id: '14',
      name: 'Anniversary Surprise Box',
      price: 5500,
      originalPrice: 6500,
      images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500'],
      category: 'Anniversary Combo',
      rating: 5.0,
      inStock: true
    },
    {
      _id: '5',
      name: 'Ladies Elegant Watch',
      price: 4500,
      originalPrice: 6000,
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'],
      category: 'Watches',
      rating: 4.7,
      inStock: true
    }
  ]);

  const removeFromWishlist = (itemId) => {
    setWishlistItems(wishlistItems.filter(item => item._id !== itemId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success('Added to cart!');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-pink-50">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-maroon" />
          </div>
          <h2 className="text-3xl font-bold text-maroon mb-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-slate text-lg mb-8">
            Start adding your favorite gift items to your wishlist
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-8 w-8 text-maroon fill-maroon" />
            <h1 className="text-4xl font-bold text-maroon">My Wishlist</h1>
          </div>
          <p className="text-slate">Save your favorite gift items for later</p>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="card group hover:shadow-large transition-all duration-300">
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-2xl mb-4 -mt-6 -mx-6">
                <Link to={`/product/${item._id}`}>
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                {item.originalPrice > item.price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <Link to={`/product/${item._id}`}>
                  <h3 className="text-lg font-bold text-charcoal mb-2 hover:text-maroon transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-3 py-1 bg-maroon/10 text-maroon rounded-full text-xs font-semibold">
                    {item.category}
                  </span>
                  {item.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-gold text-sm">★</span>
                      <span className="text-sm font-semibold text-charcoal">{item.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl font-bold text-maroon">
                    ৳{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-lg text-slate line-through">
                      ৳{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4 border-t border-slate/20">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.inStock}
                  className="flex-1 btn-primary text-sm py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{item.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="card mt-8 bg-maroon text-white text-center">
          <p className="text-3xl font-bold mb-2">{wishlistItems.length}</p>
          <p className="text-white/80">items in your wishlist</p>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
