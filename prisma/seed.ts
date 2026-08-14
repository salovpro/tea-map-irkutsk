import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, Locale } from "../src/generated/prisma/client";
import { registeredVenues, type SeedPlace } from "./data/venues";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type TeaMenuItem = {
  title: string;
  category: string;
  price: number;
  volume: string;
};

type SeedTranslation = {
  locale: Locale;
  name: string;
  description: string;
  teaMenu: TeaMenuItem[];
};

const teaPlaces: SeedPlace[] = [
  {
    slug: "kyakhtinsky-dvor",
    lat: 52.28945,
    lng: 104.28089,
    phone: "+7 (3952) 20-16-84",
    website: "https://example.com/kyakhta-dvor",
    logoUrl: null,
    isPremium: true,
    translations: [
      {
        locale: Locale.ru,
        name: "Чайная «Кяхтинский двор»",
        description:
          "Камерная чайная в историческом центре. Акцент на китайских и сибирских заварках, самоварное чаепитие и рассказы о купеческом Иркутске. Адрес: г. Иркутск, ул. Карла Маркса, 15.",
        teaMenu: [
          {
            title: "Дянь Хун «Золотые почки»",
            category: "Байховые",
            price: 420,
            volume: "350 мл",
          },
          {
            title: "Шу Пуэр «Кяхтинский караван»",
            category: "Прессованные",
            price: 480,
            volume: "300 мл",
          },
          {
            title: "Самоварный чёрный с вареньем",
            category: "Десерты",
            price: 390,
            volume: "500 мл",
          },
        ],
      },
      {
        locale: Locale.en,
        name: "Tea House “Kyakhta Courtyard”",
        description:
          "An intimate tea house in the historic centre. Focus on Chinese and Siberian leaves, samovar tea, and stories of merchant Irkutsk. Address: Irkutsk, Karl Marx St., 15.",
        teaMenu: [
          {
            title: "Dian Hong “Golden Buds”",
            category: "Loose-leaf",
            price: 420,
            volume: "350 ml",
          },
          {
            title: "Shu Puer “Kyakhta Caravan”",
            category: "Pressed",
            price: 480,
            volume: "300 ml",
          },
          {
            title: "Samovar black tea with jam",
            category: "Desserts",
            price: 390,
            volume: "500 ml",
          },
        ],
      },
      {
        locale: Locale.zh,
        name: "茶馆「恰克图庭院」",
        description:
          "位于历史中心的私密茶馆。主打中国与西伯利亚茶品、茶炊茶会，以及关于商人伊尔库茨克的故事。地址：伊尔库茨克，卡尔·马克思大街 15 号。",
        teaMenu: [
          {
            title: "滇红「金芽」",
            category: "散茶",
            price: 420,
            volume: "350 毫升",
          },
          {
            title: "熟普洱「恰克图商队」",
            category: "紧压茶",
            price: 480,
            volume: "300 毫升",
          },
          {
            title: "茶炊红茶配果酱",
            category: "甜点",
            price: 390,
            volume: "500 毫升",
          },
        ],
      },
    ],
    reviews: [
      {
        authorName: "Анна",
        rating: 5,
        text: "Атмосфера купеческого Иркутска и отличный пуэр — идеальная точка на чайном маршруте.",
      },
    ],
  },
  {
    slug: "velikiy-put",
    lat: 52.2885,
    lng: 104.292,
    phone: "+7 (3952) 55-00-11",
    website: "https://example.ru/tea-way",
    logoUrl: null,
    isPremium: true,
    translations: [
      {
        locale: Locale.ru,
        name: "Чайная «Великий Путь»",
        description:
          "Уютное пространство в историческом центре города. Подаем классический байховый чай, авторские купажи с саган-дайля и дикими сибирскими ягодами в традиционных фарфоровых чайниках. Адрес: г. Иркутск, ул. Карла Маркса, 12.",
        teaMenu: [
          {
            title: "Байховый классический",
            category: "Байховые",
            price: 350,
            volume: "350 мл",
          },
          {
            title: "Купаж с саган-дайля",
            category: "Авторские",
            price: 420,
            volume: "300 мл",
          },
          {
            title: "Сибирские ягоды",
            category: "Авторские",
            price: 390,
            volume: "300 мл",
          },
        ],
      },
      {
        locale: Locale.en,
        name: "Tea House “The Great Path”",
        description:
          "A cozy space in the historic city centre. Classic loose-leaf tea, signature blends with sagan-dailya and wild Siberian berries in traditional porcelain pots. Address: Irkutsk, Karl Marx St., 12.",
        teaMenu: [
          {
            title: "Classic loose-leaf black",
            category: "Loose-leaf",
            price: 350,
            volume: "350 ml",
          },
          {
            title: "Blend with sagan-dailya",
            category: "Signature",
            price: 420,
            volume: "300 ml",
          },
          {
            title: "Siberian berries",
            category: "Signature",
            price: 390,
            volume: "300 ml",
          },
        ],
      },
      {
        locale: Locale.zh,
        name: "茶馆「伟大之路」",
        description:
          "位于城市历史中心的舒适空间。供应经典红茶、含萨甘黛丽与西伯利亚野果的招牌拼配，使用传统瓷壶冲泡。地址：伊尔库茨克，卡尔·马克思大街 12 号。",
        teaMenu: [
          {
            title: "经典散红茶",
            category: "散茶",
            price: 350,
            volume: "350 毫升",
          },
          {
            title: "萨甘黛丽拼配",
            category: "招牌",
            price: 420,
            volume: "300 毫升",
          },
          {
            title: "西伯利亚浆果",
            category: "招牌",
            price: 390,
            volume: "300 毫升",
          },
        ],
      },
    ],
    reviews: [
      {
        authorName: "Михаил",
        rating: 5,
        text: "Саган-дайля здесь заваривают безупречно. Премиальная подача без пафоса.",
      },
    ],
  },
  {
    slug: "sibirskaya-gostinaya",
    lat: 52.292,
    lng: 104.285,
    phone: "+7 (3952) 77-88-99",
    website: "https://example.ru/siberian-tea",
    logoUrl: null,
    isPremium: false,
    translations: [
      {
        locale: Locale.ru,
        name: "Сибирская Гостиная",
        description:
          "Заведение на берегу Ангары, воссоздающее атмосферу купеческих чаепитий XIX века. Вода из байкальских источников, домашние пироги и варенье из лесной земляники. Адрес: г. Иркутск, ул. Нижне-Набережная, 4.",
        teaMenu: [
          {
            title: "Самоварный чёрный",
            category: "Байховые",
            price: 320,
            volume: "500 мл",
          },
          {
            title: "Травяной сбор «Байкал»",
            category: "Травы Сибири",
            price: 340,
            volume: "350 мл",
          },
          {
            title: "Пирог с лесной земляникой",
            category: "Десерты",
            price: 280,
            volume: "1 порция",
          },
        ],
      },
      {
        locale: Locale.en,
        name: "Siberian Drawing Room",
        description:
          "A venue on the Angara riverbank recreating 19th-century merchant tea gatherings. Baikal spring water, homemade pies, and wild strawberry jam. Address: Irkutsk, Nizhne-Naberezhnaya St., 4.",
        teaMenu: [
          {
            title: "Samovar black tea",
            category: "Loose-leaf",
            price: 320,
            volume: "500 ml",
          },
          {
            title: "Herbal blend “Baikal”",
            category: "Siberian herbs",
            price: 340,
            volume: "350 ml",
          },
          {
            title: "Wild strawberry pie",
            category: "Desserts",
            price: 280,
            volume: "1 serving",
          },
        ],
      },
      {
        locale: Locale.zh,
        name: "西伯利亚会客厅",
        description:
          "位于安加拉河畔的茶馆，重现十九世纪商人茶会氛围。贝加尔泉水、自制馅饼与野草莓果酱。地址：伊尔库茨克，下滨河街 4 号。",
        teaMenu: [
          {
            title: "茶炊红茶",
            category: "散茶",
            price: 320,
            volume: "500 毫升",
          },
          {
            title: "草本拼配「贝加尔」",
            category: "西伯利亚草药",
            price: 340,
            volume: "350 毫升",
          },
          {
            title: "野草莓馅饼",
            category: "甜点",
            price: 280,
            volume: "1 份",
          },
        ],
      },
    ],
    reviews: [
      {
        authorName: "Елена",
        rating: 4,
        text: "Вид на Ангару и домашняя выпечка — отличная остановка после прогулки по набережной.",
      },
    ],
  },
];

async function main() {
  const places: SeedPlace[] = [...teaPlaces, ...registeredVenues];

  for (const place of places) {
    await prisma.place.upsert({
      where: { slug: place.slug },
      update: {
        lat: place.lat,
        lng: place.lng,
        phone: place.phone || null,
        website: place.website || null,
        logoUrl: place.logoUrl,
        isPremium: place.isPremium,
        translations: {
          deleteMany: {},
          create: place.translations.map((translation) => ({
            locale: translation.locale,
            name: translation.name,
            description: translation.description,
            teaMenu: translation.teaMenu,
          })),
        },
      },
      create: {
        slug: place.slug,
        lat: place.lat,
        lng: place.lng,
        phone: place.phone || null,
        website: place.website || null,
        logoUrl: place.logoUrl,
        isPremium: place.isPremium,
        translations: {
          create: place.translations.map((translation) => ({
            locale: translation.locale,
            name: translation.name,
            description: translation.description,
            teaMenu: translation.teaMenu,
          })),
        },
        reviews: {
          create: place.reviews,
        },
      },
    });
  }

  console.log(
    `Seeded ${places.length} places (${teaPlaces.length} tea houses + ${registeredVenues.length} venues) with RU/EN/ZH translations.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
