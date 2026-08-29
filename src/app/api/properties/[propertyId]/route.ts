import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updatePropertySchema } from '@/lib/validations/property';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        landlord: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const formatted = {
      id: property.id,
      title: property.title,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      type: property.type,
      description: property.description,
      images: property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
      amenities: property.amenities,
      status: property.status,
      landlordId: property.landlordId,
      landlordName: property.landlord.displayName || 'Property Manager',
      createdAt: property.createdAt.toISOString(),
      requirements: {
        minIncome: property.minIncome,
        requireBackground: property.requireBackground,
        requireEmployment: property.requireEmployment,
        verificationFee: property.verificationFee,
      },
      applicationCount: property._count.applications,
    };

    return NextResponse.json({ status: 'ok', property: formatted });
  } catch (error) {
    console.error('Error fetching property details:', error);
    return NextResponse.json({ error: 'Failed to fetch property details' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Only landlords can update properties' }, { status: 403 });
    }

    const { propertyId } = await params;

    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Prevent horizontal privilege escalation
    if (existingProperty.landlordId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this property' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = updatePropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: parsed.data,
      include: {
        landlord: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    const formatted = {
      id: updated.id,
      title: updated.title,
      address: updated.address,
      city: updated.city,
      state: updated.state,
      zip: updated.zip,
      price: updated.price,
      beds: updated.beds,
      baths: updated.baths,
      sqft: updated.sqft,
      type: updated.type,
      description: updated.description,
      images: updated.images,
      amenities: updated.amenities,
      status: updated.status,
      landlordId: updated.landlordId,
      landlordName: updated.landlord.displayName || 'Property Manager',
      createdAt: updated.createdAt.toISOString(),
      requirements: {
        minIncome: updated.minIncome,
        requireBackground: updated.requireBackground,
        requireEmployment: updated.requireEmployment,
        verificationFee: updated.verificationFee,
      },
    };

    return NextResponse.json({ status: 'ok', property: formatted });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Only landlords can delete properties' }, { status: 403 });
    }

    const { propertyId } = await params;

    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existingProperty.landlordId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this property' }, { status: 403 });
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({ status: 'ok', message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}

