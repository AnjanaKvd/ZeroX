import { Link } from 'react-router-dom';
import { Laptop, Monitor, Headphones, Wifi } from "lucide-react"

export default function CategorySection() {
  const categories = [
    {
      id: 1,
      name: "Laptops",
      icon: <Laptop className="h-10 w-10" />,
      link: "/category/laptops",
      color: "bg-blue-100 text-deep-blue",
    },
    {
      id: 2,
      name: "Desktops",
      icon: <Monitor className="h-10 w-10" />,
      link: "/category/desktops",
      color: "bg-orange-100 text-vibrant-orange",
    },
    {
      id: 3,
      name: "Accessories",
      icon: <Headphones className="h-10 w-10" />,
      link: "/category/accessories",
      color: "bg-green-100 text-green-600",
    },
    {
      id: 4,
      name: "Networking",
      icon: <Wifi className="h-10 w-10" />,
      link: "/category/networking",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <section className="my-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.link}
            className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white"
          >
            <div className={`${category.color} p-4 rounded-full mb-4`}>{category.icon}</div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  )
}

