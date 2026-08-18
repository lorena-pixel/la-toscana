export const menuCategories = [
  {
    id: "antipasti",
    name: "Antipasti",
    description: "Para comenzar y compartir",
  },
  {
    id: "pasta",
    name: "Pasta",
    description: "Pasta italiana preparada al momento",
  },
  {
    id: "pizza",
    name: "Pizza",
    description: "Masa artesanal de fermentación lenta",
  },
  {
    id: "carne",
    name: "Carne",
    description: "Recetas tradicionales italianas",
  },
  {
    id: "postres",
    name: "Postres",
    description: "El final perfecto",
  },
  {
    id: "bebidas",
    name: "Bebidas",
    description: "Vinos, refrescos y bebidas italianas",
  },
];

export const menuItems = [
  // ANTIPASTI
  {
    id: 1,
    category: "antipasti",
    name: "Bruschetta Toscana",
    description:
      "Pan tostado, tomate fresco, ajo, albahaca y aceite de oliva virgen extra.",
    price: 7.5,
    allergens: ["Gluten"],
    available: true,
  },
  {
    id: 2,
    category: "antipasti",
    name: "Burrata Pugliese",
    description:
      "Burrata cremosa, tomate, rúcula, pesto y aceite de oliva.",
    price: 12.9,
    allergens: ["Lácteos", "Frutos secos"],
    available: true,
  },
  {
    id: 3,
    category: "antipasti",
    name: "Carpaccio di Manzo",
    description:
      "Ternera, parmesano, rúcula, alcaparras y vinagreta de limón.",
    price: 13.9,
    allergens: ["Lácteos"],
    available: true,
  },

  // PASTA
  {
    id: 4,
    category: "pasta",
    name: "Tagliatelle al Tartufo",
    description:
      "Pasta fresca, crema de parmesano y trufa negra.",
    price: 18.9,
    allergens: ["Gluten", "Huevo", "Lácteos"],
    available: true,
  },
  {
    id: 5,
    category: "pasta",
    name: "Spaghetti alla Carbonara",
    description:
      "Guanciale, huevo, pecorino romano y pimienta negra.",
    price: 15.9,
    allergens: ["Gluten", "Huevo", "Lácteos"],
    available: true,
  },
  {
    id: 6,
    category: "pasta",
    name: "Lasagna della Nonna",
    description:
      "Capas de pasta, ragú de ternera, bechamel y parmesano.",
    price: 16.5,
    allergens: ["Gluten", "Huevo", "Lácteos"],
    available: true,
  },

  // PIZZAS
  {
    id: 7,
    category: "pizza",
    name: "Margherita",
    description:
      "Tomate San Marzano, mozzarella, albahaca y aceite de oliva.",
    price: 11.9,
    allergens: ["Gluten", "Lácteos"],
    available: true,
  },
  {
    id: 8,
    category: "pizza",
    name: "Pizza Toscana",
    description:
      "Tomate, mozzarella, prosciutto, rúcula y parmesano.",
    price: 15.5,
    allergens: ["Gluten", "Lácteos"],
    available: true,
  },
  {
    id: 9,
    category: "pizza",
    name: "Quattro Formaggi",
    description:
      "Mozzarella, gorgonzola, fontina y parmesano.",
    price: 14.9,
    allergens: ["Gluten", "Lácteos"],
    available: true,
  },

  // CARNES
  {
    id: 10,
    category: "carne",
    name: "Saltimbocca alla Romana",
    description:
      "Ternera, prosciutto, salvia y salsa de vino blanco.",
    price: 20.9,
    allergens: ["Sulfitos"],
    available: true,
  },
  {
    id: 11,
    category: "carne",
    name: "Pollo alla Toscana",
    description:
      "Pollo con salsa cremosa, tomate seco y hierbas italianas.",
    price: 17.9,
    allergens: ["Lácteos"],
    available: true,
  },

  // POSTRES
  {
    id: 12,
    category: "postres",
    name: "Tiramisú della Casa",
    description:
      "Mascarpone, café espresso, cacao y bizcocho.",
    price: 7.5,
    allergens: ["Gluten", "Huevo", "Lácteos"],
    available: true,
  },
  {
    id: 13,
    category: "postres",
    name: "Panna Cotta",
    description:
      "Panna cotta de vainilla con frutos rojos.",
    price: 6.9,
    allergens: ["Lácteos"],
    available: true,
  },

  // BEBIDAS
  {
    id: 14,
    category: "bebidas",
    name: "Agua mineral",
    description: "Agua mineral 50 cl.",
    price: 2.5,
    allergens: [],
    available: true,
  },
  {
    id: 15,
    category: "bebidas",
    name: "Limonata Italiana",
    description: "Refresco italiano de limón.",
    price: 3.5,
    allergens: [],
    available: true,
  },
  {
    id: 16,
    category: "bebidas",
    name: "Chianti Classico",
    description: "Copa de vino tinto italiano.",
    price: 5.5,
    allergens: ["Sulfitos"],
    available: true,
  },
];