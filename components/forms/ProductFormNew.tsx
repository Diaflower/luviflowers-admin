'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import { createProduct, updateProduct } from '@/data/products'
import { fetchItems } from '@/data/categoriesOrTags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

const productSchema = z.object({
  code: z.string().optional(),
  name_en: z.string().min(2, 'Name (English) is required'),
  name_ar: z.string().min(2, 'Name (Arabic) is required'),
  slug: z.string().min(2, 'Slug is required'),
  shortDescription_en: z.string().min(2, 'Short description (English) is required'),
  shortDescription_ar: z.string().min(2, 'Short description (Arabic) is required'),
  longDescription_en: z.string().min(2, 'Long description (English) is required'),
  longDescription_ar: z.string().min(2, 'Long description (Arabic) is required'),
  metaTitle_en: z.string().optional(),
  metaTitle_ar: z.string().optional(),
  metaDescription_en: z.string().optional(),
  metaDescription_ar: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  productType: z.enum(['LONG_LIFE', 'BOUQUET', 'ARRANGEMENT', 'ACRYLIC_BOX']),
  categoryId: z.number().min(1, 'Category is required'),
  mainImage: z.object({
    image: z.any().optional(),
    altText_en: z.string().optional(),
    altText_ar: z.string().optional(),
  }),
  variations: z.array(z.object({
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional(),
    price: z.number().min(0, 'Price must be a positive number'),
    previousPrice: z.number().min(0, 'Previous price must be a positive number').optional(),
    inStock: z.boolean(),
    weight: z.number().min(0, 'Weight must be a positive number').optional(),
    sizeId: z.number().nullable(),
    infinityColorId: z.number().nullable(),
    boxColorId: z.number().nullable(),
    wrappingColorId: z.number().nullable(),
    isDefault: z.boolean(),
    image: z.object({
      image: z.any().optional(),
      altText_en: z.string().optional(),
      altText_ar: z.string().optional(),
    }).optional(),
  })).min(1, 'At least one variation is required'),
  tagIds: z.array(z.number()),
  addonIds: z.array(z.number()),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  productId?: number
  initialData?: any
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const { getToken } = useAuth()
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [variationImagePreviews, setVariationImagePreviews] = useState<(string | null)[]>([])
  const queryClient = useQueryClient()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      name_en: '',
      name_ar: '',
      slug: '',
      shortDescription_en: '',
      shortDescription_ar: '',
      longDescription_en: '',
      longDescription_ar: '',
      metaTitle_en: '',
      metaTitle_ar: '',
      metaDescription_en: '',
      metaDescription_ar: '',
      featured: false,
      status: 'DRAFT',
      productType: 'LONG_LIFE',
      categoryId: 0,
      mainImage: {
        altText_en: '',
        altText_ar: '',
      },
      variations: [{
        sku: '',
        price: 0,
        inStock: true,
        isDefault: true,
        sizeId: null,
        infinityColorId: null,
        boxColorId: null,
        wrappingColorId: null,
      }],
      tagIds: [],
      addonIds: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variations',
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        categoryId: initialData.category?.id,
        tagIds: initialData.tags?.map((tag: { id: number }) => tag.id) || [],
        addonIds: initialData.addons?.map((addon: { id: number }) => addon.id) || [],
        variations: initialData.variations?.map((v: any) => ({
          ...v,
          price: parseFloat(v.price.toString()),
          previousPrice: v.previousPrice ? parseFloat(v.previousPrice.toString()) : undefined,
        })) || [],
      })
      setMainImagePreview(initialData.mainImage?.url || null)
      setVariationImagePreviews(initialData.variations?.map((v: any) => v.image?.url || null) || [])
    }
  }, [initialData, form])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('categories', 1, 100, token)
    },
  })

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('tags', 1, 100, token)
    },
  })

  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('addons', 1, 100, token)
    },
  })

  const { data: sizes } = useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('productSizes', 1, 100, token)
    },
  })

  const { data: infinityColors } = useQuery({
    queryKey: ['infinityColors'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('infinityColors', 1, 100, token)
    },
  })

  const { data: boxColors } = useQuery({
    queryKey: ['boxColors'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('boxColors', 1, 100, token)
    },
  })

  const { data: wrappingColors } = useQuery({
    queryKey: ['wrappingColors'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      return fetchItems('wrappingColors', 1, 100, token)
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const token = await getToken()
      if (!token) throw new Error('No authentication token available')
      if (productId) {
        console.log("i")
        return updateProduct(productId, data, token)
      } else {
        return createProduct(data, token)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: productId ? 'Product updated successfully' : 'Product created successfully' })
      if (!productId) {
        form.reset()
        setMainImagePreview(null)
        setVariationImagePreviews([])
      }
    },
    onError: (error) => {
      console.error('Error saving product:', error)
      toast({ title: `Failed to ${productId ? 'update' : 'create'} product`, variant: 'destructive' })
    },
  })

  const onSubmit = async (data: ProductFormValues) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'mainImage') {
        const mainImage = value as ProductFormValues['mainImage']
        if (mainImage.image instanceof File) {
          formData.append('mainImage', mainImage.image)
        }
        formData.append('mainImageAltTextEn', mainImage.altText_en || '')
        formData.append('mainImageAltTextAr', mainImage.altText_ar || '')
      } else if (key === 'variations') {
        const variations = value as ProductFormValues['variations']
        variations.forEach((variation, index) => {
          if (variation.image?.image instanceof File) {
            formData.append(`variationImages`, variation.image.image)
            formData.append(`variationImageAltTextEn_${index}`, variation.image.altText_en || '')
            formData.append(`variationImageAltTextAr_${index}`, variation.image.altText_ar || '')
          }
        })
        formData.append('variations', JSON.stringify(variations))
      } else if (key === 'tagIds' || key === 'addonIds') {
        formData.append(key, JSON.stringify(value))
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString())
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    mutation.mutate(formData)
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
      form.setValue(`variations.${index}.image.image`, file)
      setVariationImagePreviews(prev => {
        const newPreviews = [...prev]
        newPreviews[index] = URL.createObjectURL(file)
        return newPreviews
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{productId ? 'Edit Product' : 'Create New Product'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name in English" {...field} />
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
                    <Input placeholder="Enter product name in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description (English)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter short description in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter short description in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longDescription_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description (English)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter long description in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longDescription_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter long description in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaTitle_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meta title in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaTitle_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meta title in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description (English)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter meta description in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter meta description in Arabic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Featured Product
                    </FormLabel>
                    <FormDescription>
                      This product will be displayed in featured sections
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LONG_LIFE">Long Life</SelectItem>
                      <SelectItem value="BOUQUET">Bouquet</SelectItem>
                      <SelectItem value="ARRANGEMENT">Arrangement</SelectItem>
                      <SelectItem value="ACRYLIC_BOX">Acrylic Box</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.items.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Main Image */}
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

            {/* Variations */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Variations</h3>
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-4">
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Variation {index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name={`variations.${index}.sku`}
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
                      name={`variations.${index}.barcode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter barcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variations.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter price"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variations.${index}.previousPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter previous price"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variations.${index}.inStock`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              In Stock
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variations.${index}.weight`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter weight"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variations.${index}.sizeId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))} value={field.value?.toString() || "null"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
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
                      name={`variations.${index}.infinityColorId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Infinity Color</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))} value={field.value?.toString() || "null"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an infinity color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {infinityColors?.items.map((color: any) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                {color.name_en}
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
                      name={`variations.${index}.boxColorId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Box Color</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))} value={field.value?.toString() || "null"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a box color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {boxColors?.items.map((color: any) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                {color.name_en}
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
                      name={`variations.${index}.wrappingColorId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wrapping Color</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))} value={field.value?.toString() || "null"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a wrapping color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {wrappingColors?.items.map((color: any) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                {color.name_en}
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
                      name={`variations.${index}.isDefault`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (checked) {
                                  // Uncheck other variations
                                  fields.forEach((_, i) => {
                                    if (i !== index) {
                                      form.setValue(`variations.${i}.isDefault`, false)
                                    }
                                  })
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Default Variation
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variations.${index}.image.image`}
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
                      name={`variations.${index}.image.altText_en`}
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
                      name={`variations.${index}.image.altText_ar`}
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
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  sku: '',
                  price: 0,
                  inStock: true,
                  isDefault: false,
                  sizeId: null,
                  infinityColorId: null,
                  boxColorId: null,
                  wrappingColorId: null,
                })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Variation
              </Button>
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    {tags?.items.map((tag: any) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={field.value.includes(tag.id)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...field.value, tag.id]
                              : field.value.filter((id: number) => id !== tag.id)
                            field.onChange(updatedValue)
                          }}
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {tag.name_en}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Addons */}
            <FormField
              control={form.control}
              name="addonIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Addons</FormLabel>
                  <div className="space-y-2">
                    {addons?.items.map((addon: any) => (
                      <div key={addon.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`addon-${addon.id}`}
                          checked={field.value.includes(addon.id)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...field.value, addon.id]
                              : field.value.filter((id: number) => id !== addon.id)
                            field.onChange(updatedValue)
                          }}
                        />
                        <label
                          htmlFor={`addon-${addon.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {addon.name_en}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {productId ? 'Updating' : 'Creating'} Product...
                </>
              ) : (
                productId ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
