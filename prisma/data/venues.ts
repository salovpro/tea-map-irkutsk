import { Locale } from "../../src/generated/prisma/client";

type TeaMenuItem = {
  title: string;
  category: string;
  price: number;
  volume: string;
  description?: string;
};

type SeedTranslation = {
  locale: Locale;
  name: string;
  description: string;
  teaMenu: TeaMenuItem[];
};

export type SeedPlace = {
  slug: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  logoUrl: string | null;
  isPremium: boolean;
  translations: SeedTranslation[];
  reviews: {
    authorName: string;
    rating: number;
    text: string;
  }[];
};

type VenueInput = {
  slug: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  logoUrl?: string | null;
  isPremium?: boolean;
  name: { ru: string; en: string; zh: string };
  address: { ru: string; en: string; zh: string };
  blurb?: { ru: string; en: string; zh: string };
  teaMenu?: {
    ru: TeaMenuItem[];
    en: TeaMenuItem[];
    zh: TeaMenuItem[];
  };
};

function description(
  locale: "ru" | "en" | "zh",
  address: string,
  blurb?: string,
) {
  const label =
    locale === "en" ? "Address" : locale === "zh" ? "地址" : "Адрес";
  const sep = locale === "zh" ? "：" : ": ";
  const base = blurb ? `${blurb} ` : "";
  return `${base}${label}${sep}${address}.`;
}

function venue(input: VenueInput): SeedPlace {
  const blurb = input.blurb ?? {
    ru: "Заведение — участник Чайной карты Иркутска.",
    en: "A venue featured on the Tea Map of Irkutsk.",
    zh: "伊尔库茨克茶图收录的场所。",
  };

  const emptyMenu: TeaMenuItem[] = [];

  return {
    slug: input.slug,
    lat: input.lat,
    lng: input.lng,
    phone: input.phone ?? "",
    website: input.website ?? "",
    logoUrl: input.logoUrl ?? null,
    isPremium: input.isPremium ?? false,
    translations: [
      {
        locale: Locale.ru,
        name: input.name.ru,
        description: description("ru", input.address.ru, blurb.ru),
        teaMenu: input.teaMenu?.ru ?? emptyMenu,
      },
      {
        locale: Locale.en,
        name: input.name.en,
        description: description("en", input.address.en, blurb.en),
        teaMenu: input.teaMenu?.en ?? emptyMenu,
      },
      {
        locale: Locale.zh,
        name: input.name.zh,
        description: description("zh", input.address.zh, blurb.zh),
        teaMenu: input.teaMenu?.zh ?? emptyMenu,
      },
    ],
    reviews: [],
  };
}

