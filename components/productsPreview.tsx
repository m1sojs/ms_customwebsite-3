import Image from "next/image";
import 'aos/dist/aos.css';
import Link from "next/link";

export default function productsPreview() {
    return (
        <div data-aos="fade-up" className="flex mt-20 gap-5">
            <div data-aos="fade-left" data-aos-delay="100" className="hidden xl:flex w-[400px] h-auto !opacity-60 text-white bg-[#32323266] p-4 gap-2 rounded-xl duration-150">
                <Image src="/product.png" width={150} height={150} alt="productImage" className="object-cover rounded-xl" />
                <div className="flex flex-col justify-between h-full leading-tight">
                    <div>
                        <div className="text-gray-400 text-sm font-prompt">สินค้า</div>
                        <span className="text-white">MS Product 1</span>
                        <div className="text-gray-400 text-xs">memorious product description</div>
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <span className="flex gap-2 text-gray-400 font-prompt mt-4">100 Points</span>

                        <div className="flex items-center w-fit ml-6 text-white bg-[#32323266] px-4 py-2 gap-2 rounded-xl duration-150 mt-4">
                            <Image src="/bucket.png" width={20} height={20} alt="viewProduct" />
                            <span className="text-sm">More</span>
                        </div>
                    </div>
                </div>
            </div>

            <div data-aos="fade-left" data-aos-delay="200" className="flex sm:w-[400px] w-[300px] h-auto scale-105 text-white bg-[#32323266] p-4 gap-2 rounded-xl duration-150 shadow-xl">
                <Image src="/product.png" width={150} height={150} alt="productImage" className="object-cover rounded-xl" />
                <div className="flex flex-col justify-between h-full leading-tight">
                    <div>
                        <div className="text-gray-400 text-sm font-prompt">สินค้า</div>
                        <span className="text-white">MS Product 1</span>
                        <div className="text-gray-400 text-xs">memorious product description</div>
                    </div>

                    <div className="w-full flex items-center mt-4">
                        <span className="text-gray-200 font-prompt">100 Points</span>

                        <Link href="/store" className="flex items-center ml-auto text-white bg-[#32323266] hover:bg-[#cd0101]/60 hover:cursor-pointer px-4 py-2 gap-2 rounded-xl duration-150">
                            <Image src="/bucket.png" width={20} height={20} alt="viewProduct" />
                            <span className="text-sm">More</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div data-aos="fade-left" data-aos-delay="300" className="hidden xl:flex w-[400px] h-auto !opacity-60 text-white bg-[#32323266] p-4 gap-2 rounded-xl duration-150">
                <Image src="/product.png" width={150} height={150} alt="productImage" className="object-cover rounded-xl" />
                <div className="flex flex-col justify-between h-full leading-tight">
                    <div>
                        <div className="text-gray-400 text-sm font-prompt">สินค้า</div>
                        <span className="text-white">MS Product 1</span>
                        <div className="text-gray-400 text-xs">memorious product description</div>
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <span className="flex gap-2 text-gray-400 font-prompt mt-4">100 Points</span>

                        <div className="flex items-center w-fit ml-6 text-white bg-[#32323266] px-4 py-2 gap-2 rounded-xl duration-150 mt-4">
                            <Image src="/bucket.png" width={20} height={20} alt="viewProduct" />
                            <span className="text-sm">More</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}