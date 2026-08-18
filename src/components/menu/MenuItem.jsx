function MenuItem({ item }) {
  return (
    <article
      className={`menu-item ${!item.available ? "menu-item--unavailable" : ""}`}
    >
      <div className="menu-item__top">
        <h3>{item.name}</h3>

        <span className="menu-item__price">
          {item.price.toFixed(2).replace(".", ",")} €
        </span>
      </div>

      <p>{item.description}</p>

      {item.allergens.length > 0 && (
        <div className="menu-item__allergens">
          {item.allergens.map((allergen) => (
            <span key={allergen}>{allergen}</span>
          ))}
        </div>
      )}

      {!item.available && (
        <div className="menu-item__unavailable">
          No disponible temporalmente
        </div>
      )}
    </article>
  );
}

export default MenuItem;