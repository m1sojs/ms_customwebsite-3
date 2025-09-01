import Image from "next/image";
import 'aos/dist/aos.css';
import Link from "next/link";

export default function Teams() {
    return (
        <div data-aos="fade-up" className="flex flex-col items-center mt-40">
            <div className="flex flex-col sm:flex-row gap-2 text-center">
                <span className="text-white text-2xl">Our Developer</span>
                <span className="text-2xl bg-gradient-to-r from-[#ff6161] to-[#cd0101] bg-clip-text text-transparent">
                    Team
                </span>
            </div>
            <span className='text-gray-400 font-prompt text-sm text-center mt-2'>ทีมงานพัฒนาของเรา</span>
            <div className="flex flex-col md:flex-row gap-10 mt-15 items-center justify-between w-full">
                <div data-aos="fade-up" data-aos-delay="100" className="flex flex-col items-center gap-5">
                    <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                        <Image
                            className="w-full h-full object-cover"
                            src="/team_01.jpg"
                            width={150}
                            height={150}
                            alt="Team Member"
                        />
                    </div>


                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white">Miso Js</span>
                        <span className="w-64 text-center text-gray-400 text-xs font-prompt break-words">
                            Full Stack Developer
                        </span>
                        <div className="flex gap-2 mt-1">
                            <Link href="https://www.instagram.com/bntp_rsm/">
                                <Image className="hover:cursor-pointer hover:opacity-60 transition-opacity duration-300" src="/instagram.png" width={20} height={20} alt="#" />
                            </Link>

                            <Link href="https://github.com/m1sojs">
                                <Image className="hover:cursor-pointer hover:opacity-60 transition-opacity duration-300" src="/github.png" width={20} height={20} alt="#" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}