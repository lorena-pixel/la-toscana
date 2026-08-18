import { useEffect, useMemo, useState } from "react";

import AdminSidebar from "../../components/layout/AdminSidebar";

import {
  createMenuItem,
  deleteMenuItem,
  getMenuCategories,
  getMenuItems,
  updateMenuItem,
} from "../../services/menuService";

const initialForm = {
  name: "",
  category: "antipasti",
  description: "",
  price: "",
  allergens: "",
  available: true,
};

function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories] = useState(getMenuCategories());

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setItems(getMenuItems());
  }, []);

  const filteredItems = useMemo(() => {
    const text = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "todas" ||
        item.category === categoryFilter;

      const matchesSearch =
        !text ||
        item.name?.toLowerCase().includes(text) ||
        item.description?.toLowerCase().includes(text);

      return matchesCategory && matchesSearch;
    });
  }, [items, search, categoryFilter]);

  const getCategoryName = (categoryId) => {
    return (
      categories.find(
        (category) => category.id === categoryId
      )?.name || categoryId
    );
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      category: item.category || "antipasti",
      description: item.description || "",
      price: item.price || "",
      allergens: Array.isArray(item.allergens)
        ? item.allergens.join(", ")
        : "",
      available: item.available !== false,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.price
    ) {
      window.alert(
        "Completa nombre, descripción y precio."
      );

      return;
    }

    const allergens = form.allergens
      .split(",")
      .map((allergen) => allergen.trim())
      .filter(Boolean);

    if (editingId !== null) {
      const currentItem = items.find(
        (item) => item.id === editingId
      );

      if (!currentItem) return;

      const updatedItems = updateMenuItem({
        ...currentItem,
        ...form,

        id: editingId,

        price: Number(form.price),

        allergens,
      });

      setItems(updatedItems);
    } else {
      const newItem = createMenuItem({
        ...form,

        price: Number(form.price),

        allergens,
      });

      setItems((current) => [
        ...current,
        newItem,
      ]);
    }

    handleCancel();
  };

  const handleAvailability = (item) => {
    const updatedItems = updateMenuItem({
      ...item,
      available: !item.available,
    });

    setItems(updatedItems);
  };

  const handleDelete = (item) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${item.name}"?`
    );

    if (!confirmed) return;

    const updatedItems = deleteMenuItem(item.id);

    setItems(updatedItems);
  };

  const availableCount = items.filter(
    (item) => item.available
  ).length;

  const unavailableCount = items.filter(
    (item) => !item.available
  ).length;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header admin-header--row">
          <div>
            <span>Restaurante</span>

            <h1>Carta</h1>

            <p>
              Añade, edita y controla la disponibilidad
              de los platos.
            </p>
          </div>

          <button
            type="button"
            className="menu-admin-add"
            onClick={handleNew}
          >
            + Añadir plato
          </button>
        </header>

        <section className="admin-stats">
          <article className="stat-card">
            <span>Platos</span>
            <strong>{items.length}</strong>
            <p>Total en la carta</p>
          </article>

          <article className="stat-card">
            <span>Disponibles</span>
            <strong>{availableCount}</strong>
            <p>Disponibles actualmente</p>
          </article>

          <article className="stat-card">
            <span>Agotados</span>
            <strong>{unavailableCount}</strong>
            <p>No disponibles</p>
          </article>

          <article className="stat-card">
            <span>Categorías</span>
            <strong>{categories.length}</strong>
            <p>Secciones de la carta</p>
          </article>
        </section>

        {showForm && (
          <section className="admin-panel menu-admin-form-panel">
            <div className="admin-panel__heading">
              <div>
                <span>
                  {editingId !== null
                    ? "Editar"
                    : "Nuevo"}
                </span>

                <h2>
                  {editingId !== null
                    ? "Editar plato"
                    : "Añadir plato"}
                </h2>
              </div>
            </div>

            <form
              className="menu-admin-form"
              onSubmit={handleSubmit}
            >
              <label>
                Nombre

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </label>

              <label>
                Categoría

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="menu-admin-form__full">
                Descripción

                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                />
              </label>

              <label>
                Precio

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </label>

              <label>
                Alérgenos

                <input
                  type="text"
                  name="allergens"
                  value={form.allergens}
                  onChange={handleChange}
                  placeholder="Gluten, Lácteos, Huevo"
                />
              </label>

              <label className="menu-admin-checkbox">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                />

                Disponible
              </label>

              <div className="menu-admin-form__actions">
                <button
                  type="button"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>

                <button type="submit">
                  {editingId !== null
                    ? "Guardar cambios"
                    : "Crear plato"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="admin-panel">
          <div className="menu-admin-toolbar">
            <input
              className="admin-search"
              type="search"
              placeholder="Buscar plato..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              className="admin-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="todas">
                Todas las categorías
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length === 0 ? (
            <div className="admin-empty">
              No hay platos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="menu-admin-grid">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={`menu-admin-card ${
                    item.available
                      ? ""
                      : "menu-admin-card--unavailable"
                  }`}
                >
                  <div className="menu-admin-card__top">
                    <div>
                      <span>
                        {getCategoryName(item.category)}
                      </span>

                      <h3>{item.name}</h3>
                    </div>

                    <strong>
                      {Number(item.price).toLocaleString(
                        "es-ES",
                        {
                          style: "currency",
                          currency: "EUR",
                        }
                      )}
                    </strong>
                  </div>

                  <p>{item.description}</p>

                  {Array.isArray(item.allergens) &&
                    item.allergens.length > 0 && (
                      <div className="menu-admin-allergens">
                        {item.allergens.map((allergen) => (
                          <span key={allergen}>
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}

                  <div className="menu-admin-card__status">
                    <span
                      className={
                        item.available
                          ? "menu-status menu-status--available"
                          : "menu-status menu-status--unavailable"
                      }
                    >
                      {item.available
                        ? "Disponible"
                        : "Agotado"}
                    </span>
                  </div>

                  <div className="menu-admin-card__actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleAvailability(item)
                      }
                    >
                      {item.available
                        ? "Marcar agotado"
                        : "Marcar disponible"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="menu-admin-delete"
                      onClick={() =>
                        handleDelete(item)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminMenu;