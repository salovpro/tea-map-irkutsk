export type PlaceDescriptionUpdate = {
  slug: string;
  ru: string;
  en: string;
  zh: string;
};

/** Approved about-text bodies. Address suffixes are attached at write time. */
export const PLACE_DESCRIPTION_UPDATES: PlaceDescriptionUpdate[] = [
  {
    slug: "sobranie-speshilova",
    ru: "Выставка самоваров в комплексе «Собрание Спешилова» — уникальный объект культурного и исторического наследия не только Иркутской области, подобной коллекции нет на всем пространстве от Урала до Дальнего Востока. Эта постоянная выставка и всегда открыта для гостей комплекса. Коллекция самоваров насчитывает более 350 редких экземпляров, изготовленных различными фабриками и мастерскими России и Зарубежья начиная с XVIII века.",
    en: "The samovar exhibition at the Sobranie Speshilova complex is a unique cultural and historical landmark — not only for the Irkutsk Region. There is no comparable collection anywhere from the Urals to the Far East. This is a permanent exhibition, always open to guests of the complex. The collection numbers more than 350 rare samovars made by factories and workshops in Russia and abroad from the 18th century onward.",
    zh: "「斯佩希洛夫聚会」综合体的茶炊展览是独特的文化与历史遗产，不仅属于伊尔库茨克州——从乌拉尔到远东都找不到类似的收藏。这是常设展览，始终对综合体的客人开放。茶炊收藏有350余件珍品，出自俄罗斯及国外各工厂与作坊，最早可追溯到18世纪。",
  },
  {
    slug: "knyaz-gvidon",
    ru: "Истинное волшебство «Князя Гвидона» ощущается не только на вкус. Интерьеры ресторана оживляют узнаваемые элементы любимой сказки А.С. Пушкина. Каждая деталь — от тщательно выверенного освещения до благородных текстур материалов — подчеркивает уникальность заведения. Особую гордость представляют стены ресторана, расписанные вручную с использованием техники фрески, что создает неповторимый художественный эффект.",
    en: "The true magic of Prince Gvidon is not only on the plate. The interiors bring to life recognizable details of Pushkin’s beloved fairy tale. Every element — from carefully calibrated lighting to noble material textures — underlines the venue’s character. A special pride is the restaurant’s walls, hand-painted in fresco technique, creating a one-of-a-kind artistic effect.",
    zh: "「格维东王子」的魔力不只在味道上。餐厅内部重现普希金心爱童话中可辨认的细节。从精心调校的灯光到材质的高贵质感，每一处都突出场所的独特。尤其令人自豪的是以湿壁画技法手工绘制的墙面，营造出独一无二的艺术效果。",
  },
  {
    slug: "restoran-ohotnikov",
    ru: "Когда-то сюда приходили те, кто хорошо знал тайгу.\nЛюди, для которых Сибирь была не точкой на карте, а частью жизни. Они знали цену настоящему продукту, уважали силу природы и понимали: лучшие истории рождаются не в дороге, а после неё — за большим столом, у живого огня.\n\nТак появилось место, которое назвали «Охотников».\n\nСегодня здесь рады не только тем, кто бывал в тайге. Но и тем, кто только хочет открыть для себя настоящую Сибирь.",
    en: "Once, people who knew the taiga well came here.\nPeople for whom Siberia was not a point on a map, but part of life. They knew the worth of a true product, respected the power of nature, and understood that the best stories are born not on the road, but after it — at a long table, by a live fire.\n\nThat is how the place called “Okhotnikov” appeared.\n\nToday it welcomes not only those who have been to the taiga, but also those who want to discover the real Siberia.",
    zh: "从前，深谙泰加林的人会来到这里。\n对他们而言，西伯利亚不是地图上的一个点，而是生活的一部分。他们懂得真正食材的价值，敬畏自然的力量，也明白：最好的故事不是诞生在路上，而是在路之后——在长桌旁、在活火边。\n\n于是有了名为「猎人」的地方。\n\n今天，这里不仅欢迎去过泰加林的人，也欢迎那些想真正认识西伯利亚的人。",
  },
  {
    slug: "baikal-severnoe-more",
    ru: "Шеф-меню ресторана сочетает европейские и китайские гастрономические традиции. Идеальное место для гастрономических впечатлений с видом на Ангару.",
    en: "The chef’s menu brings together European and Chinese culinary traditions. An ideal place for a gastronomic experience with a view of the Angara.",
    zh: "主厨菜单融合欧洲与中国烹饪传统。在安加拉河景下享受美食体验的理想之地。",
  },
  {
    slug: "chento",
    ru: "Итальянская кухня, изысканные вина и уютная атмосфера. Chento — место для ваших лучших моментов.",
    en: "Italian cuisine, fine wines, and a cozy atmosphere. Chento is a place for your best moments.",
    zh: "意大利菜、精选葡萄酒与舒适氛围。Chento，留给你最美好的时刻。",
  },
  {
    slug: "prego",
    ru: "Итальянский ресторан с 15-летней историей, где каждое блюдо готовится с любовью и по традиционным рецептам!",
    en: "An Italian restaurant with a 15-year history, where every dish is cooked with care and traditional recipes.",
    zh: "拥有15年历史的意大利餐厅，每道菜都按传统食谱用心烹制。",
  },
  {
    slug: "vyuga-mayak",
    ru: "Ресторан «VYЮГА» — гастрономическое приключение и погружение в Сибирскую кухню. Все блюда — это шедевр и, конечно, потрясающий вид на озеро Байкал!",
    en: "Restaurant “VYUGA” is a gastronomic adventure and a dive into Siberian cuisine. Every dish is a masterpiece — and of course there is a stunning view of Lake Baikal.",
    zh: "「VYUGA」餐厅是一场美食冒险，也是对西伯利亚菜的沉浸。每道菜都是杰作，当然还有贝加尔湖的绝美景色。",
  },
  {
    slug: "mangal",
    ru: "Гриль-ресторан с летней верандой. 10 лет непревзойденного качества и прекрасный вид на залив.",
    en: "A grill restaurant with a summer terrace. Ten years of outstanding quality and a beautiful view of the bay.",
    zh: "带夏季露台的烧烤餐厅。十年卓越品质，海湾景色优美。",
  },
  {
    slug: "butin",
    ru: "Здесь каждый может отдохнуть «без галстука», побыть собой, хорошо и вкусно провести время. Именно здесь, в Хасановском переулке, с 1872-го года были знаменитые винные погреба нерчинского миллионера Михаила Бутина — предпринимателя, общественного деятеля, мецената, истинного патриота и просто очень разностороннего и интересного человека из истории нашего города.",
    en: "Here anyone can unwind “without a tie”, be themselves, and spend time well and well-fed. It was here, on Khasanovsky Lane, that from 1872 stood the famous wine cellars of Nerchinsk millionaire Mikhail Butin — entrepreneur, public figure, patron of the arts, a true patriot, and a remarkably many-sided figure in our city’s history.",
    zh: "在这里，人人都可以「不打领带」放松、做自己、吃好喝好。正是在哈萨诺夫斯基巷，自1872年起就有涅尔琴斯克百万富翁米哈伊尔·布京著名的酒窖——他是企业家、社会活动家、赞助人、真正的爱国者，也是本市历史上一位兴趣广泛、极有魅力的人物。",
  },
  {
    slug: "kurbatov",
    ru: "Ресторан Kurbatov — это гастрономический символ современной Сибири в интерьерах светского «Сибирского Петербурга», расположенный на берегу реки Ангары. Авторская кухня, основанная на локальных ингредиентах и тонкой работе с традициями. Меню строится вокруг сезонных и фермерских продуктов, в том числе эндемиков Приангарья.",
    en: "Kurbatov is a gastronomic symbol of contemporary Siberia in the interiors of a worldly “Siberian Petersburg”, on the bank of the Angara. Author’s cuisine grounded in local ingredients and a fine reading of tradition. The menu is built around seasonal and farm products, including endemics of the Angara region.",
    zh: "Kurbatov 是当代西伯利亚的美食象征，坐落在安加拉河畔、带有世俗「西伯利亚彼得堡」气质的室内。主厨料理立足本地食材，并对传统做细腻诠释。菜单围绕时令与农场产品，包括安加拉地区的特有物种。",
  },
  {
    slug: "evropa",
    ru: "Ресторан «Европа» — одно из самых стильных заведений города, островок доброжелательности, отменного вкуса и гостеприимства. Сюда устремляются страстные почитатели вкусной еды, изысканных напитков, и просто те, кто умеет распознавать неповторимый вкус и аромат самой жизни.",
    en: "Restaurant “Evropa” is one of the city’s most stylish venues — an island of warmth, excellent taste, and hospitality. Passionate lovers of good food and refined drinks come here, as do those who know how to recognize the unique flavor and aroma of life itself.",
    zh: "「欧洲」餐厅是城里最有格调的场所之一，友善、好品味与好客的小岛。热爱美食与精致饮品的人会来到这里，也包括那些懂得辨认生活本身独特滋味与香气的人。",
  },
  {
    slug: "klyukva-baykalsk",
    ru: "В ресторане «Клюква» гости могут полноценно отдохнуть от прогулок по живописным окрестностям и насладиться уникальными блюдами сибирской кухни в атмосфере тепла и уюта. «Клюква» славится своим разнообразным меню, предлагающим блюда из свежих и местных ингредиентов, а также изысканные напитки.",
    en: "At restaurant “Klyukva”, guests can fully rest after walks through scenic surroundings and enjoy distinctive Siberian dishes in an atmosphere of warmth and comfort. “Klyukva” is known for a varied menu of fresh local ingredients, as well as refined drinks.",
    zh: "在「蔓越莓」餐厅，客人可以在风景优美的周边散步后好好休息，在温暖舒适的氛围中品尝独特的西伯利亚菜。「蔓越莓」以丰富菜单著称，使用新鲜本地食材，并提供精致饮品。",
  },
  {
    slug: "pepel",
    ru: "Пепел — след открытий сибирского путешественника. Проект вдохновлен величием Долины вулканов и загадочной судьбой иркутского геолога-исследователя Перетолчина. Каждый элемент — прикосновение к атмосфере странствий отважного путешественника, а блюда — как страницы его дневника.",
    en: "Pepel is the trace of a Siberian traveler’s discoveries. The project is inspired by the grandeur of the Valley of Volcanoes and the mysterious fate of Irkutsk geologist-explorer Peretolchin. Every element touches the atmosphere of a brave traveler’s journeys, and the dishes read like pages of his diary.",
    zh: "「灰烬」是一位西伯利亚旅行者发现的痕迹。项目灵感来自火山谷的壮阔，以及伊尔库茨克地质探险家佩列托尔钦神秘的命运。每一处都贴近这位勇敢旅行者的旅途气息，菜品则像他日记中的一页。",
  },
  {
    slug: "kitayskiy-ieroglif",
    ru: "«Китайский Иероглиф» — первый китайский ресторан в Иркутске! Китайские повара готовят для гостей блюда по традиционным рецептам.",
    en: "“Chinese Hieroglyph” is the first Chinese restaurant in Irkutsk. Chinese chefs cook for guests from traditional recipes.",
    zh: "「中国象形文字」是伊尔库茨克第一家中餐厅。中国厨师按传统食谱为客人烹制菜肴。",
  },
  {
    slug: "pappare",
    ru: "Теплый свет, натуральное дерево, живые растения и итальянская кухня без лишнего пафоса. Место, где вечер становится мягче.",
    en: "Warm light, natural wood, living plants, and Italian cooking without extra pomp. A place where the evening grows softer.",
    zh: "暖光、原木、绿植，以及不夸张的意大利菜。晚上会变得更柔软的地方。",
  },
  {
    slug: "chempiony",
    ru: "Это не просто бар или ресторан, а ещё и музей Иркутского спорта с мужской игровой комнатой и караоке. Море еды и трансляции спорственных матчей.",
    en: "Not just a bar or restaurant — also a museum of Irkutsk sport, with a men’s game room and karaoke. Plenty of food and live sports broadcasts.",
    zh: "不只是酒吧或餐厅，还是伊尔库茨克体育博物馆，设有男士游戏室和卡拉OK。食物丰富，并转播体育赛事。",
  },
  {
    slug: "kruzhal",
    ru: "«Кружаль» — то, что русской душе угодно! Это место для веселых людей и отвязных вечеринок. Каждый месяц — новая программа.",
    en: "“Kruzhal” is what a Russian soul wants. A place for cheerful people and uninhibited parties. A new program every month.",
    zh: "「Kruzhal」正合俄罗斯人的心意。这里属于爱热闹的人和尽情的派对。每个月都有新节目。",
  },
  {
    slug: "red-grot",
    ru: "Ресторан и бар у залива. С 2012 года. Сюда приходят за душевным ужином и разговорами с друзьями.",
    en: "A restaurant and bar by the bay. Since 2012. People come for a heartfelt dinner and conversations with friends.",
    zh: "海湾边的餐厅与酒吧。始于2012年。人们来这里吃一顿暖心晚餐，和朋友聊天。",
  },
  {
    slug: "yabloko",
    ru: "Ресторан и караоке про счастливую жизнь.",
    en: "A restaurant and karaoke about a happy life.",
    zh: "关于幸福生活的餐厅与卡拉OK。",
  },
  {
    slug: "kochevnik",
    ru: "Одно из самых необычных мест города. Здесь, благодаря уникальному этническому интерьеру, Вы окунетесь в атмосферу времен Золотой Орды. Попробуете блюда, которые подавали самому Чингисхану.",
    en: "One of the city’s most unusual places. Thanks to a unique ethnic interior, you step into the atmosphere of the Golden Horde. Try dishes once served to Genghis Khan himself.",
    zh: "城里最不寻常的地方之一。独特的民族风室内让你沉浸在金帐汗国时代的氛围中。品尝曾献给成吉思汗本人的菜肴。",
  },
  {
    slug: "grot-pervomayskiy",
    ru: "Деловые обеды, дружеские посиделки, яркие праздники и семейные вечера — всё это ждёт вас в ресторане с европейской кухней, живой атмосферой и заботой о каждом госте!",
    en: "Business lunches, friendly get-togethers, bright celebrations, and family evenings — all await you in a restaurant with European cuisine, a lively atmosphere, and care for every guest.",
    zh: "商务午餐、朋友小聚、热闹节日和家庭夜晚——这一切都在这家欧洲菜餐厅等你，气氛活跃，用心接待每一位客人。",
  },
];
