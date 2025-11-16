import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/api/auth/[...nextauth]/route';

/**
 * ✅ GET /api/notification/logs
 * 로그인된 사용자의 알림 로그 목록 조회
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // 최신순으로 정렬하여 알림 로그 조회
        const { data, error } = await supabase
            .from('notifications_log')
            .select(
                `
        id,
        message,
        sent_at,
        is_read,
        rule_id,
        auction_id,
        notification_rules(name, category, sido_code, sigu_code)
      `
            )
            .eq('user_id', session.user.id)
            .order('sent_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('❌ Supabase GET error:', error.message);
            return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
        }

        return NextResponse.json(data ?? [], { status: 200 });
    } catch (e: any) {
        console.error('❌ API GET Error:', e.message);
        return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 });
    }
}

/**
 * ✅ PATCH /api/notification/logs
 * 여러 알림 로그를 읽음 처리 (is_read = true)
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ids } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const { data, error } = await supabase
            .from('notifications_log')
            .update({ is_read: true })
            .in('id', ids)
            .eq('user_id', session.user.id)
            .select('id, is_read');

        if (error) {
            console.error('❌ Supabase PATCH error:', error.message);
            return NextResponse.json({ error: 'Failed to update logs' }, { status: 500 });
        }

        return NextResponse.json({ updated: data.length }, { status: 200 });
    } catch (e: any) {
        console.error('❌ API PATCH Error:', e.message);
        return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 });
    }
}
