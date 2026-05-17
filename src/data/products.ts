export type Category = "brownies" | "cookies" | "loaves";

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: string;
}

export const products: Product[] = [
  {
    id: "brownie-1",
    name: "Classic Fudge Brownie",
    category: "brownies",
    description: "Dense, rich and intensely chocolatey with a signature crinkle top.",
    price: "$4.50",
  },
  {
    id: "brownie-2",
    name: "Salted Caramel Brownie",
    category: "brownies",
    description: "Fudgy chocolate brownie with a swirl of house-made salted caramel.",
    price: "$5.00",
  },
  {
    id: "cookie-1",
    name: "Brown Butter Choc Chip",
    category: "cookies",
    description: "Crisp edges, chewy centre, nutty brown butter, finished with flaky sea salt.",
    price: "$3.00",
  },
  {
    id: "cookie-2",
    name: "Biscoff Stuffed Cookie",
    category: "cookies",
    description: "Thick, golden cookie with a molten Biscoff spread centre.",
    price: "$4.00",
  },
  {
    id: "loaf-1",
    name: "Lemon Glazed Loaf",
    category: "loaves",
    description: "Light and zesty lemon cake with a sweet lemon drizzle glaze.",
    price: "$12.00",
  },
  {
    id: "loaf-2",
    name: "Banana Choc Chip Loaf",
    category: "loaves",
    description: "Moist, tender banana bread generously studded with dark chocolate chips.",
    price: "$11.00",
  },
];
