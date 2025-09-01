import { faBolt, faShieldHalved, faGear, faUserTie } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'aos/dist/aos.css';

export default function whyUs() {
    return (
        <div data-aos="fade-up" className="flex flex-col items-center mt-20">
            <div className="flex flex-col sm:flex-row gap-2 text-center">
                <span className="text-white text-2xl">Why choose -</span>
                <span className="text-2xl bg-gradient-to-r from-[#ff6161] to-[#cd0101] bg-clip-text text-transparent">
                    CgxLion Studio ?
                </span>
            </div>
            <span className='text-gray-400 font-prompt text-sm text-center mt-2'>เพราะสินค้าทางเรามีคุณภาพ ตอบสนองต่อผู้ใช้ ตั่งค่าปรับแต่งได้ง่าย ลื่นไหล และ ปลอดภัย</span>
            <div className="flex flex-col md:flex-row gap-10 mt-15 items-center justify-between w-full">
                <div data-aos="fade-up" data-aos-delay="100" className="flex flex-col items-center gap-5">
                    <div className="flex items-center w-fit text-white p-6 gap-2rounded-xl duration-150 mt-auto bg-white/1 border border-white/3 backdrop-blur-md rounded-xl shadow-lg" >
                        <FontAwesomeIcon icon={faBolt} className=" text-3xl duration-500" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white">High Performance</span>
                        <span className="w-64 text-center text-gray-400 text-xs font-prompt break-words">
                            ระบบมีการ Optimize มาอย่างดีมีความลื่นไหลไม่ใช้ทรัพยากรมากจนเกินไป
                        </span>
                    </div>
                </div>
                <div data-aos="fade-up" data-aos-delay="200" className="flex flex-col items-center gap-5">
                    <div className="flex items-center w-fit text-white p-6 gap-2rounded-xl duration-150 mt-auto bg-white/1 border border-white/3 backdrop-blur-md rounded-xl shadow-lg" >
                        <FontAwesomeIcon icon={faShieldHalved} className=" text-3xl duration-500" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white">Secure & Trusted</span>
                        <span className="w-64 text-center text-gray-400 text-xs font-prompt break-words">
                            ระบบมีความปลอดภัย ป้องกันช่องโหว่เป็นอย่างดี และ เชื่อถือได้
                        </span>
                    </div>
                </div>
                <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col items-center gap-5">
                    <div className="flex items-center w-fit text-white p-6 gap-2rounded-xl duration-150 mt-auto bg-white/1 border border-white/3 backdrop-blur-md rounded-xl shadow-lg" >
                        <FontAwesomeIcon icon={faGear} className=" text-3xl duration-500" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white">Easily Config</span>
                        <span className="w-64 text-center text-gray-400 text-xs font-prompt break-words">
                            Config ปรับแต่งได้ง่าย Comment สอนปรับแต่งทุกฟังชั่น
                        </span>
                    </div>
                </div>
                <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col items-center gap-5">
                    <div className="flex items-center w-fit text-white p-6 gap-2rounded-xl duration-150 mt-auto bg-white/1 border border-white/3 backdrop-blur-md rounded-xl shadow-lg" >
                        <FontAwesomeIcon icon={faUserTie} className=" text-3xl duration-500" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white">Service</span>
                        <span className="w-64 text-center text-gray-400 text-xs font-prompt break-words">
                            บริการตลอดหลังการซื้อ พร้อมให้คำแนะนำการ<br/>ติดตั่่งและแก้ปัญหา
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}