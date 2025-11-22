import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sidoCodeStr = searchParams.get('sido_code');
    const siguCodeStr = searchParams.get('sigu_code');
    const search = searchParams.get('search');

    // 🔥 추가
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 12);

    try {
        let query = supabase.from('auctions').select('*', { count: 'exact' });

        if (category) query = query.eq('category', category);
        if (status) query = query.eq('status', status);

        if (sidoCodeStr) query = query.eq('sido_code', sidoCodeStr);
        if (siguCodeStr) query = query.eq('sigu_code', siguCodeStr.slice(2));

        if (search) {
            query = query.ilike('address', `%${search}%`);
        }

        // 격 필터 추가
        if (minPrice) {
            query = query.gte('minimum_price', Number(minPrice) * 10000);
        }

        if (maxPrice) {
            query = query.lte('minimum_price', Number(maxPrice) * 10000);
        }
        if (minArea) query.gte('area', minArea);
        if (maxArea) query.lte('area', maxArea);

        query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching auctions:', error);
            return NextResponse.json(
                { message: error.message, details: error.details, code: error.code },
                { status: 500 }
            );
        }

        return NextResponse.json({ items: data, total: count || 0 });
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ message: err.message || '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
