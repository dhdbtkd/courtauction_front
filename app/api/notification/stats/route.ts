// /app/api/notification/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

/**
 * 📌 이번 주 월요일 00:00을 구하는 함수
 * (일요일은 0 → 월요일은 1로 계산해서 주 시작 기준을 월요일로 맞춤)
 */
function getStartOfWeek() {
    const now = new Date();
    const day = now.getDay(); // 0=일, 1=월, ..., 6=토
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 월요일 날짜로 조정
    return new Date(now.setDate(diff));
}

/**
 * 📌 GET /api/notification/stats
 * 로그인 사용자의 알림 통계 정보 조회
 */
export async function GET(req: NextRequest) {
    try {
        // --- 1. 로그인 여부 확인 ---
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const userId = session.user.id;

        // ---------------------------
        // ✅ 2. 활성 알림 수 조회
        // ---------------------------
        const { data: activeRules, error: ruleErr } = await supabase
            .from('notification_rules')
            .select('id')
            .eq('user_id', userId)
            .eq('enabled', true);

        if (ruleErr) {
            console.error('❌ 활성 알림 조회 오류:', ruleErr.message);
            return NextResponse.json({ error: '알림 정보를 불러오지 못했습니다.' }, { status: 500 });
        }

        const activeAlerts = activeRules?.length ?? 0;

        // ---------------------------
        // ✅ 3. 전체 매칭된 알림 횟수
        // ---------------------------
        const { count: totalMatches, error: countErr } = await supabase
            .from('notifications_log')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countErr) {
            console.error('❌ 전체 매칭 건수 조회 오류:', countErr.message);
            return NextResponse.json({ error: '알림 로그를 불러오지 못했습니다.' }, { status: 500 });
        }

        // ---------------------------
        // ✅ 4. 이번 주 알림 발생 횟수
        // ---------------------------
        const startOfWeek = getStartOfWeek().toISOString();

        const { count: thisWeekCount, error: weekErr } = await supabase
            .from('notifications_log')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startOfWeek);

        if (weekErr) {
            console.error('❌ 이번 주 알림 조회 오류:', weekErr.message);
            return NextResponse.json({ error: '이번 주 알림 로그 조회 실패' }, { status: 500 });
        }

        // ---------------------------
        // ✅ 최종 응답
        // ---------------------------
        return NextResponse.json(
            {
                active_alerts: activeAlerts,
                total_matches: totalMatches ?? 0,
                this_week: thisWeekCount ?? 0,
            },
            { status: 200 }
        );
    } catch (e: any) {
        console.error('❌ 알림 통계 API 오류:', e.message);
        return NextResponse.json({ error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}
