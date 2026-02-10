import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import SocketProvider from './contexts/SocketContext.jsx';
import AppInitializer from './components/AppInitializer';
import AppLayout from './components/AppLayout';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import RecentlyViewed from './components/RecentlyViewed';
import LiveChat from './components/LiveChat';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminSales from './pages/AdminSales';
import AdminCoupons from './pages/AdminCoupons';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminBanners from './pages/AdminBanners';
import AdminCategories from './pages/AdminCategories';
import AdminHotOffer from './pages/AdminHotOffer';
import AdminReviews from './pages/AdminReviews';
import AdminDeliverySettings from './pages/AdminDeliverySettings';
import AdminReports from './pages/AdminReports';
import AdminStatus from './pages/AdminStatus';
import AdminAI from './pages/AdminAI';
import AdminFlashSale from './pages/AdminFlashSale';
import PaymentStatus from './pages/PaymentStatus';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import ContactUs from './pages/ContactUs';
import HelpCenter from './pages/HelpCenter';
import AboutUs from './pages/AboutUs';
import Reviews from './pages/Reviews';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              <AppInitializer>
                <CartProvider>
                  <HelmetProvider>
                    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 3000,
                          style: {
                            background: '#363636',
                            color: '#fff',
                          },
                          success: {
                            duration: 3000,
                            iconTheme: {
                              primary: '#C9A86A',
                              secondary: '#fff',
                            },
                          },
                          error: {
                            duration: 4000,
                            iconTheme: {
                              primary: '#FF0000',
                              secondary: '#fff',
                            },
                          },
                        }}
                      />
                      <ScrollToTop />
                      <LiveChat />
                      <RecentlyViewed />
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<AppLayout />}>
                          <Route index element={<Home />} />
                          <Route path="shop" element={<Shop />} />
                          <Route path="product/:id" element={<ProductDetail />} />
                          <Route path="login" element={
                            <PublicRoute>
                              <Login />
                            </PublicRoute>
                          } />
                          <Route path="register" element={
                            <PublicRoute>
                              <Register />
                            </PublicRoute>
                          } />
                          <Route path="forgot-password" element={
                            <PublicRoute>
                              <ForgotPassword />
                            </PublicRoute>
                          } />
                          <Route path="reset-password/:token" element={
                            <PublicRoute>
                              <ResetPassword />
                            </PublicRoute>
                          } />

                          {/* Cart and Checkout - Public (Guest checkout allowed) */}
                          <Route path="cart" element={<Cart />} />
                          <Route path="checkout" element={<Checkout />} />
                          <Route path="reviews" element={<Reviews />} />


                          {/* Private Routes */}
                          <Route path="dashboard" element={
                            <PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>
                          } />

                          {/* Orders - Allow guest access for order tracking */}
                          <Route path="orders" element={<Orders />} />
                          <Route path="my-orders" element={<Orders />} />

                          <Route path="wishlist" element={
                            <PrivateRoute>
                              <Wishlist />
                            </PrivateRoute>
                          } />
                          <Route path="contact" element={<ContactUs />} />
                          <Route path="help" element={<HelpCenter />} />
                          <Route path="about" element={<AboutUs />} />
                          <Route path="terms" element={<TermsConditions />} />
                          <Route path="privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="track/:orderId" element={<OrderTracking />} />
                          <Route path="track/:orderId" element={<OrderTracking />} />
                          <Route path="track" element={<OrderTracking />} />
                          <Route path="payment/:status/:orderId" element={<PaymentStatus />} />
                          <Route path="payment/:status" element={<PaymentStatus />} />

                          {/* 404 Route */}
                          <Route path="*" element={<NotFound />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="sales" element={<AdminSales />} />
                          <Route path="coupons" element={<AdminCoupons />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="banners" element={<AdminBanners />} />
                          <Route path="hot-offer" element={<AdminHotOffer />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="delivery-settings" element={<AdminDeliverySettings />} />
                          <Route path="reports" element={<AdminReports />} />
                          <Route path="status" element={<AdminStatus />} />
                          <Route path="ai" element={<AdminAI />} />
                          <Route path="flash-sale" element={<AdminFlashSale />} />
                        </Route>
                      </Routes>
                    </Router>
                  </HelmetProvider>
                </CartProvider>
              </AppInitializer>
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
