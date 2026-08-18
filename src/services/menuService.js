import {
  menuCategories,
  menuItems,
} from "../data/menu";

const MENU_STORAGE_KEY = "laToscanaMenu";

export function getMenuItems() {
  try {
    const storedMenu = JSON.parse(
      localStorage.getItem(MENU_STORAGE_KEY)
    );

    if (storedMenu) {
      return storedMenu;
    }

    localStorage.setItem(
      MENU_STORAGE_KEY,
      JSON.stringify(menuItems)
    );

    return menuItems;
  } catch (error) {
    console.error(
      "No se pudo cargar la carta:",
      error
    );

    return menuItems;
  }
}

export function saveMenuItems(items) {
  localStorage.setItem(
    MENU_STORAGE_KEY,
    JSON.stringify(items)
  );
}

export function createMenuItem(item) {
  const items = getMenuItems();

  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    price: Number(item.price),
    available: true,
    createdAt: new Date().toISOString(),
  };

  const updatedItems = [
    ...items,
    newItem,
  ];

  saveMenuItems(updatedItems);

  return newItem;
}

export function updateMenuItem(updatedItem) {
  const items = getMenuItems();

  const updatedItems = items.map(
    (item) =>
      item.id === updatedItem.id
        ? {
            ...updatedItem,
            price: Number(updatedItem.price),
            updatedAt: new Date().toISOString(),
          }
        : item
  );

  saveMenuItems(updatedItems);

  return updatedItems;
}

export function deleteMenuItem(id) {
  const items = getMenuItems();

  const updatedItems = items.filter(
    (item) => item.id !== id
  );

  saveMenuItems(updatedItems);

  return updatedItems;
}

export function getMenuCategories() {
  return menuCategories;
}