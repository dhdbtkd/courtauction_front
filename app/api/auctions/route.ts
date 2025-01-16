import { createClient } from '../../utils/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('auctions').select('*').order('created_at', { ascending: false });

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