/** Tea menu for Собрание Спешилова (no alcohol teas). */
const sobranieSpeshilovaTeaMenu = {
  ru: [
    {
      title: "Авторский чай-заварка",
      category: "Специальное предложение",
      price: 1100,
      volume: "400 мл · на 3 персоны",
      description: "Чайная церемония из самовара с 131-летней историей",
    },
    {
      title: "Сибирский",
      category: "Авторский чай",
      price: 500,
      volume: "600 мл",
      description: "Чёрный чай ассам, брусника, мята, саган дали, тимьян, мёд",
    },
    {
      title: "Синий бриллиант",
      category: "Авторский чай",
      price: 500,
      volume: "600 мл",
      description: "Лемонграсс, чай макабео, лимон, маракуйя, мёд, анчан",
    },
    {
      title: "Имбирь — лимон",
      category: "Авторский чай",
      price: 500,
      volume: "600 мл",
      description: "Сенча, мёд, имбирь, лимон, эвкалипт",
    },
    {
      title: "Хвойный со смородиной",
      category: "Авторский чай",
      price: 500,
      volume: "600 мл",
      description: "Бергамот, хвоя, чёрная смородина, мёд",
    },
    {
      title: "Чёрный с бергамотом",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Чёрный с лепестками роз",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Жасминовый",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Улун",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Сенча с грецким орехом",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Ромашковый",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Иван-чай",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
    {
      title: "Гречишный",
      category: "Коллекция чая",
      price: 350,
      volume: "600 мл",
    },
  ] satisfies TeaMenuItem[],
  en: [
    {
      title: "Author’s tea brew",
      category: "Special offer",
      price: 1100,
      volume: "400 ml · for 3 people",
      description: "Samovar tea ceremony with a 131-year history",
    },
    {
      title: "Siberian",
      category: "Author’s tea",
      price: 500,
      volume: "600 ml",
      description: "Assam black tea, cranberry, mint, sagan dali, thyme, honey",
    },
    {
      title: "Blue diamond",
      category: "Author’s tea",
      price: 500,
      volume: "600 ml",
      description: "Lemongrass, macabeo tea, lemon, passion fruit, honey, butterfly pea",
    },
    {
      title: "Ginger — lemon",
      category: "Author’s tea",
      price: 500,
      volume: "600 ml",
      description: "Sencha, honey, ginger, lemon, eucalyptus",
    },
    {
      title: "Pine needles with currant",
      category: "Author’s tea",
      price: 500,
      volume: "600 ml",
      description: "Bergamot, pine needles, blackcurrant, honey",
    },
    {
      title: "Earl Grey",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Black with rose petals",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Jasmine",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Oolong",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Sencha with walnut",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Chamomile",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Ivan-tea",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
    {
      title: "Buckwheat",
      category: "Tea collection",
      price: 350,
      volume: "600 ml",
    },
  ] satisfies TeaMenuItem[],
  zh: [
    {
      title: "主理人茶冲泡",
      category: "特别推荐",
      price: 1100,
      volume: "400 毫升 · 三人份",
      description: "拥有 131 年历史的茶炊茶礼",
    },
    {
      title: "西伯利亚",
      category: "主理人茶",
      price: 500,
      volume: "600 毫升",
      description: "阿萨姆红茶、越橘、薄荷、萨甘达利、百里香、蜂蜜",
    },
    {
      title: "蓝钻石",
      category: "主理人茶",
      price: 500,
      volume: "600 毫升",
      description: "柠檬草、马卡贝奥茶、柠檬、百香果、蜂蜜、蝶豆花",
    },
    {
      title: "姜柠",
      category: "主理人茶",
      price: 500,
      volume: "600 毫升",
      description: "煎茶、蜂蜜、姜、柠檬、桉树",
    },
    {
      title: "松针黑加仑",
      category: "主理人茶",
      price: 500,
      volume: "600 毫升",
      description: "佛手柑、松针、黑加仑、蜂蜜",
    },
    {
      title: "佛手柑红茶",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "玫瑰红茶",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "茉莉",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "乌龙",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "核桃煎茶",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "洋甘菊",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "柳兰茶",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
    {
      title: "荞麦茶",
      category: "茶品系列",
      price: 350,
      volume: "600 毫升",
    },
  ] satisfies TeaMenuItem[],
};

/** Registered partner venues for the Tea Map of Irkutsk. */
export const registeredVenues: SeedPlace[] = [
  venue({
    slug: "sobranie-speshilova",
    lat: 52.273081,
    lng: 104.292455,
    phone: "+7 (3952) 43-60-17",
    website: "https://sobraniespeshilov.com/restaurant/",
    logoUrl: "/logos/sobranie-speshilova.png",
    name: {
      ru: "Собрание Спешилова",
      en: "Sobranie Speshilova",
      zh: "斯佩希洛夫聚会厅",
    },
    address: {
      ru: "г. Иркутск, ул. Седова, 42/1",
      en: "Irkutsk, Sedova St., 42/1",
      zh: "伊尔库茨克，谢多夫街 42/1",
    },
    blurb: {
      ru: "Чайная церемония из самовара с 131-летней историей.",
      en: "A samovar tea ceremony with a 131-year history.",
      zh: "拥有 131 年历史的茶炊茶礼。",
    },
    teaMenu: sobranieSpeshilovaTeaMenu,
  }),
  venue({
    slug: "zavarka",
    lat: 52.276459,
    lng: 104.318524,
    name: {
      ru: "Zavarka",
      en: "Zavarka",
      zh: "Zavarka",
    },
    address: {
      ru: "г. Иркутск",
      en: "Irkutsk",
      zh: "伊尔库茨克",
    },
  }),
  venue({
    slug: "dyadyushka-fugo",
    lat: 52.282228,
    lng: 104.258993,
    name: {
      ru: "Дядюшка Фуго",
      en: "Uncle Fugo",
      zh: "富戈大叔",
    },
    address: {
      ru: "г. Иркутск",
      en: "Irkutsk",
      zh: "伊尔库茨克",
    },
  }),
  venue({
    slug: "knyaz-gvidon",
    lat: 52.283219,
    lng: 104.285727,
    phone: "+7 (3952) 20-02-77",
    website: "https://www.gvidonirkutsk.ru/",
    name: {
      ru: "Князь Гвидон",
      en: "Prince Gvidon",
      zh: "格维东王子",
    },
    address: {
      ru: "г. Иркутск, ул. Сухэ-Батора, 18",
      en: "Irkutsk, Sukhe-Bator St., 18",
      zh: "伊尔库茨克，苏赫巴托尔街 18 号",
    },
  }),
  venue({
    slug: "baikal-severnoe-more",
    lat: 52.2521,
    lng: 104.321,
    phone: "+7 (395) 248-28-88",
    website: "https://northseahotel.com/",
    name: {
      ru: "Байкал Северное море",
      en: "Baikal Northern Sea",
      zh: "贝加尔北海",
    },
    address: {
      ru: "г. Иркутск, ул. Дальневосточная, д. 156",
      en: "Irkutsk, Dalnevostochnaya St., 156",
      zh: "伊尔库茨克，远东街 156 号",
    },
  }),
  venue({
    slug: "mangal",
    lat: 52.2797,
    lng: 104.3013,
    phone: "+7 (3952) 95-95-80",
    website: "https://mangalirk.ru/",
    name: {
      ru: "Мангал",
      en: "Mangal",
      zh: "Mangal",
    },
    address: {
      ru: "г. Иркутск, ул. Безбокова, 1с1",
      en: "Irkutsk, Bezbokova St., 1s1",
      zh: "伊尔库茨克，别兹博科夫街 1с1",
    },
  }),
  venue({
    slug: "butin",
    lat: 52.2825,
    lng: 104.2847,
    phone: "+7 (964) 740-51-65",
    website: "https://butinirk.ru/",
    name: {
      ru: "Бутин",
      en: "Butin",
      zh: "Butin",
    },
    address: {
      ru: "г. Иркутск, Хасановский пер., д. 1",
      en: "Irkutsk, Khasanovsky Lane, 1",
      zh: "伊尔库茨克，哈萨诺夫斯基巷 1 号",
    },
  }),
  venue({
    slug: "partizan",
    lat: 52.2735,
    lng: 104.292,
    phone: "+7 (3952) 50-50-88",
    website: "https://partizan.rest/",
    name: {
      ru: "Ресторан Партизан",
      en: "Partizan Restaurant",
      zh: "游击队餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Седова, 87",
      en: "Irkutsk, Sedova St., 87",
      zh: "伊尔库茨克，谢多夫街 87 号",
    },
  }),
  venue({
    slug: "restoran-ohotnikov",
    lat: 52.277941,
    lng: 104.336518,
    phone: "+7 (3952) 78-81-77",
    website: "https://restoranohotnikov.ru/",
    name: {
      ru: "Ресторан Охотников",
      en: "Hunters Restaurant",
      zh: "猎人餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Ядринцева, 1ж",
      en: "Irkutsk, Yadrintseva St., 1zh",
      zh: "伊尔库茨克，亚德林采夫街 1ж",
    },
  }),
  venue({
    slug: "vyuga-mayak",
    lat: 51.847123,
    lng: 104.873468,
    phone: "+7 (3952) 78-81-65",
    website: "https://mayakhotel.ru/",
    name: {
      ru: "Ресторан VYЮГА",
      en: "VYUGA Restaurant",
      zh: "VYUGA 餐厅",
    },
    address: {
      ru: "ГК «Маяк», ул. Горького, 85а, 2 этаж",
      en: "Mayak Hotel, Gorky St., 85a, 2nd floor",
      zh: "灯塔酒店，高尔基街 85а，2 层",
    },
  }),
  venue({
    slug: "kitayskiy-ieroglif",
    lat: 52.277941,
    lng: 104.336518,
    phone: "+7 (3952) 50-03-50",
    website: "https://restoranieroglif.ru/",
    name: {
      ru: "Ресторан Китайский Иероглиф",
      en: "Chinese Hieroglyph Restaurant",
      zh: "中国象形文字餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Ядринцева, 1ж",
      en: "Irkutsk, Yadrintseva St., 1zh",
      zh: "伊尔库茨克，亚德林采夫街 1ж",
    },
  }),
  venue({
    slug: "klyukva-baykalsk",
    lat: 51.5139,
    lng: 104.122,
    phone: "+7 (924) 990-91-00",
    website: "https://wshotel.ru/",
    name: {
      ru: "Ресторан Клюква",
      en: "Klyukva Restaurant",
      zh: "蔓越莓餐厅",
    },
    address: {
      ru: "г. Байкальск, «Белый соболь», мкр. Красный ключ, 9",
      en: "Baikalsk, Bely Sobol, Krasny Klyuch district, 9",
      zh: "贝加尔斯克，白貂，红泉小区 9 号",
    },
  }),
  venue({
    slug: "evropa",
    lat: 52.274695,
    lng: 104.304933,
    phone: "+7 (3952) 78-81-79",
    website: "https://europehotel.ru/",
    name: {
      ru: "Ресторан Европа",
      en: "Europe Restaurant",
      zh: "欧洲餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Байкальская, 69",
      en: "Irkutsk, Baikalskaya St., 69",
      zh: "伊尔库茨克，贝加尔街 69 号",
    },
  }),
  venue({
    slug: "kurbatov",
    lat: 52.289907,
    lng: 104.269674,
    phone: "+7 (3952) 79-17-91",
    website: "https://rodinagrandhotel.ru/restaurant/",
    name: {
      ru: "Ресторан Курбатов",
      en: "Kurbatov Restaurant",
      zh: "库尔巴托夫餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Николая Гаврилова, 2",
      en: "Irkutsk, Nikolay Gavrilov St., 2",
      zh: "伊尔库茨克，尼古拉·加夫里洛夫街 2 号",
    },
  }),
  venue({
    slug: "pepel",
    lat: 52.283,
    lng: 104.2855,
    phone: "+7 (3952) 71-71-77",
    website: "https://pepel.rest/",
    name: {
      ru: "Ресторан Пепел",
      en: "Pepel Restaurant",
      zh: "灰烬餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Сухэ-Батора, 6",
      en: "Irkutsk, Sukhe-Bator St., 6",
      zh: "伊尔库茨克，苏赫巴托尔街 6 号",
    },
  }),
  venue({
    slug: "cui-tea",
    lat: 52.25149,
    lng: 104.257879,
    phone: "+7 (924) 704-40-15",
    isPremium: true,
    name: {
      ru: "Чайная CUI TEA",
      en: "CUI TEA Tea House",
      zh: "CUI TEA 茶馆",
    },
    address: {
      ru: "г. Иркутск, ул. Эдуарда Дьяконова, 8",
      en: "Irkutsk, Eduard Dyakonov St., 8",
      zh: "伊尔库茨克，爱德华·季亚科诺夫街 8 号",
    },
    blurb: {
      ru: "Чайная — участник Чайной карты Иркутска.",
      en: "A tea house on the Tea Map of Irkutsk.",
      zh: "伊尔库茨克茶图收录的茶馆。",
    },
  }),
  venue({
    slug: "kochevnik",
    lat: 52.2825,
    lng: 104.2847,
    phone: "+7 (3952) 20-04-59",
    website: "https://www.kochevnik-irk.com/",
    name: {
      ru: "Кочевник",
      en: "Kochevnik",
      zh: "游牧者",
    },
    address: {
      ru: "г. Иркутск, ул. Горького, 19",
      en: "Irkutsk, Gorky St., 19",
      zh: "伊尔库茨克，高尔基街 19 号",
    },
  }),
  venue({
    slug: "pappare",
    lat: 52.283,
    lng: 104.2856,
    phone: "+7 (914) 938-66-60",
    website: "https://www.pappare.ru/",
    name: {
      ru: "Паппаре",
      en: "Pappare",
      zh: "Pappare",
    },
    address: {
      ru: "г. Иркутск, ул. Сухэ-Батора, 11а",
      en: "Irkutsk, Sukhe-Bator St., 11a",
      zh: "伊尔库茨克，苏赫巴托尔街 11а",
    },
  }),
  venue({
    slug: "la-premiere",
    lat: 52.2825,
    lng: 104.2847,
    name: {
      ru: "Ла Премьера",
      en: "La Premiere",
      zh: "La Premiere",
    },
    address: {
      ru: "г. Иркутск",
      en: "Irkutsk",
      zh: "伊尔库茨克",
    },
  }),
  venue({
    slug: "prego",
    lat: 52.28258,
    lng: 104.284739,
    phone: "+7 (3952) 97-97-57",
    website: "https://pregorest.ru",
    name: {
      ru: "Прего",
      en: "Prego",
      zh: "Prego",
    },
    address: {
      ru: "г. Иркутск, ул. Карла Маркса, 15а",
      en: "Irkutsk, Karl Marx St., 15a",
      zh: "伊尔库茨克，卡尔·马克思大街 15а",
    },
  }),
  venue({
    slug: "chento",
    lat: 52.2756,
    lng: 104.2867,
    phone: "+7 (3952) 98-81-01",
    website: "https://chentorest.ru",
    name: {
      ru: "Ченто",
      en: "Chento",
      zh: "Chento",
    },
    address: {
      ru: "г. Иркутск, ул. 3 Июля, 1а",
      en: "Irkutsk, 3 July St., 1a",
      zh: "伊尔库茨克，七月三日街 1а",
    },
  }),
  venue({
    slug: "kruzhal",
    lat: 52.2756,
    lng: 104.2867,
    phone: "+7 (3952) 98-81-11",
    name: {
      ru: "Кружаль",
      en: "Kruzhal",
      zh: "Kruzhal",
    },
    address: {
      ru: "г. Иркутск, ул. 3 Июля, 1а",
      en: "Irkutsk, 3 July St., 1a",
      zh: "伊尔库茨克，七月三日街 1а",
    },
  }),
  venue({
    slug: "grot-pervomayskiy",
    lat: 52.257108,
    lng: 104.235161,
    phone: "+7 (3952) 48-59-05",
    name: {
      ru: "Грот Первомайский",
      en: "Grot Pervomaysky",
      zh: "五月一日岩穴",
    },
    address: {
      ru: "г. Иркутск, мкр. Первомайский, д. 14А",
      en: "Irkutsk, Pervomaysky district, 14A",
      zh: "伊尔库茨克，五月一日小区 14А",
    },
  }),
  venue({
    slug: "red-grot",
    lat: 52.2571,
    lng: 104.2352,
    phone: "+7 (3952) 48-59-03",
    website: "https://redgrot.ru/",
    name: {
      ru: "Red Grot",
      en: "Red Grot",
      zh: "Red Grot",
    },
    address: {
      ru: "г. Иркутск, пр. Маршала Жукова, 15/2",
      en: "Irkutsk, Marshal Zhukov Ave., 15/2",
      zh: "伊尔库茨克，朱可夫元帅大街 15/2",
    },
  }),
  venue({
    slug: "yabloko",
    lat: 52.279715,
    lng: 104.301313,
    phone: "+7 (3952) 66-92-29",
    website: "https://yablokorestaurant.2gis.biz/",
    name: {
      ru: "Яблоко",
      en: "Yabloko",
      zh: "苹果餐厅",
    },
    address: {
      ru: "г. Иркутск, ул. Партизанская, 28А/1",
      en: "Irkutsk, Partizanskaya St., 28A/1",
      zh: "伊尔库茨克，游击队街 28А/1",
    },
  }),
  venue({
    slug: "chempiony",
    lat: 52.2825,
    lng: 104.284,
    phone: "+7 (902) 760-80-08",
    name: {
      ru: "Чемпионы",
      en: "Champions",
      zh: "冠军",
    },
    address: {
      ru: "г. Иркутск, ул. Карла Маркса, 21 (цокольный этаж)",
      en: "Irkutsk, Karl Marx St., 21 (basement)",
      zh: "伊尔库茨克，卡尔·马克思大街 21 号（地下室）",
    },
  }),
];
