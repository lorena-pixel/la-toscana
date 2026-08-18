const dishes = [
  {
    id: 1,
    name: "Tagliatelle al Tartufo",
    description:
      "Pasta fresca, crema suave de parmesano y trufa negra.",
    price: "18,90 €",
    emoji: "🍝",
  },
  {
    id: 2,
    name: "Pizza Toscana",
    description:
      "Tomate, mozzarella, prosciutto, rúcula y parmesano.",
    price: "15,50 €",
    emoji: "🍕",
  },
  {
    id: 3,
    name: "Tiramisú della Casa",
    description:
      "Mascarpone, café espresso, cacao y bizcocho artesanal.",
    price: "7,50 €",
    emoji: "🍰",
  },
];

function FeaturedDishes() {
  return (
    <section className="featured">
      <div className="section-heading">
        <span className="section-label">Favoritos de la casa</span>
        <h2>Platos que siempre apetece repetir</h2>
      </div>

      <div className="featured__grid">
        {dishes.map((dish) => (
          <article className="dish-card" key={dish.id}>
            <div className="dish-card__image">{dish.emoji}</div>

            <div className="dish-card__content">
              <h3>{dish.name}</h3>
              <p>{dish.description}</p>

              <div className="dish-card__footer">
                <strong>{dish.price}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedDishes;