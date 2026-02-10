import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const PaymentStatus = () => {
    const { status, orderId } = useParams();
    const { clearCart } = useCart();
    const location = useLocation();

    useEffect(() => {
        if (status === 'success') {
            clearCart();
        }
    }, [status, clearCart]);

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg reveal-visible animate-scale-in">
                <div className="text-center">
                    {status === 'success' && (
                        <>
                            <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-8">
                                Thank you for your purchase. Your order has been confirmed.
                            </p>
                        </>
                    )}

                    {status === 'fail' && (
                        <>
                            <XCircle className="mx-auto h-20 w-20 text-red-500 mb-4" />
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Failed</h2>
                            <p className="text-gray-600 mb-8">
                                We couldn't process your payment. Please try again or contact support.
                            </p>
                        </>
                    )}

                    {status === 'cancel' && (
                        <>
                            <AlertTriangle className="mx-auto h-20 w-20 text-yellow-500 mb-4" />
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Cancelled</h2>
                            <p className="text-gray-600 mb-8">
                                You cancelled the payment process.
                            </p>
                        </>
                    )}

                    <div className="space-y-4">
                        {orderId && (
                            <Link
                                to={`/order/${orderId}`} // Assuming there is an order details page
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maroon hover:bg-maroon/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon"
                            >
                                View Order
                            </Link>
                        )}

                        <Link
                            to="/"
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
