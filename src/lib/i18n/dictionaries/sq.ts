import type en from "./en";

const sq: typeof en = {
  brand: "Qira Makinash",
  common: {
    home: "← Ballina",
  },
  home: {
    tagline: "Menaxhimi i flotës dhe qirasë",
    stats: {
      cars: "Makina në flotë",
      rentedNow: "Të marra me qira tani",
      clients: "Klientë të regjistruar",
    },
    sections: {
      contracts: {
        title: "Kontratat",
        description: "Krijo një kontratë të re qiraje ose kërko një ekzistuese.",
      },
      cars: {
        title: "Makinat",
        description: "Shiko flotën tënde dhe kontrollo kur secila makinë është e lirë.",
      },
      reports: {
        title: "Raportet",
        description: "Të ardhurat për makinë gjatë 6 muajve të fundit.",
      },
    },
  },
  cars: {
    eyebrow: "Flota",
    title: "Makinat",
    empty: "Ende pa makina — shto të parën më sipër.",
    table: {
      car: "Makina",
      plate: "Targa",
      status: "Statusi",
      availability: "Disponueshmëria",
    },
    swipeHint: "← Rrëshqit majtas për më shumë →",
    freeNow: "E lirë tani",
    rentedUntil: "Me qira deri më {date}",
    status: {
      ACTIVE: "Aktive",
      MAINTENANCE: "Në mirëmbajtje",
      RETIRED: "Nxjerrë nga përdorimi",
    },
    addForm: {
      title: "Shto makinë",
      make: "Marka *",
      model: "Modeli *",
      year: "Viti *",
      plate: "Targa *",
      status: "Statusi",
      submit: "Shto makinën",
      submitting: "Duke shtuar…",
      success: "Makina u shtua në flotën tënde.",
    },
    errors: {
      MISSING_FIELDS: "Fusha mungojnë ose janë të pavlefshme",
      PLATE_EXISTS: "Një makinë me këtë targë ekziston tashmë në flotën tënde",
      GENERIC: "Diçka shkoi keq",
    },
    detail: {
      back: "← Makinat",
      freeNow: "E lirë tani",
      notFree: "Nuk është e lirë tani — me qira deri më {date}",
      bookedDates: "Datat e rezervuara",
      noBookings: "Asnjë rezervim i ardhshëm — kjo makinë është e lirë për çdo datë.",
      calendar: {
        prevMonth: "Muaji i kaluar",
        nextMonth: "Muaji tjetër",
        legendBooked: "Me qira",
        legendToday: "Sot",
        months: [
          "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
          "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
        ],
        weekdays: ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"],
      },
    },
  },
  contracts: {
    eyebrow: "Marrëveshje qiraje",
    title: "Kontratë e re",
    client: {
      title: "Klienti",
      existingSelected: "U zgjodh klient ekzistues — fushat u plotësuan automatikisht",
      nameSurname: "Emri Mbiemri *",
      namePlaceholder: "Emri",
      surnamePlaceholder: "Mbiemri",
      document: "Numri i letërnjoftimit ose pasaportës *",
      email: "Email",
      phone: "Numri i telefonit",
    },
    rental: {
      title: "Qiraja",
      startDate: "Data e fillimit *",
      endDate: "Data e mbarimit *",
      dailyPrice: "Çmimi ditor *",
      availableCar: "Makina e disponueshme *",
      checking: "Duke kontrolluar disponueshmërinë…",
      noCars: "Asnjë makinë e lirë për këto data.",
      selectCar: "Zgjidh një makinë",
      day: "ditë",
      days: "ditë",
      perDay: "/ ditë",
      totalPrice: "Çmimi total",
    },
    created: "Kontrata u krijua — shkarkimi duhet të ketë filluar.",
    buttons: {
      create: "Krijo kontratën",
      creating: "Duke krijuar…",
      download: "Shkarko kontratën",
      newContract: "Kontratë e re",
    },
    errors: {
      MISSING_FIELDS: "Fusha mungojnë ose janë të pavlefshme",
      END_BEFORE_START: "Data e mbarimit nuk mund të jetë para datës së fillimit",
      CAR_NOT_FOUND: "Makina nuk u gjet",
      CLIENT_NOT_FOUND: "Klienti nuk u gjet",
      CAR_UNAVAILABLE: "Kjo makinë nuk është më e disponueshme për datat e zgjedhura",
      GENERIC: "Diçka shkoi keq",
    },
  },
  reports: {
    title: "Raportet",
    placeholder: "Të ardhurat për makinë, 6 muajt e fundit, do të shfaqen këtu.",
  },
};

export default sq;
