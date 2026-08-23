/**
 * One-time EN/ZH PlaceTranslation.description update for 21 venues
 * whose RU about-text was already approved. Matches by unique slug only.
 * Does not change names, addresses, coordinates, tea_menu, RU, sortOrder,
 * or create/delete rows.
 *
 *   npm run update:descriptions:i18n -- --dry-run
 *   npm run update:descriptions:i18n -- --apply
 *
 * Default (no flags) is dry-run. Never prints DATABASE_URL.
 * Existing `Address: …` / `地址：…` suffixes are preserved.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Locale, PrismaClient } from "../src/generated/prisma/client";
import { replaceDescriptionBody } from "../src/lib/place-description";
import { createPgPool } from "../src/lib/pg-pool";

type LocaleBodies = {
  requestedName: string;
  slug: string;
  en: string;
  zh: string;
};

const updates: LocaleBodies[] = [
  {
    requestedName: "Галерейно-ресторанный комплекс «Собрание Спешилова»",
    slug: "sobranie-speshilova",
    en: "The samovar exhibition at the Sobranie Speshilova complex is a unique cultural and historical landmark — not only for the Irkutsk Region. There is no comparable collection anywhere from the Urals to the Far East. This is a permanent exhibition, always open to guests of the complex. The collection numbers more than 350 rare samovars made by factories and workshops in Russia and abroad from the 18th century onward.",
    zh: "「斯佩希洛夫聚会」综合体的茶炊展览是独特的文化与历史遗产，不仅属于伊尔库茨克州——从乌拉尔到远东都找不到类似的收藏。这是常设展览，始终对综合体的客人开放。茶炊收藏有350余件珍品，出自俄罗斯及国外各工厂与作坊，最早可追溯到18世纪。",
  },
  {
    requestedName: "Князь Гвидон",
    slug: "knyaz-gvidon",
    en: "The true magic of Prince Gvidon is not only on the plate. The interiors bring to life recognizable details of Pushkin’s beloved fairy tale. Every element — from carefully calibrated lighting to noble material textures — underlines the venue’s character. A special pride is the restaurant’s walls, hand-painted in fresco technique, creating a one-of-a-kind artistic effect.",
    zh: "「格维东王子」的魔力不只在味道上。餐厅内部重现普希金心爱童话中可辨认的细节。从精心调校的灯光到材质的高贵质感，每一处都突出场所的独特。尤其令人自豪的是以湿壁画技法手工绘制的墙面，营造出独一无二的艺术效果。",
  },
  {
    requestedName: "Охотников",
    slug: "restoran-ohotnikov",
    en: "Once, people who knew the taiga well came here.\nPeople for whom Siberia was not a point on a map, but part of life. They knew the worth of a true product, respected the power of nature, and understood that the best stories are born not on the road, but after it — at a long table, by a live fire.\n\nThat is how the place called “Okhotnikov” appeared.\n\nToday it welcomes not only those who have been to the taiga, but also those who want to discover the real Siberia.",
    zh: "从前，深谙泰加林的人会来到这里。\n对他们而言，西伯利亚不是地图上的一个点，而是生活的一部分。他们懂得真正食材的价值，敬畏自然的力量，也明白：最好的故事不是诞生在路上，而是在路之后——在长桌旁、在活火边。\n\n于是有了名为「猎人」的地方。\n\n今天，这里不仅欢迎去过泰加林的人，也欢迎那些想真正认识西伯利亚的人。",
  },
  {
    requestedName: "Байкал-Северное море",
    slug: "baikal-severnoe-more",
    en: "The chef’s menu brings together European and Chinese culinary traditions. An ideal place for a gastronomic experience with a view of the Angara.",
    zh: "主厨菜单融合欧洲与中国烹饪传统。在安加拉河景下享受美食体验的理想之地。",
  },
  {
    requestedName: "Chento",
    slug: "chento",
    en: "Italian cuisine, fine wines, and a cozy atmosphere. Chento is a place for your best moments.",
    zh: "意大利菜、精选葡萄酒与舒适氛围。Chento，留给你最美好的时刻。",
  },
  {
    requestedName: "Prego",
    slug: "prego",
    en: "An Italian restaurant with a 15-year history, where every dish is cooked with care and traditional recipes.",
    zh: "拥有15年历史的意大利餐厅，每道菜都按传统食谱用心烹制。",
  },
  {
    requestedName: "VYЮГА",
    slug: "vyuga-mayak",
    en: "Restaurant “VYUGA” is a gastronomic adventure and a dive into Siberian cuisine. Every dish is a masterpiece — and of course there is a stunning view of Lake Baikal.",
    zh: "「VYUGA」餐厅是一场美食冒险，也是对西伯利亚菜的沉浸。每道菜都是杰作，当然还有贝加尔湖的绝美景色。",
  },
  {
    requestedName: "Мангал",
    slug: "mangal",
    en: "A grill restaurant with a summer terrace. Ten years of outstanding quality and a beautiful view of the bay.",
    zh: "带夏季露台的烧烤餐厅。十年卓越品质，海湾景色优美。",
  },
  {
    requestedName: "Butin",
    slug: "butin",
    en: "Here anyone can unwind “without a tie”, be themselves, and spend time well and well-fed. It was here, on Khasanovsky Lane, that from 1872 stood the famous wine cellars of Nerchinsk millionaire Mikhail Butin — entrepreneur, public figure, patron of the arts, a true patriot, and a remarkably many-sided figure in our city’s history.",
    zh: "在这里，人人都可以「不打领带」放松、做自己、吃好喝好。正是在哈萨诺夫斯基巷，自1872年起就有涅尔琴斯克百万富翁米哈伊尔·布京著名的酒窖——他是企业家、社会活动家、赞助人、真正的爱国者，也是本市历史上一位兴趣广泛、极有魅力的人物。",
  },
  {
    requestedName: "Курбатов",
    slug: "kurbatov",
    en: "Kurbatov is a gastronomic symbol of contemporary Siberia in the interiors of a worldly “Siberian Petersburg”, on the bank of the Angara. Author’s cuisine grounded in local ingredients and a fine reading of tradition. The menu is built around seasonal and farm products, including endemics of the Angara region.",
    zh: "Kurbatov 是当代西伯利亚的美食象征，坐落在安加拉河畔、带有世俗「西伯利亚彼得堡」气质的室内。主厨料理立足本地食材，并对传统做细腻诠释。菜单围绕时令与农场产品，包括安加拉地区的特有物种。",
  },
  {
    requestedName: "Европа",
    slug: "evropa",
    en: "Restaurant “Evropa” is one of the city’s most stylish venues — an island of warmth, excellent taste, and hospitality. Passionate lovers of good food and refined drinks come here, as do those who know how to recognize the unique flavor and aroma of life itself.",
    zh: "「欧洲」餐厅是城里最有格调的场所之一，友善、好品味与好客的小岛。热爱美食与精致饮品的人会来到这里，也包括那些懂得辨认生活本身独特滋味与香气的人。",
  },
  {
    requestedName: "Клюква",
    slug: "klyukva-baykalsk",
    en: "At restaurant “Klyukva”, guests can fully rest after walks through scenic surroundings and enjoy distinctive Siberian dishes in an atmosphere of warmth and comfort. “Klyukva” is known for a varied menu of fresh local ingredients, as well as refined drinks.",
    zh: "在「蔓越莓」餐厅，客人可以在风景优美的周边散步后好好休息，在温暖舒适的氛围中品尝独特的西伯利亚菜。「蔓越莓」以丰富菜单著称，使用新鲜本地食材，并提供精致饮品。",
  },
  {
    requestedName: "Пепел",
    slug: "pepel",
    en: "Pepel is the trace of a Siberian traveler’s discoveries. The project is inspired by the grandeur of the Valley of Volcanoes and the mysterious fate of Irkutsk geologist-explorer Peretolchin. Every element touches the atmosphere of a brave traveler’s journeys, and the dishes read like pages of his diary.",
    zh: "「灰烬」是一位西伯利亚旅行者发现的痕迹。项目灵感来自火山谷的壮阔，以及伊尔库茨克地质探险家佩列托尔钦神秘的命运。每一处都贴近这位勇敢旅行者的旅途气息，菜品则像他日记中的一页。",
  },
  {
    requestedName: "Китайский Иероглиф",
    slug: "kitayskiy-ieroglif",
    en: "“Chinese Hieroglyph” is the first Chinese restaurant in Irkutsk. Chinese chefs cook for guests from traditional recipes.",
    zh: "「中国象形文字」是伊尔库茨克第一家中餐厅。中国厨师按传统食谱为客人烹制菜肴。",
  },
  {
    requestedName: "Паппарэ",
    slug: "pappare",
    en: "Warm light, natural wood, living plants, and Italian cooking without extra pomp. A place where the evening grows softer.",
    zh: "暖光、原木、绿植，以及不夸张的意大利菜。晚上会变得更柔软的地方。",
  },
  {
    requestedName: "Чемпионы",
    slug: "chempiony",
    en: "Not just a bar or restaurant — also a museum of Irkutsk sport, with a men’s game room and karaoke. Plenty of food and live sports broadcasts.",
    zh: "不只是酒吧或餐厅，还是伊尔库茨克体育博物馆，设有男士游戏室和卡拉OK。食物丰富，并转播体育赛事。",
  },
  {
    requestedName: "Кружаль",
    slug: "kruzhal",
    en: "“Kruzhal” is what a Russian soul wants. A place for cheerful people and uninhibited parties. A new program every month.",
    zh: "「Kruzhal」正合俄罗斯人的心意。这里属于爱热闹的人和尽情的派对。每个月都有新节目。",
  },
  {
    requestedName: "Red Grot",
    slug: "red-grot",
    en: "A restaurant and bar by the bay. Since 2012. People come for a heartfelt dinner and conversations with friends.",
    zh: "海湾边的餐厅与酒吧。始于2012年。人们来这里吃一顿暖心晚餐，和朋友聊天。",
  },
  {
    requestedName: "Яблоко",
    slug: "yabloko",
    en: "A restaurant and karaoke about a happy life.",
    zh: "关于幸福生活的餐厅与卡拉OK。",
  },
  {
    requestedName: "Кочевник",
    slug: "kochevnik",
    en: "One of the city’s most unusual places. Thanks to a unique ethnic interior, you step into the atmosphere of the Golden Horde. Try dishes once served to Genghis Khan himself.",
    zh: "城里最不寻常的地方之一。独特的民族风室内让你沉浸在金帐汗国时代的氛围中。品尝曾献给成吉思汗本人的菜肴。",
  },
  {
    requestedName: "Grot Первомайский",
    slug: "grot-pervomayskiy",
    en: "Business lunches, friendly get-togethers, bright celebrations, and family evenings — all await you in a restaurant with European cuisine, a lively atmosphere, and care for every guest.",
    zh: "商务午餐、朋友小聚、热闹节日和家庭夜晚——这一切都在这家欧洲菜餐厅等你，气氛活跃，用心接待每一位客人。",
  },
];

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const apply = process.argv.includes("--apply");
const dryRunFlag = process.argv.includes("--dry-run");

if (apply && dryRunFlag) {
  throw new Error("Use either --dry-run or --apply, not both");
}

const pool = createPgPool(connectionString);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type LocaleRow = {
  locale: "en" | "zh";
  translationId: string;
  name: string;
  oldDescription: string;
  newDescription: string;
};

async function main() {
  const uniqueSlugs = new Set(updates.map((item) => item.slug));
  if (uniqueSlugs.size !== updates.length) {
    throw new Error("Duplicate slugs in i18n description update list");
  }

  const existing = await prisma.place.findMany({
    where: { slug: { in: [...uniqueSlugs] } },
    select: {
      id: true,
      slug: true,
      translations: {
        where: { locale: { in: [Locale.en, Locale.zh] } },
        select: { id: true, locale: true, name: true, description: true },
      },
    },
  });

  const bySlug = new Map(existing.map((place) => [place.slug, place]));
  const unmatched: string[] = [];
  const missingLocale: string[] = [];
  const matched: {
    requestedName: string;
    slug: string;
    id: string;
    rows: LocaleRow[];
  }[] = [];

  for (const item of updates) {
    const place = bySlug.get(item.slug);
    if (!place) {
      unmatched.push(`${item.requestedName} (${item.slug})`);
      continue;
    }
    const en = place.translations.find((t) => t.locale === Locale.en);
    const zh = place.translations.find((t) => t.locale === Locale.zh);
    if (!en || !zh) {
      missingLocale.push(
        `${item.requestedName} (${item.slug} / ${place.id}) missing ${[
          !en ? "en" : null,
          !zh ? "zh" : null,
        ]
          .filter(Boolean)
          .join(",")}`,
      );
      continue;
    }
    matched.push({
      requestedName: item.requestedName,
      slug: item.slug,
      id: place.id,
      rows: [
        {
          locale: "en",
          translationId: en.id,
          name: en.name,
          oldDescription: en.description,
          newDescription: replaceDescriptionBody(en.description, item.en),
        },
        {
          locale: "zh",
          translationId: zh.id,
          name: zh.name,
          oldDescription: zh.description,
          newDescription: replaceDescriptionBody(zh.description, item.zh),
        },
      ],
    });
  }

  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  console.log("");
  console.log("MATCHED:");
  console.log(`${matched.length} / ${updates.length}`);
  console.log("");

  for (const place of matched) {
    console.log(`- ${place.requestedName}`);
    console.log(`  id: ${place.id}`);
    console.log(`  slug: ${place.slug}`);
    for (const row of place.rows) {
      console.log(`  ${row.locale.toUpperCase()} name: ${row.name}`);
      console.log(`  ${row.locale.toUpperCase()} OLD:`);
      console.log(row.oldDescription);
      console.log(`  ${row.locale.toUpperCase()} NEW:`);
      console.log(row.newDescription);
    }
    console.log("");
  }

  console.log("UNMATCHED:");
  if (unmatched.length === 0) console.log("(none)");
  else unmatched.forEach((line) => console.log(`- ${line}`));

  console.log("");
  console.log("MISSING_EN_OR_ZH:");
  if (missingLocale.length === 0) console.log("(none)");
  else missingLocale.forEach((line) => console.log(`- ${line}`));

  const ready =
    unmatched.length === 0 &&
    missingLocale.length === 0 &&
    matched.length === updates.length;

  console.log("");
  console.log(`DRY RUN: ${ready ? "PASS" : "FAIL"}`);
  console.log(`READY FOR APPLY: ${ready ? "YES" : "NO"}`);

  if (!apply) {
    console.log("");
    console.log("No UPDATE executed.");
    if (!ready) {
      console.log("Abort: unmatched, ambiguous, or missing EN/ZH translations.");
    }
    return;
  }

  if (!ready) {
    throw new Error(
      "Abort: unmatched places or missing EN/ZH translations. Entire update cancelled.",
    );
  }

  const allRows = matched.flatMap((place) => place.rows);

  await prisma.$transaction(
    allRows.map((row) =>
      prisma.placeTranslation.update({
        where: { id: row.translationId },
        data: { description: row.newDescription },
      }),
    ),
  );

  const readBack = await prisma.place.findMany({
    where: { slug: { in: [...uniqueSlugs] } },
    select: {
      slug: true,
      translations: {
        where: { locale: { in: [Locale.en, Locale.zh] } },
        select: { locale: true, description: true },
      },
    },
  });
  const readBySlug = new Map(readBack.map((place) => [place.slug, place]));

  let failed = 0;
  console.log("");
  console.log("READ-BACK");
  for (const place of matched) {
    const stored = readBySlug.get(place.slug);
    for (const row of place.rows) {
      const description =
        stored?.translations.find((t) => t.locale === row.locale)
          ?.description ?? "";
      if (description !== row.newDescription) failed += 1;
    }
    console.log(`- ${place.slug} / ${place.id}`);
  }

  console.log("");
  console.log(`UPDATED: ${allRows.length - failed}`);
  console.log(`FAILED: ${failed}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
