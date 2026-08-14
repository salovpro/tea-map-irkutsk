export type TeaMenuItem = {
  name: string;
  note?: string;
};

export type TeaPlace = {
  id: string;
  name: string;
  coordinates: [number, number];
  shortDescription: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  website: string;
  teaMenu: TeaMenuItem[];
};

/** Три премиальных тестовых заведения Иркутска */
export const teaPlaces: TeaPlace[] = [
  {
    id: "kyakhtinsky-dvor",
    name: "Чайная «Кяхтинский двор»",
    coordinates: [52.28945, 104.28089],
    shortDescription:
      "Камерная чайная в историческом центре с китайскими и сибирскими заварками.",
    logoUrl: null,
    address: "г. Иркутск, ул. Карла Маркса, 15",
    phone: "+7 (3952) 20-16-84",
    website: "https://example.com/kyakhta-dvor",
    teaMenu: [
      { name: "Дянь Хун «Золотые почки»", note: "Байховый" },
      { name: "Шу Пуэр «Кяхтинский караван»", note: "Прессованный" },
      { name: "Самоварный чёрный с вареньем", note: "Классика" },
    ],
  },
  {
    id: "velikiy-put",
    name: "Чайная «Великий Путь»",
    coordinates: [52.2885, 104.292],
    shortDescription:
      "Авторские купажи с саган-дайля и байховый чай в фарфоровых чайниках.",
    logoUrl: null,
    address: "г. Иркутск, ул. Карла Маркса, 12",
    phone: "+7 (3952) 55-00-11",
    website: "https://example.ru/tea-way",
    teaMenu: [
      { name: "Купаж с саган-дайля", note: "Авторский" },
      { name: "Сибирские ягоды", note: "Авторский" },
      { name: "Байховый классический", note: "Байховый" },
    ],
  },
  {
    id: "sibirskaya-gostinaya",
    name: "Сибирская Гостиная",
    coordinates: [52.292, 104.285],
    shortDescription:
      "Купеческое чаепитие на берегу Ангары с байкальской водой и домашней выпечкой.",
    logoUrl: null,
    address: "г. Иркутск, ул. Нижне-Набережная, 4",
    phone: "+7 (3952) 77-88-99",
    website: "https://example.ru/siberian-tea",
    teaMenu: [
      { name: "Травяной сбор «Байкал»", note: "Травы Сибири" },
      { name: "Самоварный чёрный", note: "Байховый" },
      { name: "Настой с лесной земляникой", note: "Авторский" },
    ],
  },
];
