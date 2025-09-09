"use client"
import Image from "next/image";
import 'aos/dist/aos.css';
import Link from "next/link";
import { useEffect, useState } from "react";

interface ProductInterface {
  id: number;
  label: string;
  name: string;
  image: string;
  category: string;
  price: number;
  isNew: number;
}

export default function ProductsPreview() {
    const [products, setProducts] = useState<ProductInterface[]>([]);
    
    useEffect(() => {
        const getProducts = async () => {
            try {
                const result = await fetch('/api/getproducts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                if (!result.ok) return;
                const data = await result.json();

                console.log(data)

                setProducts(data.products);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        getProducts();
    }, []);

    return (
        <div data-aos="fade-up" className="flex mt-20 gap-5">
            <div data-aos="fade-left" data-aos-delay="100" className="hidden xl:flex w-[400px] h-auto !opacity-60 text-white bg-[#32323266] p-4 gap-2 rounded-xl duration-150">
                <Image src={products[1]?.image ? products[1].image : "/product.png"} width={150} height={150} alt="productImage" className="object-cover rounded-xl" />
                <div className="flex flex-col w-full h-full leading-tight">
                    <div>
                        <div className="text-gray-400 text-sm font-prompt">{products[1]?.category || "Demo"}</div>
                        <span className="text-white">{products[1]?.label || "Demo Script 2"}</span>
                        <div className="text-gray-400 text-xs">Top 2 of cgxlion product</div>
                    </div>

                    <div className="flex items-center mt-auto">
                    </div>
                </div>
            </div>

            <div data-aos="fade-left" data-aos-delay="200" className="flex sm:w-[400px] w-[300px] h-auto scale-105 text-white bg-[#32323266] p-2 gap-2 rounded-xl duration-150 shadow-xl">
                <Image src={products[0]?.image ? products[0].image : "/product.png"} width={150} height={150} alt="productImage" className="object-cover rounded-xl" />
                <div className="flex flex-col w-full h-full leading-tight">
                    <div>
                        <div className="text-gray-400 text-sm font-prompt">{products[0]?.category}</div>
                        <span className="text-white">{products[0]?.label}</span>
                        <div className="text-gray-400 text-xs">Top 1 of cgxlion product</div>
                    </div>

                    <div className="flex items-center mt-auto">

                        <Link href={`/store/${products[0]?.category}/${products[0]?.name}`} className="flex items-center ml-auto text-white bg-[#32323266] hover:bg-[#cd0101]/60 hover:cursor-pointer px-4 py-2 gap-2 rounded-xl duration-150">
                            <Image src="/bucket.png" width={20} height={20} alt="viewProduct" />
                            <span className="text-sm">More</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div data-aos="fade-left" data-aos-delay="300" className="hidden xl:flex w-[400px] h-auto !opacity-60 text-white bg-[#32323266] p-4 gap-2 rounded-xl duration-150">
                <Image src={products[2]?.image ? products[2].image : "/product.png"} width={150} height={150} alt="productImage" className="object-cover rounded-xl" />
                <div className="flex flex-col w-full h-full leading-tight">
                    <div>
                        <div className="text-gray-400 text-sm font-prompt">{products[2]?.category || "Demo"}</div>
                        <span className="text-white">{products[2]?.label || "Demo Script 3"}</span>
                        <div className="text-gray-400 text-xs">Top 3 of cgxlion product</div>
                    </div>

                    <div className="flex items-center mt-auto">
                    </div>
                </div>
            </div>
        </div>
    )
}