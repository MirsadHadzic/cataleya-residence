// actions/apartments.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/auth'

export type AptFormState = { success: boolean; message: string; errors?: Record<string, string[]> }

const aptSchema = z.object({
  name:           z.string().min(2, 'Name required'),
  internalName:   z.string().optional(), // admin-only reference, not shown to guests
  slug:           z.string().min(2, 'Slug required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  tagline:        z.string().optional(),
  description:    z.string().min(10, 'Description required'),
  longDescription: z.string().optional(),
  pricePerNight:  z.coerce.number().min(1, 'Price required'),
  maxGuests:      z.coerce.number().min(1),
  bedrooms:       z.coerce.number().min(0),
  bathrooms:      z.coerce.number().min(1),
  size:           z.coerce.number().optional(),
  location:       z.string().min(2, 'Location required'),
  amenities:      z.string().default(''),
  images:         z.string().default(''),
  featured:       z.string().optional(),
  active:         z.string().optional(),
})

function parseApartmentData(raw: Record<string, unknown>) {
  const validated = aptSchema.safeParse(raw)
  if (!validated.success) return { ok: false as const, errors: validated.error.flatten().fieldErrors }

  const { amenities, images, featured, active, internalName, ...rest } = validated.data

  return {
    ok: true as const,
    data: {
      ...rest,
      internalName: internalName || null,
      amenities: amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images: images.split('\n').map((s) => s.trim()).filter(Boolean),
      featured: featured === 'true',
      active: active === 'true',
    },
  }
}

export async function createApartmentAction(
  _prev: AptFormState,
  formData: FormData
): Promise<AptFormState> {
  await verifyAdminSession()

  const raw = Object.fromEntries(formData.entries())
  const parsed = parseApartmentData(raw)

  if (!parsed.ok) {
    return { success: false, message: 'Please fix the errors below.', errors: parsed.errors }
  }

  // Check slug uniqueness
  const existing = await prisma.apartment.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) {
    return { success: false, message: 'An apartment with this slug already exists.', errors: { slug: ['Slug must be unique'] } }
  }

  await prisma.apartment.create({ data: parsed.data })

  revalidatePath('/')
  revalidatePath('/apartments')
  revalidatePath('/admin/apartments')
  redirect('/admin/apartments')
}

export async function updateApartmentAction(
  id: string,
  _prev: AptFormState,
  formData: FormData
): Promise<AptFormState> {
  await verifyAdminSession()

  const raw = Object.fromEntries(formData.entries())
  const parsed = parseApartmentData(raw)

  if (!parsed.ok) {
    return { success: false, message: 'Please fix the errors below.', errors: parsed.errors }
  }

  // Check slug uniqueness (excluding self)
  const existing = await prisma.apartment.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (existing) {
    return { success: false, message: 'An apartment with this slug already exists.', errors: { slug: ['Slug must be unique'] } }
  }

  await prisma.apartment.update({ where: { id }, data: parsed.data })

  revalidatePath('/')
  revalidatePath('/apartments')
  revalidatePath(`/apartments/${parsed.data.slug}`)
  revalidatePath('/admin/apartments')
  return { success: true, message: 'Apartment updated successfully.' }
}

export async function deleteApartmentAction(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.apartment.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/apartments')
  revalidatePath('/admin/apartments')
}