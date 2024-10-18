import * as z from 'zod'

export const productFormSchema = z.object({
  code: z.string().optional(),
  name_en: z.string().min(2, 'Name (EN) is required'),
  name_ar: z.string().min(2, 'Name (AR) is required'),
  slug: z.string().min(2, 'Slug is required'),
  shortDescription_en: z.string().min(10, 'Short description (EN) is required'),
  shortDescription_ar: z.string().min(10, 'Short description (AR) is required'),
  longDescription_en: z.string().min(20, 'Long description (EN) is required'),
  longDescription_ar: z.string().min(20, 'Long description (AR) is required'),
  metaTitle_en: z.string().optional(),
  metaTitle_ar: z.string().optional(),
  metaDescription_en: z.string().optional(),
  metaDescription_ar: z.string().optional(),
  featured: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  productType: z.enum(['LONG_LIFE', 'BOUQUET', 'ARRANGEMENT', 'ACRYLIC_BOX']),
  categoryId: z.number().nullable(),

  mainImage: z.object({
    image: z.any().nullable(),
    altText_en: z.string().optional().nullable(),
    altText_ar: z.string().optional().nullable(),
  }),
  variations: z.array(z.object({
    sku: z.string(),
    barcode: z.string().optional().nullable(),
    price: z.number().min(0),
    previousPrice: z.number().min(0).optional().nullable(),
    inStock: z.boolean(),
    weight: z.number().optional().nullable(),
    sizeId: z.number().optional().nullable(),
    infinityColorId: z.number().optional().nullable(),
    boxColorId: z.number().optional().nullable(),
    wrappingColorId: z.number().optional().nullable(),
    isDefault: z.boolean(),
    image: z.object({
      image: z.any().nullable(),
      altText_en: z.string().optional().nullable(),
      altText_ar: z.string().optional().nullable(),
    }).optional().nullable(),
  })),
  tagIds: z.array(z.number()),
  addonIds: z.array(z.number()),
})


export type ProductFormData = z.infer<typeof productFormSchema>