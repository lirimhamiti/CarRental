import type en from "./en";

const mk: typeof en = {
  brand: "Изнајмување возила",
  common: {
    home: "← Почетна",
  },
  home: {
    tagline: "Управување со возен парк и изнајмување",
    stats: {
      cars: "Возила во паркот",
      rentedNow: "Изнајмени сега",
      clients: "Регистрирани клиенти",
    },
    sections: {
      contracts: {
        title: "Договори",
        description: "Креирајте нов договор за изнајмување или пронајдете постоен.",
      },
      cars: {
        title: "Возила",
        description: "Погледнете го возниот парк и проверете кога секое возило е слободно.",
      },
      reports: {
        title: "Извештаи",
        description: "Приходи по возило во последните 6 месеци.",
      },
    },
  },
  cars: {
    eyebrow: "Возен парк",
    title: "Возила",
    empty: "Сè уште нема возила — додадете го првото погоре.",
    table: {
      car: "Возило",
      plate: "Регистарска ознака",
      status: "Статус",
      availability: "Достапност",
    },
    swipeHint: "← Лизгајте налево за повеќе →",
    freeNow: "Слободно сега",
    rentedUntil: "Изнајмено до {date}",
    status: {
      ACTIVE: "Активно",
      MAINTENANCE: "Во сервис",
      RETIRED: "Повлечено",
    },
    addForm: {
      title: "Додај возило",
      make: "Марка *",
      model: "Модел *",
      year: "Година *",
      plate: "Регистарска ознака *",
      status: "Статус",
      submit: "Додади возило",
      submitting: "Се додава…",
      success: "Возилото е додадено во вашиот возен парк.",
    },
    errors: {
      MISSING_FIELDS: "Недостасуваат или се неважечки полиња",
      PLATE_EXISTS: "Возило со оваа регистарска ознака веќе постои во вашиот возен парк",
      GENERIC: "Нешто тргна наопаку",
    },
    detail: {
      back: "← Возила",
      freeNow: "Слободно сега",
      notFree: "Не е слободно сега — изнајмено до {date}",
      bookedDates: "Резервирани датуми",
      noBookings: "Нема идни резервации — ова возило е слободно за секој датум.",
    },
  },
  contracts: {
    eyebrow: "Договор за изнајмување",
    title: "Нов договор",
    client: {
      title: "Клиент",
      existingSelected: "Избран е постоен клиент — полињата се пополнети автоматски",
      nameSurname: "Име Презиме *",
      namePlaceholder: "Име",
      surnamePlaceholder: "Презиме",
      document: "Број на лична карта или пасош *",
      email: "Е-пошта",
      phone: "Телефонски број",
    },
    rental: {
      title: "Изнајмување",
      startDate: "Датум на почеток *",
      endDate: "Датум на завршување *",
      dailyPrice: "Дневна цена *",
      availableCar: "Достапно возило *",
      checking: "Се проверува достапноста…",
      noCars: "Нема слободни возила за овие датуми.",
      selectCar: "Изберете возило",
      day: "ден",
      days: "дена",
      perDay: "/ ден",
      totalPrice: "Вкупна цена",
    },
    created: "Договорот е креиран — преземањето треба да започнало.",
    buttons: {
      create: "Креирај договор",
      creating: "Се креира…",
      download: "Преземи договор",
      newContract: "Нов договор",
    },
    errors: {
      MISSING_FIELDS: "Недостасуваат или се неважечки полиња",
      END_BEFORE_START: "Датумот на завршување не смее да биде пред датумот на почеток",
      CAR_NOT_FOUND: "Возилото не е пронајдено",
      CLIENT_NOT_FOUND: "Клиентот не е пронајден",
      CAR_UNAVAILABLE: "Ова возило повеќе не е достапно за избраните датуми",
      GENERIC: "Нешто тргна наопаку",
    },
  },
  reports: {
    title: "Извештаи",
    placeholder: "Приходи по возило, последните 6 месеци, ќе се прикажат тука.",
  },
};

export default mk;
