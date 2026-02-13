require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { sendEmail } = require('./services/emailService');

console.log('🧪 Starting Email Test...');
console.log('-----------------------------------');
console.log('Target Email: info.salahuddinkader@gmail.com');
console.log('-----------------------------------');

const testEmail = async () => {
    const to = 'info.salahuddinkader@gmail.com';

    console.log(`📧 Sending test email to: ${to}`);

    try {
        const result = await sendEmail(
            to,
            '🧪 RongRani Premium Email Test 🚀',
            'orderConfirmation',
            {
                name: 'Salahuddin',
                orderId: 'RR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                customerEmail: to,
                subtotal: 1250,
                shipping: 60,
                discount: 100,
                total: 1210,
                items: [
                    { name: 'Red Velvet Gift Box', quantity: 1, price: 850 },
                    { name: 'Handmade Anniversary Card', quantity: 2, price: 200 }
                ],
                shippingAddress: {
                    street: 'Road 5, Block A',
                    city: 'Chattogram',
                    zipCode: '4000',
                    phone: '+880 1851-075537'
                }
            }
        );

        if (result.success) {
            console.log('✅ TEST PASSED: Email sent successfully!');
            console.log('Message ID:', result.messageId);
        } else {
            console.error('❌ TEST FAILED: Could not send email.');
            console.error('Error:', result.error);
        }
    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error);
    }
};

testEmail();
