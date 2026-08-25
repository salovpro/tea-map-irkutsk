export type PlaceLogoUpdate = {
  slug: string;
  logoUrl: string;
};

/**
 * Venue logos from uploaded brand files, stored under /public/logos.
 * Synced into Place.logoUrl on public map/catalog/detail load.
 */
export const PLACE_LOGO_UPDATES: PlaceLogoUpdate[] = [
  {
    slug: "baikal-severnoe-more",
    logoUrl: "/logos/baikal-severnoe-more.png",
  },
  { slug: "butin", logoUrl: "/logos/butin.svg" },
  { slug: "chempiony", logoUrl: "/logos/chempiony.png" },
  { slug: "chento", logoUrl: "/logos/chento.png?v=2" },
  { slug: "evropa", logoUrl: "/logos/evropa.svg" },
  {
    slug: "grot-pervomayskiy",
    logoUrl: "/logos/grot-pervomayskiy.png?v=2",
  },
  { slug: "kitayskiy-ieroglif", logoUrl: "/logos/kitayskiy-ieroglif.jpg" },
  { slug: "klyukva-baykalsk", logoUrl: "/logos/klyukva-baykalsk.svg" },
  { slug: "knyaz-gvidon", logoUrl: "/logos/knyaz-gvidon.png" },
  { slug: "kochevnik", logoUrl: "/logos/kochevnik.png" },
  { slug: "kruzhal", logoUrl: "/logos/kruzhal.png?v=2" },
  { slug: "kurbatov", logoUrl: "/logos/kurbatov.png?v=2" },
  { slug: "la-premiere", logoUrl: "/logos/la-premiere.svg" },
  { slug: "pappare", logoUrl: "/logos/pappare.jpg" },
  { slug: "partizan", logoUrl: "/logos/partizan.svg?v=2" },
  { slug: "pepel", logoUrl: "/logos/pepel.svg?v=2" },
  { slug: "prego", logoUrl: "/logos/prego.png?v=2" },
  { slug: "red-grot", logoUrl: "/logos/red-grot.png?v=2" },
  { slug: "restoran-ohotnikov", logoUrl: "/logos/restoran-ohotnikov.jpg" },
  {
    slug: "sibirskaya-gostinaya",
    logoUrl: "/logos/sibirskaya-gostinaya.png?v=2",
  },
  { slug: "sobranie-speshilova", logoUrl: "/logos/sobranie-speshilova.png" },
  { slug: "vyuga-mayak", logoUrl: "/logos/vyuga-mayak.jpg" },
  { slug: "yabloko", logoUrl: "/logos/yabloko.jpg" },
];
