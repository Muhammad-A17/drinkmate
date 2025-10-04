'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/contexts/translation-context'
import { Address } from '@/types/account'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Edit, Trash2, Star, ArrowLeft } from 'lucide-react'
import AddressForm from '@/components/account/AddressForm'
import Link from 'next/link'

export default function AddressesPage() {
  const { language, isRTL: _isRTL } = useTranslation() // _isRTL for future RTL implementation
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Mock data - replace with actual API call
  const mockAddresses: Address[] = [
    {
      id: '1',
      fullName: 'Ahmed Al-Rashid',
      district: 'Al-Riyadh',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      nationalAddress: 'JESA3591',
      phone: '+966501234567',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      fullName: 'Ahmed Al-Rashid',
      district: 'Al-Malaz',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      nationalAddress: 'KHRT2847',
      phone: '+966501234567',
      isDefault: false,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ]

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAddresses(mockAddresses)
      setLoading(false)
    }

    fetchAddresses()
  }, [])

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowForm(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm(language === 'AR' ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id))
    }
  }

  const handleSetDefault = async (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
  }

  const handleFormSubmit = (addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...addressData, updatedAt: new Date().toISOString() }
          : addr
      ))
    } else {
      // Add new address
      const newAddress: Address = {
        ...addressData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setAddresses(prev => [...prev, newAddress])
    }
    setShowForm(false)
    setEditingAddress(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link href="/account">
          <Button variant="outline" className="hover:bg-orange-50 hover:border-orange-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'AR' ? 'العودة إلى الحساب' : 'Back to Account'}
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'AR' ? 'العناوين' : 'Addresses'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'AR' 
              ? 'إدارة عناوين الشحن الخاصة بك'
              : 'Manage your shipping addresses'
            }
          </p>
        </div>
        <Button onClick={handleAddAddress}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'AR' ? 'إضافة عنوان' : 'Add Address'}
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'AR' ? 'لا توجد عناوين' : 'No addresses yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'AR' 
              ? 'أضف عنوان شحن لتسهيل عملية الطلب'
              : 'Add a shipping address to make ordering easier'
            }
          </p>
          <Button onClick={handleAddAddress}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'AR' ? 'إضافة عنوان' : 'Add Address'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative">
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    {language === 'AR' ? 'افتراضي' : 'Default'}
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {address.fullName}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{address.district}</p>
                  <p>{address.city}, {address.country} {address.nationalAddress && `- ${address.nationalAddress}`}</p>
                  <p>{address.phone}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAddress(address)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {language === 'AR' ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {!address.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(address.id)}
                  className="w-full mt-2"
                >
                  {language === 'AR' ? 'تعيين كافتراضي' : 'Set as Default'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <AddressForm
              address={editingAddress}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingAddress(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
