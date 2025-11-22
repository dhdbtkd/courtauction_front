import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data, error } = await supabase
        .from('notifications_log')
        .select(
            `
            id,
            rule_id,
            auction_id,
            message,
            sent_at,
            auction:auction_id (
                id,
                address,
                category,
                area,
                estimated_price,
                minimum_price,
                auction_date,
                failed_auction_count,
                status,
                thumbnail_src
            )
        `
        )
        .eq('rule_id', id)
        .order('sent_at', { ascending: false });

    if (error) {
        console.error('❌ Join Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}
