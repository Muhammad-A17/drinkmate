'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/translation-context'
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
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    district: address?.district || '',
    city: address?.city || '',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'AR' ? 'الاسم الأول مطلوب' : 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'AR' ? 'الاسم الأخير مطلوب' : 'Last name is required'
    }

    if (!formData.district.trim()) {
      newErrors.district = language === 'AR' ? 'الحي مطلوب' : 'District is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = language === 'AR' ? 'المدينة مطلوبة' : 'City is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = language === 'AR' ? 'رقم الهاتف مطلوب' : 'Phone number is required'
    } else if (!/^\+966\d{9}$/.test(formData.phone)) {
      newErrors.phone = language === 'AR' 
        ? 'رقم الهاتف يجب أن يبدأ بـ +966 ويحتوي على 9 أرقام'
        : 'Phone number must start with +966 and contain 9 digits'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName">
              {language === 'AR' ? 'الاسم الأول' : 'First Name'}
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={cn(errors.firstName && 'border-red-500')}
              placeholder={language === 'AR' ? 'أدخل الاسم الأول' : 'Enter first name'}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName">
              {language === 'AR' ? 'الاسم الأخير' : 'Last Name'}
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={cn(errors.lastName && 'border-red-500')}
              placeholder={language === 'AR' ? 'أدخل الاسم الأخير' : 'Enter last name'}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
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
