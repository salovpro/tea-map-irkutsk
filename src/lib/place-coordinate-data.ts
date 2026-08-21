export type PlaceCoordinateUpdate = {
  slug: string;
  lat: number;
  lng: number;
};

function coord(slug: string, lat: string, lng: string): PlaceCoordinateUpdate {
  return { slug, lat: Number(lat), lng: Number(lng) };
}

/**
 * House-level geocodes for listed venues. Sukhe-Bator places use distinct
 * buildings instead of one downtown centroid.
 */
export const PLACE_COORDINATE_UPDATES: PlaceCoordinateUpdate[] = [
  coord("sobranie-speshilova", "52.2731252", "104.2923875"),
  coord("zavarka", "52.2765632", "104.3184306"),
  coord("dyadyushka-fugo", "52.2821963", "104.2590692"),
  coord("knyaz-gvidon", "52.2831743", "104.2858043"),
  coord("baikal-severnoe-more", "52.2520097", "104.3212448"),
  coord("mangal", "52.2315254", "104.3155725"),
  coord("butin", "52.2781128", "104.2822746"),
  coord("partizan", "52.2753021", "104.2881413"),
  coord("restoran-ohotnikov", "52.2779532", "104.3365531"),
  coord("vyuga-mayak", "51.8473501", "104.8730536"),
  coord("kitayskiy-ieroglif", "52.2779532", "104.3365531"),
  coord("klyukva-baykalsk", "51.510804", "104.119368"),
  coord("evropa", "52.2746106", "104.3048839"),
  coord("kurbatov", "52.289858", "104.269127"),
  coord("pepel", "52.2855070", "104.2825261"),
  coord("cui-tea", "52.251347", "104.257373"),
  coord("kochevnik", "52.2837445", "104.2836576"),
  coord("pappare", "52.285743", "104.283373"),
  coord("la-premiere", "52.2791024", "104.2788452"),
  coord("prego", "52.2826584", "104.2847184"),
  coord("chento", "52.2756", "104.2867"),
  coord("kruzhal", "52.2756", "104.2867"),
  coord("grot-pervomayskiy", "52.2606340", "104.2415329"),
  coord("red-grot", "52.2476049", "104.3605747"),
  coord("yabloko", "52.2797443", "104.3013649"),
  coord("chempiony", "52.2840621", "104.2869573"),
];
