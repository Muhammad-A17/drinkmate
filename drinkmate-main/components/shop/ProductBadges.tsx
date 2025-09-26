import React from 'react';
import { Star, Flame, Award, Zap, Crown, Sparkles, TrendingUp, Heart } from 'lucide-react';

interface ProductBadge {
  type: 'bestseller' | 'new' | 'limited' | 'premium' | 'trending' | 'favorite' | 'exclusive' | 'flash';
  text: string;
  color: string;
  bgColor: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ProductBadgesProps {
  badges: ProductBadge[];
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const ProductBadges: React.FC<ProductBadgesProps> = ({
  badges,
  size = 'md',
  position = 'top-left',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
  };

  const defaultBadges: Record<string, ProductBadge> = {
    bestseller: {
      type: 'bestseller',
      text: 'Bestseller',
      color: 'text-amber-700',
      bgColor: 'bg-gradient-to-r from-amber-400 to-yellow-400',
      icon: Star,
    },
    new: {
      type: 'new',
      text: 'New',
      color: 'text-green-700',
      bgColor: 'bg-gradient-to-r from-green-400 to-emerald-400',
      icon: Sparkles,
    },
    limited: {
      type: 'limited',
      text: 'Limited',
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-r from-purple-400 to-violet-400',
      icon: Crown,
    },
    premium: {
      type: 'premium',
      text: 'Premium',
      color: 'text-rose-700',
      bgColor: 'bg-gradient-to-r from-rose-400 to-pink-400',
      icon: Award,
    },
    trending: {
      type: 'trending',
      text: 'Trending',
      color: 'text-orange-700',
      bgColor: 'bg-gradient-to-r from-orange-400 to-red-400',
      icon: TrendingUp,
    },
    favorite: {
      type: 'favorite',
      text: 'Favorite',
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-r from-red-400 to-pink-400',
      icon: Heart,
    },
    exclusive: {
      type: 'exclusive',
      text: 'Exclusive',
      color: 'text-indigo-700',
      bgColor: 'bg-gradient-to-r from-indigo-400 to-purple-400',
      icon: Crown,
    },
    flash: {
      type: 'flash',
      text: 'Flash Sale',
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
      icon: Zap,
    },
  };

  const processedBadges = badges.map(badge => ({
    ...defaultBadges[badge.type],
    ...badge,
  }));

  if (processedBadges.length === 0) return null;

  return (
    <div className={`absolute ${positionClasses[position]} z-10 flex flex-col gap-2`}>
      {processedBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={`${badge.type}-${index}`}
            className={`
              ${sizeClasses[size]}
              ${badge.bgColor}
              ${badge.color}
              rounded-full font-bold shadow-lg backdrop-blur-sm
              border border-white/20 flex items-center gap-1.5
              animate-pulse hover:animate-none transition-all duration-200
              hover:scale-105 hover:shadow-xl
            `}
          >
            {Icon && <Icon className={iconSizeClasses[size]} />}
            <span className="font-bold tracking-wide">{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
};

// Preset badge configurations for common use cases
export const createBadge = (type: ProductBadge['type'], customText?: string): ProductBadge => {
  const defaults = {
    bestseller: { text: 'Bestseller', icon: Star },
    new: { text: 'New', icon: Sparkles },
    limited: { text: 'Limited', icon: Crown },
    premium: { text: 'Premium', icon: Award },
    trending: { text: 'Trending', icon: TrendingUp },
    favorite: { text: 'Favorite', icon: Heart },
    exclusive: { text: 'Exclusive', icon: Crown },
    flash: { text: 'Flash Sale', icon: Zap },
  };

  const baseBadge = defaults[type];
  return {
    type,
    text: customText || baseBadge.text,
    color: '',
    bgColor: '',
    icon: baseBadge.icon,
  };
};

export default ProductBadges;
