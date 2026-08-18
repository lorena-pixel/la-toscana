import Hero from "../../components/home/Hero";
import About from "../../components/home/About";
import FeaturedDishes from "../../components/home/FeaturedDishes";
import RestaurantInfo from "../../components/home/RestaurantInfo";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedDishes />
      <RestaurantInfo />
    </>
  );
}

export default Home;