'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { API_URL } from '@/lib/staticData'
import { Category ,ProductSize,InfinityColor,BoxColor,WrappingColor,ProductTag,Addon } from '@/types/types'
import { productFormSchema } from '@/data/schemas/productSchema'
type ProductType = 'LONG_LIFE' | 'BOUQUET' | 'ARRANGEMENT' | 'ACRYLIC_BOX'
type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'


const formSchema = productFormSchema
export default function ProductForm({ productId }: { productId?: number }) {
  const { getToken } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [infinityColors, setInfinityColors] = useState<InfinityColor[]>([])
  const [boxColors, setBoxColors] = useState<BoxColor[]>([])
  const [wrappingColors, setWrappingColors] = useState<WrappingColor[]>([])
  const [tags, setTags] = useState<ProductTag[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [variationImagePreviews, setVariationImagePreviews] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
      status: 'DRAFT' as ProductStatus,
      productType: 'LONG_LIFE' as ProductType,
      categoryId: null,
      mainImage: {
        image: null,
        altText_en: '',
        altText_ar: '',
      },
      variations: [{ 
        sku: '', 
        price: 0, 
        inStock: true, 
        isDefault: true,
      }],
      tagIds: [],
      addonIds: [],
    },
  })

  console.log("form erros",form.formState.errors)

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  })

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken()
      if (!token) return

      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }

      try {
        const [
          categoriesRes,
          sizesRes,
          infinityColorsRes,
          boxColorsRes,
          wrappingColorsRes,
          tagsRes,
          addonsRes
        ] = await Promise.all([
          axios.get(`${API_URL}/categories/getAll`, axiosConfig),
          axios.get(`${API_URL}/productSizes/getAll`, axiosConfig),
          axios.get(`${API_URL}/infinitycolors/getAll`, axiosConfig),
          axios.get(`${API_URL}/boxcolors/getAll`, axiosConfig),
          axios.get(`${API_URL}/wrappingcolors/getAll`, axiosConfig),
          axios.get(`${API_URL}/tags/getAll`, axiosConfig),
          axios.get(`${API_URL}/addons/getAll`, axiosConfig)
        ])

        setCategories(categoriesRes.data.items)
        setSizes(sizesRes.data.items)
        setInfinityColors(infinityColorsRes.data.items)
        setBoxColors(boxColorsRes.data.items)
        setWrappingColors(wrappingColorsRes.data.items)
        setTags(tagsRes.data.items)
        setAddons(addonsRes.data.items)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [getToken])


  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        const token = await getToken()
        if (!token) return
  
        try {
          const response = await axios.get(`${API_URL}/products/getById/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          const product = response.data
          
          product.variations = product.variations.map((variation: any) => ({
            ...variation,
            price: Number(variation.price),
            previousPrice: variation.previousPrice ? Number(variation.previousPrice) : null,
            weight: variation.weight ? Number(variation.weight) : null,
            sizeId: variation.sizeId || null,
            infinityColorId: variation.infinityColorId || null,
            boxColorId: variation.boxColorId || null,
            wrappingColorId: variation.wrappingColorId || null,
            barcode: variation.barcode || null,
            image: variation.image ? {
              image: variation.image.url,
              altText_en: variation.image.altText_en || '',
              altText_ar: variation.image.altText_ar || '',
            } : null,
          }))
          product.categoryId = product.categoryId ? Number(product.categoryId) : null
          product.tagIds = product.tags.map((tag: ProductTag) => tag.id)
          product.addonIds = product.addons.map((addon: Addon) => addon.id)
          product.mainImage = product.mainImage ? {
            image: product.mainImage.url,
            altText_en: product.mainImage.altText_en || '',
            altText_ar: product.mainImage.altText_ar || '',
          } : null
          
          form.reset(product)
          if (product.mainImage?.image) {
            setMainImagePreview(product.mainImage.image)
          }
          setVariationImagePreviews(product.variations.map((v: any) => v.image?.image || ''))
        } catch (error) {
          console.error('Error fetching product:', error)
        }
      }
    }
  
    fetchProduct()
  }, [productId, getToken, form])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const token = await getToken()
    if (!token) return

    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'variations' || key === 'tagIds' || key === 'addonIds') {
        formData.append(key, JSON.stringify(value))
      } else if (key === 'mainImage') {
        const mainImage = value as { image: File | string | null; altText_en?: string; altText_ar?: string };
        if (mainImage.image instanceof File) {
          formData.append('mainImage', mainImage.image)
        } else if (typeof mainImage.image === 'string') {
          formData.append('mainImageUrl', mainImage.image)
        }
        formData.append('mainImageAltTextEn', mainImage.altText_en || '')
        formData.append('mainImageAltTextAr', mainImage.altText_ar || '')
      } else {
        formData.append(key, String(value))
      }
    })
  
    data.variations.forEach((variation, index) => {
      if (variation.image?.image instanceof File) {
        formData.append(`variationImage`, variation.image.image)
      } else if (typeof variation.image?.image === 'string') {
        formData.append(`variationImageUrl_${index}`, variation.image.image)
      }
      formData.append(`variationImageAltTextEn_${index}`, variation.image?.altText_en || '')
      formData.append(`variationImageAltTextAr_${index}`, variation.image?.altText_ar || '')
    })

    try {
      const url = productId
        ? `${API_URL}/products/update/${productId}`
        : `${API_URL}/products/create`

      const response = await axios({
        method: productId ? 'put' : 'post',
        url: url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.status === 200 || response.status === 201) {
        router.push('/products')
      } else {
        console.error('Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue('mainImage.image', file)
    }
  }

  const renderVariationFields = (index: number) => {
    return (
      <>
        <FormField
          control={form.control}
          name={`variations.${index}.sku`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input 
                  {...field} 
                  value={field.value ?? ''} 
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
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
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
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
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
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
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  value={field.value ?? ''}
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">In Stock</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variations.${index}.sizeId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <Select onValueChange={(value) => field.onChange(value !== "null" ? parseInt(value) : null)} value={field.value?.toString() || "null"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {sizes.map((size) => (
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
              <Select onValueChange={(value) => field.onChange(value !== "null" ? parseInt(value) : null)} value={field.value?.toString() || "null"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an infinity color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {infinityColors.map((color) => (
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
              <Select onValueChange={(value) => field.onChange(value !== "null" ? parseInt(value) : null)} value={field.value?.toString() || "null"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a box color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {boxColors.map((color) => (
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
              <Select onValueChange={(value) => field.onChange(value !== "null" ? parseInt(value) : null)} value={field.value?.toString() || "null"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wrapping color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {wrappingColors.map((color) => (
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
        name={`variations.${index}.image.image`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Variation Image</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    field.onChange(file)
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setVariationImagePreviews(prev => {
                        const newPreviews = [...prev]
                        newPreviews[index] = reader.result as string
                        return newPreviews
                      })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </FormControl>
            {variationImagePreviews[index] && (
              <Image
                src={variationImagePreviews[index]}
                alt={`Variation ${index + 1}`}
                width={100}
                height={100}
                className="mt-2"
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`variations.${index}.image.altText_en`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Variation Image Alt Text (EN)</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} />
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
            <FormLabel>Variation Image Alt Text (AR)</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      </>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Name (EN)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Name (AR)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                  <FormLabel>Short Description (EN)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Short Description (AR)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Long Description (EN)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Long Description (AR)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Meta Title (EN)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Meta Title (AR)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Meta Description (EN)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Meta Description (AR)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured</FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                        <SelectValue placeholder="Select a status" />
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
                        <SelectValue placeholder="Select a product type" />
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
                  <Select onValueChange={(value) => field.onChange(value !== "null" ? parseInt(value) : null)} value={field.value?.toString() || "null"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      {categories.map((category) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Main Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="mainImage.image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                    />
                  </FormControl>
                  {mainImagePreview && (
                    <Image
                      src={mainImagePreview}
                      alt="Main product image"
                      width={100}
                      height={100}
                      className="mt-2"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mainImage.altText_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Image Alt Text (EN)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
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
                  <FormLabel>Main Image Alt Text (AR)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variations</CardTitle>
          </CardHeader>
          <CardContent>
            {fields.map((field, index) => (
              <div key={field.id} className="mb-4 p-4 border rounded">
                <h4 className="text-lg font-semibold mb-2">Variation {index + 1}</h4>
                {renderVariationFields(index)}
                {index > 0 && (
                  <Button type="button" variant="destructive" onClick={() => remove(index)} className="mt-2">
                    Remove Variation
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={() => append({ 
                sku: '', 
                price: 0, 
                inStock: true, 
                isDefault: false,
              })}
              className="mt-2"
            >
              Add Variation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags and Addons</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="tagIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Tags</FormLabel>
                    <FormDescription>
                      Select the tags for this product
                    </FormDescription>
                  </div>
                  {tags.map((tag) => (
                    <FormField
                      key={tag.id}
                      control={form.control}
                      name="tagIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={tag.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, tag.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== tag.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {tag.name_en}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addonIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Addons</FormLabel>
                    <FormDescription>
                      Select the addons for this product
                    </FormDescription>
                  </div>
                  {addons.map((addon) => (
                    <FormField
                      key={addon.id}
                      control={form.control}
                      name="addonIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={addon.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(addon.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, addon.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== addon.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {addon.name_en}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit">Save Product</Button>
      </form>
    </Form>
  )
}