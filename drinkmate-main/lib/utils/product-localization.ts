/**
 * Utility functions for product localization
 * Handles getting the correct language version of product data
 */

import { BaseProduct } from '@/lib/types'
import { Language } from '@/lib/translations'

/**
 * Get localized product name
 */
export function getLocalizedProductName(product: BaseProduct, language: Language): string {
  if (language === 'AR' && product.nameAr) {
    return product.nameAr
  }
  return product.name
}

/**
 * Get localized product description
 */
export function getLocalizedProductDescription(product: BaseProduct, language: Language): string {
  if (language === 'AR' && product.descriptionAr) {
    return product.descriptionAr
  }
  return product.description || ''
}

/**
 * Get localized short description
 */
export function getLocalizedShortDescription(product: BaseProduct, language: Language): string {
  if (language === 'AR' && product.shortDescriptionAr) {
    return product.shortDescriptionAr
  }
  return product.shortDescription || ''
}

/**
 * Get localized full description
 */
export function getLocalizedFullDescription(product: BaseProduct, language: Language): string {
  if (language === 'AR' && product.fullDescriptionAr) {
    return product.fullDescriptionAr
  }
  return product.fullDescription || ''
}

/**
 * Get localized color name
 */
export function getLocalizedColorName(color: { name: string; nameAr?: string }, language: Language): string {
  if (language === 'AR' && color.nameAr) {
    return color.nameAr
  }
  return color.name
}

/**
 * Get localized variant name
 */
export function getLocalizedVariantName(variant: { name?: string; nameAr?: string }, language: Language): string {
  if (language === 'AR' && variant.nameAr) {
    return variant.nameAr
  }
  return variant.name || ''
}

/**
 * Get localized color name for variant
 */
export function getLocalizedVariantColorName(variant: { colorName?: string; colorNameAr?: string }, language: Language): string {
  if (language === 'AR' && variant.colorNameAr) {
    return variant.colorNameAr
  }
  return variant.colorName || ''
}

/**
 * Get localized feature title
 */
export function getLocalizedFeatureTitle(feature: { title: string; titleAr?: string }, language: Language): string {
  if (language === 'AR' && feature.titleAr) {
    return feature.titleAr
  }
  return feature.title
}

/**
 * Get localized feature description
 */
export function getLocalizedFeatureDescription(feature: { description?: string; descriptionAr?: string }, language: Language): string {
  if (language === 'AR' && feature.descriptionAr) {
    return feature.descriptionAr
  }
  return feature.description || ''
}

/**
 * Get localized specifications
 */
export function getLocalizedSpecifications(product: BaseProduct, language: Language): Record<string, string> {
  if (language === 'AR' && product.specificationsAr) {
    return product.specificationsAr
  }
  return product.specifications || {}
}

/**
 * Get localized product data for display
 */
export function getLocalizedProductData(product: BaseProduct, language: Language) {
  return {
    name: getLocalizedProductName(product, language),
    description: getLocalizedProductDescription(product, language),
    shortDescription: getLocalizedShortDescription(product, language),
    fullDescription: getLocalizedFullDescription(product, language),
    specifications: getLocalizedSpecifications(product, language),
    colors: product.colors?.map(color => {
      if (typeof color === 'string') return color
      return {
        ...color,
        displayName: getLocalizedColorName(color, language)
      }
    }),
    variants: product.variants?.map(variant => ({
      ...variant,
      displayName: getLocalizedVariantName(variant, language),
      displayColorName: getLocalizedVariantColorName(variant, language)
    })),
    features: product.features?.map(feature => {
      if (typeof feature === 'string') return feature
      return {
        ...feature,
        displayTitle: getLocalizedFeatureTitle(feature, language),
        displayDescription: getLocalizedFeatureDescription(feature, language)
      }
    })
  }
}
