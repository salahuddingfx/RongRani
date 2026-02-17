import React from 'react';
import { Facebook, Link as LinkIcon, Twitter, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialShare = ({ url, title, image, description, price }) => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;
    const shareImage = image || '';
    const shareDescription = description || '';

    const handleShare = (platform) => {
        let shareLink = '';

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                // Enhanced WhatsApp message with price and better formatting
                const whatsappMsg = `*${shareTitle}*${price ? `\n💰 *Price:* ৳${price}` : ''}\n\n${shareDescription ? `_${shareDescription.substring(0, 100)}..._\n\n` : ''}🛒 *Shop Now:* ${shareUrl}`;
                shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'messenger':
                shareLink = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}&app_id=123456789`; // Generic fallback
                // Browser fallback for messenger
                if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                    shareLink = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=123456789&redirect_uri=${encodeURIComponent(shareUrl)}`;
                }
                break;
            case 'pinterest':
                // Ensure image is absolute for Pinterest
                const pinterestImage = shareImage.startsWith('http') ? shareImage : `${window.location.origin}${shareImage.startsWith('/') ? '' : '/'}${shareImage}`;
                shareLink = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(pinterestImage)}&description=${encodeURIComponent(shareTitle)}`;
                break;
            case 'copy':
                try {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        toast.success('Link copied to clipboard!', {
                            icon: '🔗',
                            style: { borderRadius: '10px', background: '#333', color: '#fff' }
                        });
                    });
                } catch (err) {
                    const input = document.createElement('input');
                    input.value = shareUrl;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                    toast.success('Link copied!');
                }
                return;
            default:
                return;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=500,location=no,menubar=no,scrollbars=yes,status=no,toolbar=no');
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-3 mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <span className="text-sm font-black text-slate-500 uppercase tracking-tighter">Share RongRani™:</span>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleShare('facebook')}
                    className="p-2.5 bg-[#1877F2]/10 text-[#1877F2] rounded-xl hover:bg-[#1877F2] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                    title="Share on Facebook"
                >
                    <Facebook className="w-5 h-5" />
                </button>

                <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                    title="Share on WhatsApp"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                </button>

                <button
                    onClick={() => handleShare('twitter')}
                    className="p-2.5 bg-black/10 text-black dark:bg-white/10 dark:text-white rounded-xl hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                    title="Share on X (Twitter)"
                >
                    <Twitter className="w-5 h-5" />
                </button>

                <button
                    onClick={() => handleShare('pinterest')}
                    className="p-2.5 bg-[#BD081C]/10 text-[#BD081C] rounded-xl hover:bg-[#BD081C] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                    title="Pin to Pinterest"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.259 7.929-7.259 4.162 0 7.398 2.965 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0Z" />
                    </svg>
                </button>

                <button
                    onClick={() => handleShare('copy')}
                    className="p-2.5 bg-maroon/10 text-maroon rounded-xl hover:bg-maroon hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                    title="Copy Link"
                >
                    <LinkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SocialShare;
