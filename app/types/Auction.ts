export interface Auction {
    id: number | string;
    court: string | null;
    case_id: string | null;
    category: string | null;
    address: string | null;
    area: number | null;
    estimated_price: number | null; // DB: estimated_price
    minimum_price: number | null; // DB: minimum_price
    etc: string | null;
    created_at: string; // or Date
    updated_at: string | null; // or Date | null
    status: string | null;
    auction_date: string | null; // or Date | null
    failed_auction_count: number | null; // DB: failed_auction_count
    sido_code: string | null;
    sigu_code: string | null;
    sold_price: number | null;
    sold_date: string | null; // or Date | null
    thumbnail_src: string | null; // DB: thumbnail_src
}
