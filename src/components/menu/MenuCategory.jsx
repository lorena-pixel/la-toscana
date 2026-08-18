import MenuItem from "./MenuItem";

function MenuCategory({ category, items }) {
  return (
    <section className="menu-category" id={category.id}>
      <div className="menu-category__heading">
        <span>La Toscana</span>
        <h2>{category.name}</h2>
        <p>{category.description}</p>
      </div>

      <div className="menu-category__items">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default MenuCategory;