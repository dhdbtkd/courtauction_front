import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/api/auth/[...nextauth]/route';

/**
 * ✅ PATCH /api/notification/[id]
 * 알림 룰 활성/비활성 토글
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: ruleId } = await context.params;

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { enabled } = await req.json();

        if (typeof enabled !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const { data, error } = await supabase
            .from('notification_rules')
            .update({ enabled })
            .eq('id', ruleId)
            .eq('user_id', session.user.id)
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase PATCH error:', error.message);
            return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        console.error('❌ API PATCH Error:', e.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * ✅ DELETE /api/notification/[id]
 * 알림 룰 삭제
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: ruleId } = await context.params;

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        const { error } = await supabase
            .from('notification_rules')
            .delete()
            .eq('id', ruleId)
            .eq('user_id', session.user.id);

        if (error) {
            console.error('❌ Supabase DELETE error:', error.message);
            return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (e: any) {
        console.error('❌ API DELETE Error:', e.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
