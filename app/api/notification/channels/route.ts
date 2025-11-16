import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';

/**
 * ✅ GET /api/notification/channels
 * 로그인한 사용자의 알림 채널 목록 조회 (UUID 기반)
 */
export async function GET() {
    try {
        // 1️⃣ NextAuth 세션 확인
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2️⃣ Supabase 서비스 클라이언트 생성 (RLS 우회)
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // 3️⃣ 해당 user_id(uuid)로 채널 목록 조회
        const { data: channels, error } = await supabase
            .from('notification_channels')
            .select('id, type, identifier, enabled, created_at')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching notification channels:', error.message);
            return NextResponse.json({ error: 'Failed to fetch notification channels' }, { status: 500 });
        }

        // 4️⃣ 성공 응답
        return NextResponse.json(channels ?? []);
    } catch (err: any) {
        console.error('❌ Unexpected error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
