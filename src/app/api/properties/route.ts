import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPropertySchema } from '@/lib/validations/property';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds = searchParams.get('beds');
    const landlordId = searchParams.get('landlordId');
    const query = searchParams.get('q');
    const sortBy = searchParams.get('sortBy');

    const where: any = {};

    if (landlordId) {
      where.landlordId = landlordId;
    } else {
      where.status = 'active';
    }

    if (city && city !== 'all') {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (type && type !== 'all') {
      where.type = { equals: type, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    if (beds && beds !== 'all') {
      if (beds === 'studio' || beds === '0') {
        where.beds = 0;
      } else if (beds === '3+') {
        where.beds = { gte: 3 };
      } else {
        where.beds = parseInt(beds);
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { zip: { contains: query } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const properties = await prisma.property.findMany({
      where,
      orderBy,
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

    const formatted = properties.map((p) => ({
      id: p.id,
      title: p.title,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      price: p.price,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft,
      type: p.type,
      description: p.description,
      images: p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
      amenities: p.amenities,
      status: p.status,
      landlordId: p.landlordId,
      landlordName: p.landlord.displayName || 'Property Manager',
      createdAt: p.createdAt.toISOString(),
      requirements: {
        minIncome: p.minIncome,
        requireBackground: p.requireBackground,
        requireEmployment: p.requireEmployment,
        verificationFee: p.verificationFee,
      },
      applicationCount: p._count.applications,
    }));

    return NextResponse.json({ status: 'ok', properties: formatted });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Only landlords can create property listings' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = createPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    const property = await prisma.property.create({
      data: {
        title: data.title,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        price: data.price,
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        type: data.type,
        description: data.description,
        images: data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
        amenities: data.amenities,
        status: data.status || 'active',
        minIncome: data.minIncome,
        requireBackground: data.requireBackground,
        requireEmployment: data.requireEmployment,
        verificationFee: data.verificationFee,
        landlordId: session.user.id,
      },
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
      images: property.images,
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
    };

    return NextResponse.json({ status: 'created', property: formatted }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

