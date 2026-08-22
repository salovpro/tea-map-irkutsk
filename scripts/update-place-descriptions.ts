/**
 * One-time RU PlaceTranslation.description update for 21 approved venues.
 * Matches by slug only. Does not change names, addresses, coordinates,
 * tea_menu, EN/ZH, or create/delete rows.
 *
 *   npm run update:descriptions -- --dry-run
 *   npm run update:descriptions -- --apply
 *
 * Default (no flags) is dry-run. Never prints DATABASE_URL.
 *
 * Existing `Адрес: …` suffix is preserved so addresses are not dropped.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Locale, PrismaClient } from "../src/generated/prisma/client";
import { createPgPool } from "../src/lib/pg-pool";

type DescriptionUpdate = {
  requestedName: string;
  slug: string;
  description: string;
};

const updates: DescriptionUpdate[] = [
  {
    requestedName: "Собрание Спешилова",
    slug: "sobranie-speshilova",
    description:
      "Выставка самоваров в комплексе «Собрание Спешилова» — уникальный объект культурного и исторического наследия не только Иркутской области, подобной коллекции нет на всем пространстве от Урала до Дальнего Востока. Эта постоянная выставка и всегда открыта для гостей комплекса. Коллекция самоваров насчитывает более 350 редких экземпляров, изготовленных различными фабриками и мастерскими России и Зарубежья начиная с XVIII века.",
  },
  {
    requestedName: "Князь Гвидон",
    slug: "knyaz-gvidon",
    description:
      "Истинное волшебство «Князя Гвидона» ощущается не только на вкус. Интерьеры ресторана оживляют узнаваемые элементы любимой сказки А.С. Пушкина. Каждая деталь — от тщательно выверенного освещения до благородных текстур материалов — подчеркивает уникальность заведения. Особую гордость представляют стены ресторана, расписанные вручную с использованием техники фрески, что создает неповторимый художественный эффект.",
  },
  {
    requestedName: "Охотников",
    slug: "restoran-ohotnikov",
    description:
      "Когда-то сюда приходили те, кто хорошо знал тайгу. Люди, для которых Сибирь была не точкой на карте, а частью жизни. Они знали цену настоящему продукту, уважали силу природы и понимали: лучшие истории рождаются не в дороге, а после неё - за большим столом, у живого огня.\n\nТак появилось место, которое назвали «Охотников».\n\nСегодня здесь рады не только тем, кто бывал в тайге. Но и тем, кто только хочет открыть для себя настоящую Сибирь.",
  },
  {
    requestedName: "Байкал-Северное море",
    slug: "baikal-severnoe-more",
    description:
      "Шеф-меню ресторана сочетает европейские и китайские гастрономические традиции. Идеальное место для гастрономических впечатлений с видом на Ангару.",
  },
  {
    requestedName: "Chento",
    slug: "chento",
    description:
      "Итальянская кухня, изысканные вина и уютная атмосфера. Chento — место для ваших лучших моментов.",
  },
  {
    requestedName: "Prego",
    slug: "prego",
    description:
      "Итальянский ресторан с 15-летней историей, где каждое блюдо готовится с любовью и по традиционным рецептам!",
  },
  {
    requestedName: "VYЮГА",
    slug: "vyuga-mayak",
    description:
      "Ресторан «VYЮГА» — гастрономическое приключение и погружение в Сибирскую кухню. Все блюда — это шедевр и, конечно, потрясающий вид на озеро Байкал!",
  },
  {
    requestedName: "Мангал",
    slug: "mangal",
    description:
      "Гриль-ресторан с летней верандой. 10 лет непревзойденного качества и прекрасный вид на залив.",
  },
  {
    requestedName: "Butin",
    slug: "butin",
    description:
      'здесь каждый может отдохнуть "без галстука", побыть собой, хорошо и вкусно провести времяо ресторанеИменно здесь, в Хасановском переулке, с 1872-го года были знаменитые винные погреба нерчинского миллионера Михаила Бутина – предпринимателя, общественного деятеля, мецената, истинного патриота и просто очень разностороннего и интересного человека из истории нашего города.',
  },
  {
    requestedName: "Курбатов",
    slug: "kurbatov",
    description:
      "Ресторан Kurbatov – это гастрономический символ современной Сибири в интерьерах светского «Сибирского Петербурга», расположенный на берегу реки Ангары. Авторская кухня, основанная на локальных ингредиентах и тонкой работе с традициями. Меню строится вокруг сезонных и фермерских продуктов, в том числе эндемиков Приангарья.",
  },
  {
    requestedName: "Европа",
    slug: "evropa",
    description:
      "Ресторан «Европа» — одно из самых стильных заведений города, островок доброжелательности, отменного вкуса и гостеприимства. Сюда устремляются страстные почитатели вкусной еды, изысканных напитков, и просто те, кто умеет распознавать неповторимый вкус и аромат самой жизни.",
  },
  {
    requestedName: "Клюква",
    slug: "klyukva-baykalsk",
    description:
      "В ресторане «Клюква» гости могут полноценно отдохнуть от прогулок по живописным окрестностям и насладиться уникальными блюдами сибирской кухни в атмосфере тепла и уюта. «Клюква» славится своим разнообразным меню, предлагающим блюда из свежих и местных ингредиентов, а также изысканные напитки.",
  },
  {
    requestedName: "Пепел",
    slug: "pepel",
    description:
      "Пепел - след открытий сибирского путешественника. Проект вдохновлен величием Долины вулканов и загадочной судьбой иркутского геолога - исследователя Перетолчина. Каждый элемент - прикосновение к атмосфере странствий отважного путешественника, а блюда - как страницы его дневника.",
  },
  {
    requestedName: "Китайский Иероглиф",
    slug: "kitayskiy-ieroglif",
    description:
      "«Китайский Иероглиф» — первый китайский ресторан в Иркутске! Китайские повара готовят для гостей блюда по традиционным рецептам.",
  },
  {
    requestedName: "Паппарэ",
    slug: "pappare",
    description:
      "Теплый свет, натуральное дерево, живые растения и итальянская кухня без лишнего пафоса. Место, где вечер становится мягче.",
  },
  {
    requestedName: "Чемпионы",
    slug: "chempiony",
    description:
      "Это не просто бар или ресторан, а ещё и музей Иркутского спорта с мужской игровой комнатой и караоке. Море еды и трансляции спортивных матчей.",
  },
  {
    requestedName: "Кружаль",
    slug: "kruzhal",
    description:
      '"Кружаль" - то, что русской душе угодно! Это место для веселых людей и отвязных вечеринок. Каждый месяц - новая программа.',
  },
  {
    requestedName: "Red Grot",
    slug: "red-grot",
    description:
      "Ресторан и бар у залива. С 2012 года. Сюда приходят за душевным ужином и разговорами с друзьями.",
  },
  {
    requestedName: "Яблоко",
    slug: "yabloko",
    description: "Ресторан и караоке про счастливую жизнь.",
  },
  {
    requestedName: "Кочевник",
    slug: "kochevnik",
    description:
      "Одно из самых необычных мест города. Здесь, благодаря уникальному этническому интерьеру, Вы окунетесь в атмосферу времен Золотой Орды. Попробуете блюда, которые подавали самому Чингисхану.",
  },
  {
    requestedName: "Grot Первомайский",
    slug: "grot-pervomayskiy",
    description:
      "Деловые обеды, дружеские посиделки, яркие праздники и семейные вечера — всё это ждёт вас в ресторане с европейской кухней, живой атмосферой и заботой о каждом госте!",
  },
];

const BUTIN_NORMALIZED =
  'Здесь каждый может отдохнуть "без галстука", побыть собой, хорошо и вкусно провести время. О ресторане. Именно здесь, в Хасановском переулке, с 1872-го года были знаменитые винные погреба нерчинского миллионера Михаила Бутина – предпринимателя, общественного деятеля, мецената, истинного патриота и просто очень разностороннего и интересного человека из истории нашего города.';

function splitAddressSuffix(description: string): {
  body: string;
  addressLine: string | null;
} {
  const match = description.match(/(\n\s*)?(Адрес:\s*[\s\S]*)$/i);
  if (!match || match.index == null) {
    return { body: description.trim(), addressLine: null };
  }
  return {
    body: description.slice(0, match.index).trim(),
    addressLine: match[2].trim(),
  };
}

function composeDescription(existing: string, approvedBody: string): string {
  const { addressLine } = splitAddressSuffix(existing);
  const body = approvedBody.trim();
  if (!addressLine) return body;
  if (body.includes(addressLine) || body.includes(addressLine.replace(/\.$/, ""))) {
    return body;
  }
  return `${body}\n\n${addressLine}`;
}

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

async function main() {
  const uniqueSlugs = new Set(updates.map((item) => item.slug));
  if (uniqueSlugs.size !== updates.length) {
    throw new Error("Duplicate slugs in description update list");
  }

  const existing = await prisma.place.findMany({
    where: { slug: { in: [...uniqueSlugs] } },
    select: {
      id: true,
      slug: true,
      translations: {
        where: { locale: Locale.ru },
        select: { id: true, name: true, description: true },
      },
    },
  });

  const bySlug = new Map(existing.map((place) => [place.slug, place]));
  const unmatched: string[] = [];
  const missingRu: { requestedName: string; slug: string; id: string }[] = [];
  const matched: {
    requestedName: string;
    slug: string;
    id: string;
    ruTitle: string;
    translationId: string;
    oldDescription: string;
    newDescription: string;
  }[] = [];

  for (const item of updates) {
    const place = bySlug.get(item.slug);
    if (!place) {
      unmatched.push(`${item.requestedName} (${item.slug})`);
      continue;
    }
    const ru = place.translations[0];
    if (!ru) {
      missingRu.push({
        requestedName: item.requestedName,
        slug: item.slug,
        id: place.id,
      });
      continue;
    }
    matched.push({
      requestedName: item.requestedName,
      slug: item.slug,
      id: place.id,
      ruTitle: ru.name,
      translationId: ru.id,
      oldDescription: ru.description,
      newDescription: composeDescription(ru.description, item.description),
    });
  }

  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  console.log("");
  console.log("MATCHED:");
  console.log(`${matched.length} / ${updates.length}`);
  console.log("");
  console.log(
    "| Requested venue | Existing slug/id | Existing RU title | Match confidence |",
  );
  console.log("|---|---|---|---|");
  for (const row of matched) {
    console.log(
      `| ${row.requestedName} | ${row.slug} / ${row.id} | ${row.ruTitle} | high |`,
    );
  }

  console.log("");
  console.log("UNMATCHED:");
  if (unmatched.length === 0) console.log("(none)");
  else unmatched.forEach((line) => console.log(`- ${line}`));

  console.log("");
  console.log("AMBIGUOUS:");
  console.log("(none)");

  console.log("");
  console.log("RU TRANSLATIONS MISSING:");
  if (missingRu.length === 0) console.log("(none)");
  else {
    for (const row of missingRu) {
      console.log(`- ${row.requestedName} (${row.slug} / ${row.id})`);
    }
  }

  console.log("");
  console.log("TEXT ISSUES FOUND:");
  console.log(
    `- Butin: «времяо ресторанеИменно» — склейка в исходнике. Предложенная нормализация (не применяется без подтверждения):\n  ${BUTIN_NORMALIZED}`,
  );
  console.log(
    "- Butin: исходный текст начинается со строчной «здесь».",
  );
  console.log(
    "- Охотников: дефис ASCII в «после неё - за большим столом» (в исходнике).",
  );
  console.log(
    "- Пепел / Кружаль: ASCII-дефисы вокруг пояснений (в исходнике).",
  );

  console.log("");
  console.log("OLD → NEW DESCRIPTION:");
  for (const row of matched) {
    console.log("");
    console.log(`--- ${row.requestedName} (${row.slug}) ---`);
    console.log("OLD:");
    console.log(row.oldDescription);
    console.log("NEW:");
    console.log(row.newDescription);
  }

  const ready =
    unmatched.length === 0 &&
    missingRu.length === 0 &&
    matched.length === updates.length;

  console.log("");
  console.log(`DRY RUN: ${ready ? "PASS" : "FAIL"}`);
  console.log(`READY FOR PRODUCTION UPDATE: ${ready ? "YES" : "NO"}`);

  if (!apply) {
    console.log("");
    console.log("No UPDATE executed.");
    if (!ready) {
      console.log("Abort: unmatched or missing RU translations. Not writing.");
    }
    return;
  }

  if (!ready) {
    throw new Error(
      "Abort: unmatched places or missing RU translations. Entire update cancelled.",
    );
  }

  await prisma.$transaction(
    matched.map((row) =>
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
        where: { locale: Locale.ru },
        select: { description: true },
      },
    },
  });
  const readBySlug = new Map(readBack.map((place) => [place.slug, place]));

  console.log("");
  console.log("READ-BACK");
  for (const item of updates) {
    const place = readBySlug.get(item.slug);
    const description = place?.translations[0]?.description ?? "(missing)";
    console.log(`--- ${item.slug} ---`);
    console.log(description);
  }
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
