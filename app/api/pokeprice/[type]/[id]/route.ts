import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { type, id } = await params;
  const key = searchParams.get('key');

  const POKEPRICE_BASE_URL = "https://pokemonpricetracker.com/api";

  try {
    const response = await fetch(`${POKEPRICE_BASE_URL}/${type}/${id}?key=${key}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: `Pokeprice API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from Pokeprice' }, { status: 500 });
  }
}
