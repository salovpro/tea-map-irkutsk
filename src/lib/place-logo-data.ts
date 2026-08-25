export type PlaceLogoUpdate = {
  slug: string;
  logoUrl: string;
};

/**
 * Venue logos from uploaded brand files, stored under /public/logos.
 * Synced into Place.logoUrl on public map/catalog/detail load.
 * Cache-bust `?v=` when assets are replaced so clients pick up new files.
 */
export const PLACE_LOGO_UPDATES: PlaceLogoUpdate[] = [
  {
    slug: "baikal-severnoe-more",
    logoUrl: "/logos/baikal-severnoe-more.png",
  },
  { slug: "butin", logoUrl: "/logos/butin.svg?v=3" },
  { slug: "chempiony", logoUrl: "/logos/chempiony.png?v=3" },
  { slug: "chento", logoUrl: "/logos/chento.png?v=3" },
  { slug: "evropa", logoUrl: "/logos/evropa.svg?v=3" },
  {
    slug: "grot-pervomayskiy",
    logoUrl: "/logos/grot-pervomayskiy.png?v=3",
  },
  {
    slug: "kitayskiy-ieroglif",
    logoUrl: "/logos/kitayskiy-ieroglif.jpg?v=3",
  },
  { slug: "klyukva-baykalsk", logoUrl: "/logos/klyukva-baykalsk.svg?v=3" },
  { slug: "knyaz-gvidon", logoUrl: "/logos/knyaz-gvidon.png" },
  { slug: "kochevnik", logoUrl: "/logos/kochevnik.png?v=3" },
  { slug: "kruzhal", logoUrl: "/logos/kruzhal.png?v=3" },
  { slug: "kurbatov", logoUrl: "/logos/kurbatov.png?v=3" },
  { slug: "la-premiere", logoUrl: "/logos/la-premiere.svg?v=3" },
  { slug: "pappare", logoUrl: "/logos/pappare.jpg?v=3" },
  { slug: "partizan", logoUrl: "/logos/partizan.svg?v=3" },
  { slug: "pepel", logoUrl: "/logos/pepel.svg?v=3" },
  { slug: "prego", logoUrl: "/logos/prego.png?v=3" },
  { slug: "red-grot", logoUrl: "/logos/red-grot.png?v=3" },
  {
    slug: "restoran-ohotnikov",
    logoUrl: "/logos/restoran-ohotnikov.jpg?v=3",
  },
  {
    slug: "sibirskaya-gostinaya",
    logoUrl: "/logos/sibirskaya-gostinaya.png?v=2",
  },
  { slug: "sobranie-speshilova", logoUrl: "/logos/sobranie-speshilova.png" },
  { slug: "vyuga-mayak", logoUrl: "/logos/vyuga-mayak.jpg?v=3" },
  { slug: "yabloko", logoUrl: "/logos/yabloko.jpg?v=3" },
];
