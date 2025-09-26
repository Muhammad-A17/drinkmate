import React, { useState, useEffect } from 'react';
import { Share2, Copy, MessageCircle, Mail, Facebook, Twitter, Instagram, Link } from 'lucide-react';

interface ProductShareProps {
  productId: string;
  productName: string;
  productImage: string;
  productUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProductShare: React.FC<ProductShareProps> = ({
  productId,
  productName,
  productImage,
  productUrl,
  isOpen,
  onClose,
}) => {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: async () => {
        await navigator.clipboard.writeText(productUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      },
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        const text = `Check out this amazing drink: ${productName}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
      },
      color: 'bg-sky-100 hover:bg-sky-200 text-sky-700',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      action: () => {
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
        navigator.clipboard.writeText(`${productName}\n${productUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      color: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        const text = `Check out this amazing drink: ${productName} ${productUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      },
      color: 'bg-green-100 hover:bg-green-200 text-green-700',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = `Check out this amazing drink: ${productName}`;
        const body = `I thought you might like this drink:\n\n${productName}\n${productUrl}`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
      },
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: 'Check out this amazing drink!',
          url: productUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4 bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Share Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200"
            aria-label="Close share modal"
          >
            <Link className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{productName}</h3>
              <p className="text-sm text-gray-600 mt-1">DrinkMates Collection</p>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${option.color}`}
                  aria-label={`Share via ${option.name}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{option.name}</span>
                </button>
              );
            })}
          </div>

          {/* Native Share */}
          {canShare && (
            <button
              onClick={handleNativeShare}
              className="w-full mt-4 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Share2 className="w-5 h-5" />
              Share with Device
            </button>
          )}

          {/* Copy Status */}
          {copied && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-xl text-center font-medium">
              Link copied to clipboard!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Share this amazing drink with your friends and family!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShare;
