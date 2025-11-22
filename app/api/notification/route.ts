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

        // ✅ 1. notification_rules 조회
        const { data: rules, error: ruleError } = await supabase
            .from('notification_rules')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (ruleError) {
            console.error('❌ Supabase GET error:', ruleError.message);
            return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
        }

        // ✅ 2. notifications_log에서 각 rule별 매칭 수 조회
        const { data: logCounts, error: logError } = await supabase
            .from('notifications_log')
            .select('rule_id, count:rule_id', { count: 'exact', head: false })
            .eq('user_id', session.user.id);

        if (logError) {
            console.error('❌ Supabase log error:', logError.message);
            return NextResponse.json({ error: 'Failed to fetch log counts' }, { status: 500 });
        }

        // ✅ 3. rule_id별 count 집계
        const countMap: Record<string, number> = {};
        logCounts?.forEach((row) => {
            countMap[row.rule_id] = (countMap[row.rule_id] || 0) + 1;
        });

        // ✅ 4. match_item_count 반영해서 응답
        const enriched = (rules ?? []).map((rule) => ({
            ...rule,
            match_item_count: countMap[rule.id] ?? 0,
        }));

        return NextResponse.json(enriched, { status: 200 });
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
        const { name, category, sido_code, sigu_code, price_min, price_max, keyword, area_min, area_max } = body;

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
                area_min,
                area_max,
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
