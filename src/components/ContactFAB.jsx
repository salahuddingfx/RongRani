import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';

const ContactFAB = () => {
    const whatsappNumber = "8801851075537";
    const phoneNumber = "+8801851075537";

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-4">
            {/* Phone Link */}
            <a
                href={`tel:${phoneNumber}`}
                className="group relative flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 text-maroon rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:scale-110 hover:bg-maroon hover:text-white"
                title="Call Us"
            >
                <Phone className="w-6 h-6" />
                <span className="absolute right-full mr-4 px-3 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium rounded-lg shadow-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Call Assistance
                </span>
            </a>

            {/* WhatsApp Link */}
            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-[360deg]"
                title="Chat on WhatsApp"
            >
                <MessageSquare className="w-7 h-7" />
                <span className="absolute right-full mr-4 px-3 py-1 bg-[#25D366] text-white text-sm font-medium rounded-lg shadow-xl opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    WhatsApp Support
                </span>
            </a>
        </div>
    );
};

export default ContactFAB;
