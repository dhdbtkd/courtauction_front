import { Auction } from '../types/Auction';
import Image from 'next/image';

export const AuctionRow = ({ auction }: { auction: Auction }) => {
    console.log(auction);

    function formatDate(dateString: string): string {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = date.getMonth() + 1; // months are 0-based, so we add 1
        const day = date.getDate();

        return `${year}년${month}월${day}일`;
    }

    return (
        <li
            className="grid grid-cols-10 gap-2 text-xs py-0.5"
            key={auction.id}
            data-sidocode={auction.sido_code}
            data-sigucode={auction.sigu_code}
        >
            <Image
                src={auction.thumbnail_src} // Path to your image in the "public" folder
                alt={`Image of ${auction.case_id}`} // alt description
                width={500} // Set the width of the image
                height={300} // Set the height of the image
                objectFit="cover" // Set the object-fit property of the image
            />
            <div className="mx-2">{auction.court}</div>
            <div className="mx-2">{auction.case_id.replace('타경', '-')}</div>
            <div className="mx-2 col-span-2">{auction.address}</div>

            <div className="mx-2">{auction.area.toFixed(1)} m2</div>
            <div className="mx-2">{(auction.estimated_price / 10000).toLocaleString()} 만원</div>
            <div className="mx-2">{(auction.minimum_price / 10000).toLocaleString()} 만원</div>
            <div className="mx-2">{auction.status}</div>

            <div className="mx-2">{formatDate(auction.created_at)}</div>
        </li>
    );
};
