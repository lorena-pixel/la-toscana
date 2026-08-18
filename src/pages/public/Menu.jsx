import { useEffect, useState } from "react";

import MenuCategory from "../../components/menu/MenuCategory";

import {
  getMenuCategories,
  getMenuItems,
} from "../../services/menuService";

import "../../styles/menu.css";

function Menu() {
  const [activeCategory, setActiveCategory] =
    useState("todos");

  const [items, setItems] =
    useState([]);

  const categories =
    getMenuCategories();

  useEffect(() => {
    setItems(getMenuItems());
  }, []);

  const visibleCategories =
    activeCategory === "todos"
      ? categories
      : categories.filter(
          (category) =>
            category.id ===
            activeCategory
        );

  return (
    <main className="menu-page">
      <section className="menu-hero">
        <span>
          La nostra cucina
        </span>

        <h1>
          Nuestra carta
        </h1>

        <p>
          Recetas italianas,
          ingredientes seleccionados
          y platos preparados para
          disfrutar alrededor de la
          mesa.
        </p>
      </section>

      <nav className="menu-filters">
        <button
          className={
            activeCategory ===
            "todos"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveCategory(
              "todos"
            )
          }
        >
          Toda la carta
        </button>

        {categories.map(
          (category) => (
            <button
              key={
                category.id
              }
              className={
                activeCategory ===
                category.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveCategory(
                  category.id
                )
              }
            >
              {
                category.name
              }
            </button>
          )
        )}
      </nav>

      <div className="menu-content">
        {visibleCategories.map(
          (category) => {
            const categoryItems =
              items.filter(
                (item) =>
                  item.category ===
                  category.id
              );

            if (
              categoryItems.length ===
              0
            ) {
              return null;
            }

            return (
              <MenuCategory
                key={
                  category.id
                }
                category={
                  category
                }
                items={
                  categoryItems
                }
              />
            );
          }
        )}
      </div>

      <section className="menu-allergen-info">
        <h3>
          Información sobre
          alérgenos
        </h3>

        <p>
          Si tienes alguna alergia
          o intolerancia alimentaria,
          consulta con nuestro equipo
          antes de realizar tu
          pedido.
        </p>
      </section>
    </main>
  );
}

export default Menu;