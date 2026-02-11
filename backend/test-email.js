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
            '🧪 RongRani Email Service Test - Working! 🚀',
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #7b1230;">🎉 It Works!</h2>
                <p>Hello Salahuddin,</p>
                <p>This is a test email from your <strong>RongRani</strong> backend.</p>
                <p>If you are reading this, your <strong>Brevo SMTP</strong> configuration is working perfectly.</p>
                <hr>
                <p><strong>Config Used:</strong></p>
                <ul>
                    <li>Host: ${process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST}</li>
                    <li>User: ${process.env.BREVO_SMTP_USER || process.env.SMTP_USER}</li>
                </ul>
                <p style="color: green; font-weight: bold;">✅ Email Service is Ready for Launch!</p>
            </div>
            `,
            {}
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
