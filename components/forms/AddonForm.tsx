'use client'
import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useAuth } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import { createAddon, updateAddon } from '@/data/products'
import { fetchItems } from '@/data/categoriesOrTags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

const addonSchema = z.object({
  name_en: z.string().min(2, 'Name (English) is required'),
  name_ar: z.string().min(2, 'Name (Arabic) is required'),
  addonType: z.enum(['BALOONS', 'CHOCOLATES', 'CAKES']),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  mainImage: z.object({
    image: z.instanceof(File).optional(),
    altText_en: z.string().optional(),
    altText_ar: z.string().optional(),
  }),
  addonVariations: z.array(z.object({
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().min(0, 'Price must be a positive number'),
    inStock: z.boolean(),
    sizeId: z.number().optional(),
    weight: z.number().min(0, 'Weight must be a positive number').optional(),
    isDefault: z.boolean(),
    image: z.object({
      image: z.instanceof(File).optional(),
      altText_en: z.string().optional(),
      altText_ar: z.string().optional(),
    }).optional(),
  })).min(1, 'At least one variation is required'),
})

type AddonFormValues = z.infer<typeof addonSchema>

interface AddonImage {
  url: string;
  altText_en?: string;
  altText_ar?: string;
}

interface AddonVariation {
  id: number;
  sku: string;
  price: number;
  inStock: boolean;
  sizeId?: number;
  weight?: number;
  isDefault: boolean;
  image?: AddonImage;
}

interface AddonFormProps {
  addonId?: number;
  initialData?: {
    name_en: string;
    name_ar: string;
    addonType: 'BALOONS' | 'CHOCOLATES' | 'CAKES';
    description_en?: string;
    description_ar?: string;
    mainImage?: AddonImage;
    addonVariations: AddonVariation[];
  };
}

export default function AddonForm({ addonId, initialData }: AddonFormProps) {
  const { isLoaded, userId, getToken } = useAuth()
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialData?.mainImage?.url || null)
  const [variationImagePreviews, setVariationImagePreviews] = useState<(string | null)[]>(
    initialData?.addonVariations.map(v => v.image?.url || null) || []
  )

  console.log("initla",initialData)
  console.log("test")
  const queryClient = useQueryClient()

  const form = useForm<AddonFormValues>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name_en: initialData?.name_en || '',
      name_ar: initialData?.name_ar || '',
      addonType: initialData?.addonType || 'BALOONS',
      description_en: initialData?.description_en || '',
      description_ar: initialData?.description_ar || '',
      mainImage: {
        altText_en: initialData?.mainImage?.altText_en || '',
        altText_ar: initialData?.mainImage?.altText_ar || '',
      },
      addonVariations: initialData?.addonVariations?.map(variation => ({
        sku: variation.sku,
        price: variation.price,
        inStock: variation.inStock,
        sizeId: variation.sizeId,
        weight: variation.weight,
        isDefault: variation.isDefault,
        image: variation.image ? {
          altText_en: variation.image.altText_en || '',
          altText_ar: variation.image.altText_ar || '',
        } : undefined,
      })) || [{ sku: '', price: 0, inStock: true, isDefault: true }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addonVariations',
  })

  const { data: sizes, isLoading: sizesLoading } = useQuery({
    queryKey: ['addonSizes', userId],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('addonSizes', 1, 100, token)
    },
    enabled: isLoaded && !!userId,
  })

  const mutation = useMutation({
    mutationFn: async (data: AddonFormValues) => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'mainImage') {
          const mainImage = value as AddonFormValues['mainImage']
          if (mainImage.image instanceof File) {
            formData.append('mainImage', mainImage.image)
          }
          formData.append('mainImageAltTextEn', mainImage.altText_en || '')
          formData.append('mainImageAltTextAr', mainImage.altText_ar || '')
        } else if (key === 'addonVariations') {
          const variations = value as AddonFormValues['addonVariations']
          variations.forEach((variation, index) => {
            if (variation.image?.image instanceof File) {
              formData.append(`variationImage`, variation.image.image)
              formData.append(`variationImageAltTextEn_${index}`, variation.image.altText_en || '')
              formData.append(`variationImageAltTextAr_${index}`, variation.image.altText_ar || '')
            }
          })
          formData.append('addonVariations', JSON.stringify(variations))
        } else {
          formData.append(key, value as string)
        }
      })
      if (addonId) {
        return updateAddon(addonId, formData, token)
      } else {
        return createAddon(formData, token)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] })
      toast({ title: addonId ? 'Addon updated successfully' : 'Addon created successfully' })
      if (!addonId) {
        form.reset()
        setMainImagePreview(null)
        setVariationImagePreviews([])
      }
    },
    onError: (error) => {
      console.error('Error saving addon:', error)
      toast({ title: `Failed to ${addonId ? 'update' : 'create'} addon`, variant: 'destructive' })
    },
  })

  const onSubmit = (data: AddonFormValues) => {
    mutation.mutate(data)
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('mainImage.image', file)
      setMainImagePreview(URL.createObjectURL(file))
    }
  }

  const handleVariationImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue(`addonVariations.${index}.image.image`, file)
      setVariationImagePreviews(prev => {
        const newPreviews = [...prev]
        newPreviews[index] = URL.createObjectURL(file)
        return newPreviews
      })
    }
  }

  if (!isLoaded || sizesLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{addonId ? 'Edit Addon' : 'Create New Addon'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter addon name in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter addon name in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addonType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Addon Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select addon type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BALOONS">Baloons</SelectItem>
                      <SelectItem value="CHOCOLATES">Chocolates</SelectItem>
                      <SelectItem value="CAKES">Cakes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter addon description in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter addon description in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mainImage.image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Main Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mainImage.altText_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image Alt Text (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alt text in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mainImage.altText_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image Alt Text (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter alt text in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mainImagePreview && (
              <div className="mt-4">
                <Image src={mainImagePreview} alt="Main image preview" className="w-full max-w-md h-auto rounded-md" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Addon Variations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                  <FormField
                  control={form.control}
                  name={`addonVariations.${index}.sku`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Enter price" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.inStock`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>In Stock</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.sizeId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sizes?.items.map((size: any) => (
                            <SelectItem key={size.id} value={size.id.toString()}>
                              {size.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.weight`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Enter weight" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.isDefault`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked)
                            if (e.target.checked) {
                              form.setValue(
                                'addonVariations',
                                form.getValues('addonVariations').map((v, i) => ({
                                  ...v,
                                  isDefault: i === index,
                                }))
                              )
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel>Is Default Variation</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.image.image`}
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Variation Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleVariationImageChange(index, e)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.image.altText_en`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variation Image Alt Text (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alt text in English" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addonVariations.${index}.image.altText_ar`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variation Image Alt Text (Arabic)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alt text in Arabic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {variationImagePreviews[index] && (
                  <div className="mt-4">
                    <Image src={variationImagePreviews[index] || ''} alt={`Variation ${index + 1} preview`} className="w-full max-w-md h-auto rounded-md" />
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ sku: '', price: 0, inStock: true, isDefault: false })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Variation
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {addonId ? 'Updating' : 'Creating'} Addon...
            </>
          ) : (
            addonId ? 'Update Addon' : 'Create Addon'
          )}
        </Button>
      </form>
    </Form>
  )
}