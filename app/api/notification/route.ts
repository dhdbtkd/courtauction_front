import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/api/auth/[...nextauth]/route';

/**
 * ✅ GET /api/notification
 * 로그인 사용자의 알림 룰 목록 조회
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const { data, error } = await supabase
            .from('notification_rules')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase GET error:', error.message);
            return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
        }

        return NextResponse.json(data ?? [], { status: 200 });
    } catch (e: any) {
        console.error('❌ API GET Error:', e.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * ✅ POST /api/notification
 * 새 알림 룰 생성
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, category, sido_code, sigu_code, price_min, price_max, keyword } = body;

        if (!name || !sido_code || !sigu_code) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const { data, error } = await supabase
            .from('notification_rules')
            .insert({
                user_id: session.user.id,
                name,
                category,
                sido_code,
                sigu_code,
                price_min,
                price_max,
                keyword,
                enabled: true,
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase insert error:', error.message);
            return NextResponse.json({ error: 'Failed to insert rule' }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error('❌ API POST Error:', e.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
