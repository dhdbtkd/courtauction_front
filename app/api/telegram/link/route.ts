import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/api/auth/[...nextauth]/route';
import { randomUUID } from 'crypto';

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const token = randomUUID();

    const { error } = await supabase.from('users').update({ telegram_auth_token: token }).eq('id', session.user.id);

    if (error) {
        console.error('❌ Failed to update Telegram token:', error.message);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    const botName = process.env.TELEGRAM_BOT_NAME || 'YourAuctionBot';
    const telegramLink = `https://t.me/${botName}?start=${token}`;

    return NextResponse.json({ telegram_link: telegramLink });
}
