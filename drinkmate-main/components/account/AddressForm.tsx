'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/contexts/translation-context'
import { Address } from '@/types/account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressFormProps {
  address?: Address | null
  onSubmit: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const { language, isRTL } = useTranslation()
  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    district: address?.district || '',
    city: address?.city || '',
    country: 'Saudi Arabia',
    nationalAddress: address?.nationalAddress || '',
    isDefault: address?.isDefault || false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = language === 'AR' ? 'الاسم الكامل مطلوب' : 'Full name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = language === 'AR' ? 'رقم الهاتف مطلوب' : 'Phone number is required'
    } else if (!/^\+966\d{9}$/.test(formData.phone)) {
      newErrors.phone = language === 'AR' 
        ? 'رقم الهاتف يجب أن يبدأ بـ +966 ويحتوي على 9 أرقام'
        : 'Phone number must start with +966 and contain 9 digits'
    }

    if (!formData.district.trim()) {
      newErrors.district = language === 'AR' ? 'الحي مطلوب' : 'District is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = language === 'AR' ? 'المدينة مطلوبة' : 'City is required'
    }

    if (!formData.country.trim()) {
      newErrors.country = language === 'AR' ? 'البلد مطلوب' : 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {address 
            ? (language === 'AR' ? 'تعديل العنوان' : 'Edit Address')
            : (language === 'AR' ? 'إضافة عنوان جديد' : 'Add New Address')
          }
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName">
            {language === 'AR' ? 'الاسم الكامل' : 'Full Name'}
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={cn(errors.fullName && 'border-red-500')}
            placeholder={language === 'AR' ? 'أدخل الاسم الكامل' : 'Enter full name'}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">
            {language === 'AR' ? 'رقم الهاتف' : 'Phone Number'}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={cn(errors.phone && 'border-red-500')}
            placeholder="+966501234567"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* District */}
        <div>
          <Label htmlFor="district">
            {language === 'AR' ? 'الحي' : 'District'}
          </Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            className={cn(errors.district && 'border-red-500')}
            placeholder={language === 'AR' ? 'أدخل الحي' : 'Enter district'}
          />
          {errors.district && (
            <p className="text-sm text-red-600 mt-1">{errors.district}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city">
            {language === 'AR' ? 'المدينة' : 'City'}
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={cn(errors.city && 'border-red-500')}
            placeholder={language === 'AR' ? 'أدخل المدينة' : 'Enter city'}
          />
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">
            {language === 'AR' ? 'رقم الهاتف' : 'Phone Number'}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={cn(errors.phone && 'border-red-500')}
            placeholder="+966501234567"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country">
            {language === 'AR' ? 'البلد' : 'Country'}
          </Label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
            Saudi Arabia
          </div>
        </div>

        {/* National Address */}
        <div>
          <Label htmlFor="nationalAddress">
            {language === 'AR' ? 'العنوان المختصر' : 'Short Address'} (<a href="https://splonline.com.sa/en/national-address-1/" target="_blank" rel="noopener noreferrer" className="text-[#12d6fa] hover:text-[#0bc4e8] underline">{language === 'AR' ? 'العنوان الوطني' : 'National Address'}</a>) {language === 'AR' ? '(اختياري)' : '(optional)'}
          </Label>
          <Input
            id="nationalAddress"
            value={formData.nationalAddress}
            onChange={(e) => handleInputChange('nationalAddress', e.target.value.toUpperCase())}
            className={cn(errors.nationalAddress && 'border-red-500', 'font-mono tracking-wider')}
            placeholder="JESA3591"
            maxLength={8}
            pattern="[A-Z]{4}[0-9]{4}"
          />
          <p className="text-xs text-gray-500 mt-1">{language === 'AR' ? 'التنسيق: 4 أحرف متبوعة بـ 4 أرقام (مثال: JESA3591)' : 'Format: 4 letters followed by 4 numbers (e.g., JESA3591)'}</p>
          {errors.nationalAddress && (
            <p className="text-sm text-red-600 mt-1">{errors.nationalAddress}</p>
          )}
        </div>

        {/* Default Address */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={(checked) => handleInputChange('isDefault', checked as boolean)}
          />
          <Label htmlFor="isDefault" className="text-sm">
            {language === 'AR' ? 'تعيين كعنوان افتراضي' : 'Set as default address'}
          </Label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {language === 'AR' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className="flex-1">
            {address 
              ? (language === 'AR' ? 'تحديث العنوان' : 'Update Address')
              : (language === 'AR' ? 'إضافة العنوان' : 'Add Address')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
