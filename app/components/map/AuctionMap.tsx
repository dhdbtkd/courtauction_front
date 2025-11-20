// 'use client';

// import { useEffect, useRef } from 'react';
// import mapboxgl from 'mapbox-gl';

// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// interface AuctionItem {
//     id: string;
//     lat: number;
//     lng: number;
//     price: number;
//     address: string;
// }

// interface Props {
//     items: AuctionItem[];
// }

// export default function AuctionMap({ items }: Props) {
//     const mapContainer = useRef<HTMLDivElement>(null);
//     const mapRef = useRef<mapboxgl.Map | null>(null);

//     useEffect(() => {
//         if (!mapContainer.current || mapRef.current) return;
//         mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
//         // 🌍 지도 초기화
//         const map = new mapboxgl.Map({
//             container: mapContainer.current,
//             style: 'mapbox://styles/mapbox/light-v11',
//             center: [127.0, 37.5],
//             zoom: 9,
//             pitch: 0,
//             bearing: 0,
//             antialias: true, // smoother
//         });

//         mapRef.current = map;

//         // 🏷️ 데이터 소스 추가
//         map.on('load', () => {
//             map.addSource('auctions', {
//                 type: 'geojson',
//                 data: {
//                     type: 'FeatureCollection',
//                     features: items.map((item) => ({
//                         type: 'Feature',
//                         properties: {
//                             id: item.id,
//                             price: item.price,
//                             address: item.address,
//                         },
//                         geometry: {
//                             type: 'Point',
//                             coordinates: [item.lng, item.lat],
//                         },
//                     })),
//                 },
//                 cluster: true,
//                 clusterMaxZoom: 14,
//                 clusterRadius: 50,
//             });

//             // 🔵 클러스터 원
//             map.addLayer({
//                 id: 'clusters',
//                 type: 'circle',
//                 source: 'auctions',
//                 filter: ['has', 'point_count'],
//                 paint: {
//                     'circle-color': [
//                         'step',
//                         ['get', 'point_count'],
//                         '#A7F3D0', // small
//                         50,
//                         '#6EE7B7', // medium
//                         100,
//                         '#34D399', // large
//                         300,
//                         '#10B981', // huge
//                     ],
//                     'circle-radius': ['step', ['get', 'point_count'], 18, 50, 25, 100, 32, 300, 40],
//                 },
//             });

//             // 🔢 클러스터 텍스트 라벨
//             map.addLayer({
//                 id: 'cluster-count',
//                 type: 'symbol',
//                 source: 'auctions',
//                 filter: ['has', 'point_count'],
//                 layout: {
//                     'text-field': '{point_count}개',
//                     'text-size': 12,
//                 },
//                 paint: {
//                     'text-color': '#065F46',
//                 },
//             });

//             // 💰 개별 매물 (가격 라벨 마커)
//             map.addLayer({
//                 id: 'unclustered-point',
//                 type: 'symbol',
//                 source: 'auctions',
//                 filter: ['!', ['has', 'point_count']],
//                 layout: {
//                     'text-field': ['format', ['get', 'price'], { 'font-scale': 0.9 }],
//                     'text-size': 12,
//                     'text-offset': [0, 0.6],
//                     'text-anchor': 'top',
//                 },
//                 paint: {
//                     'text-color': '#1F2937',
//                     'text-halo-color': 'white',
//                     'text-halo-width': 1.5,
//                 },
//             });

//             // ✴ 클릭하면 확대
//             map.on('click', 'clusters', (e) => {
//                 const features = map.queryRenderedFeatures(e.point, {
//                     layers: ['clusters'],
//                 });
//                 const clusterId = features[0].properties?.cluster_id;

//                 if (!clusterId) return;

//                 (map.getSource('auctions') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
//                     clusterId,
//                     (err, zoom) => {
//                         if (err) return;
//                         map.easeTo({
//                             center: (features[0].geometry as any).coordinates,
//                             zoom,
//                         });
//                     }
//                 );
//             });

//             // ⭐ 개별 매물 클릭: 팝업 표시
//             map.on('click', 'unclustered-point', (e) => {
//                 const feature = e.features?.[0];
//                 if (!feature) return;

//                 const { price, address } = feature.properties!;
//                 const [lng, lat] = feature.geometry.coordinates;

//                 new mapboxgl.Popup()
//                     .setLngLat([lng, lat])
//                     .setHTML(
//                         `
//             <div style="font-size: 14px;">
//                 <strong>${Number(price).toLocaleString()}원</strong><br/>
//                 <span>${address}</span>
//             </div>
//           `
//                     )
//                     .addTo(map);
//             });

//             // 커서 변경
//             map.on('mouseenter', 'clusters', () => {
//                 map.getCanvas().style.cursor = 'pointer';
//             });
//             map.on('mouseleave', 'clusters', () => {
//                 map.getCanvas().style.cursor = '';
//             });
//         });

//         return () => {
//             map.remove();
//         };
//     }, [items]);

//     return <div ref={mapContainer} className="w-full h-[600px] rounded-xl overflow-hidden" />;
// }
