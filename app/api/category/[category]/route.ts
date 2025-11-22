import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type CategoryType = 'sido' | 'sigu' | 'dong';

interface CategoryData {
    sido: {
        id: number;
        name: string;
    }[];
    sigu: {
        id: number;
        sidoId: number;
        name: string;
    }[];
    dong: {
        id: number;
        siguId: number;
        name: string;
    }[];
}

async function getDataFromSupabase(table: string) {
    const { data, error } = await supabase.from(table).select('*');

    if (error) throw error;

    // ✨ sigu만 한글 가나다순 정렬 적용
    if (table === 'sigu_code' || table === 'sigu') {
        return data.sort((a, b) => a.sigu_name.localeCompare(b.sigu_name, 'ko-KR'));
    }

    return data;
}

function isValidCategoryType(category: string): category is CategoryType {
    return ['sido', 'sigu', 'dong'].includes(category);
}

export async function GET(request: NextRequest, context: { params: Promise<{ category: string }> }) {
    try {
        const { category } = await context.params;
        console.log(category);
        if (!isValidCategoryType(category)) {
            return NextResponse.json(
                {
                    error: '유효하지 않은 카테고리입니다',
                },
                {
                    status: 200,
                }
            );
        }
        switch (category) {
            case 'sido':
                return NextResponse.json(await getDataFromSupabase('sido_code'));
            case 'sigu':
                return NextResponse.json(await getDataFromSupabase('sigu_code'));
            default:
                return NextResponse.json(await getDataFromSupabase('sido_code'));
        }
    } catch (error) {
        console.error('카테고리 처리 중 에러:', error);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
