import React from 'react';
import { Share2, Facebook, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialShare = ({ url, title }) => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    const handleShare = (platform) => {
        let shareLink = '';

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl).then(() => {
                    toast.success('Link copied to clipboard!');
                });
                return;
            default:
                return;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-bold text-slate-500">Share:</span>

            <button
                onClick={() => handleShare('facebook')}
                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                title="Share on Facebook"
            >
                <Facebook className="w-4 h-4" />
            </button>

            <button
                onClick={() => handleShare('whatsapp')}
                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                title="Share on WhatsApp"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
            </button>

            <button
                onClick={() => handleShare('copy')}
                className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                title="Copy Link"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default SocialShare;
