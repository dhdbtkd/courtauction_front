import { Auction } from '../types/Auction';
import Image from 'next/image';

export const AuctionRow = ({ auction }: { auction: Auction }) => {
    console.log('🚀 ~ AuctionRow ~ auction:', auction);
    function formatDate(dateString: string): string {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = date.getMonth() + 1; // months are 0-based, so we add 1
        const day = date.getDate();

        return `${year}년${month}월${day}일`;
    }

    return (
        <li
            className="grid grid-cols-11 gap-2 text-xs py-2 border-b border-gray-100 my-0.5"
            key={auction.id}
            data-sidocode={auction.sido_code}
            data-sigucode={auction.sigu_code}
        >
            <Image
                src={auction.thumbnail_src ?? '/default.jpg'}
                alt={`Image of ${auction.case_id}`} // alt description
                width={300} // Set the width of the image
                height={300} // Set the height of the image
                className="aspect-video object-cover rounded-lg col-span-2 w-auto h-auto"
            />
            <div className="mx-2">{auction.court}</div>
            <div className="mx-2">{auction.case_id?.replace('타경', '-') ?? '-'}</div>
            <div className="mx-2 col-span-2">{auction.address}</div>

            <div className="mx-2">{auction.area != null ? `${auction.area.toFixed(1)} m²` : '-'}</div>
            <div className="mx-2">
                {auction.estimated_price != null ? (auction.estimated_price / 10000).toLocaleString() + ' 만원' : '-'}
            </div>
            <div className="mx-2">
                {auction.minimum_price != null ? (auction.minimum_price / 10000).toLocaleString() + '만원' : '-'}
            </div>
            <div className="mx-2 text-center">
                {auction.status}
                {auction.status !== '신건' && (
                    <div className={`text-[0.65rem]  flex items-center justify-center`}>
                        <div className="bg-rose-400 text-white rounded px-2 py-0.5 text-center">
                            {auction.failed_auction_count} 회
                        </div>
                    </div>
                )}
            </div>

            <div className="mx-2">{formatDate(auction.created_at)}</div>
        </li>
    );
};
