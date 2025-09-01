// components/msConfirm.tsx
'use client';

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Image from 'next/image';

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

type ConfirmUIProps = {
    onClose: () => void;
    onNext: () => void;
    bgColor?: string;
    text?: string;
    image?: string;
    primaryButtonStyle?: string;
    secondaryButtonStyle?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
};

function ConfirmUI({
    onClose,
    onNext,
    bgColor,
    text,
    image,
    primaryButtonStyle,
    secondaryButtonStyle,
    primaryButtonText,
    secondaryButtonText
}: ConfirmUIProps) {
    const [fading, setFading] = useState(true)
    const [visible, setVisible] = useState(true)

    const fadingAnimation = () => {
        if (!visible) {
            setFading(!fading);
            setVisible(!visible)
        } else {
            setFading(!fading);
            setTimeout(() => {
                setVisible(!visible);
                onClose();
            }, 150)
        }
    };

    return (
        (visible &&
            <>
                <div className={`fixed inset-0 z-[999] flex items-center justify-center fade-in ${bgColor || 'bg-black/60'} ${fading ? 'fade-in' : 'fade-out'}`} onClick={onClose} >
                    <div onClick={(e) => e.stopPropagation()} className="flex flex-col bg-white/4 backdrop-blur-md rounded-xl gap-4 p-4 items-center justify-center w-[400px] min-h-[200px] h-auto">
                        <div className="relative w-[128px] h-[128px] mt-2">
                            {image && <Image src={image} fill alt={image}/>}
                        </div>
                        <span className="font-black text-xl mt-2 font-prompt text-center">แน่ใจใช่มั้ย?</span>
                        <span className="mt-2 font-prompt text-center">{text}</span>
                        <div className="flex mt-2 ml-auto gap-2">
                            <span onClick={fadingAnimation} className={`cursor-pointer p-2 rounded-full ${secondaryButtonStyle || 'bg-gray-200 text-black'}`}>
                                {secondaryButtonText || 'ยกเลิก'}
                            </span>
                            <span onClick={()=>{
                                fadingAnimation();
                                onNext();
                            }} className={`cursor-pointer px-4 py-2 rounded-full ${primaryButtonStyle || 'bg-red-500 text-white'}`}>
                                {primaryButtonText || 'ยืนยัน'}
                            </span>
                        </div>
                    </div>
                </div>
            </>
        )

    );
}

type ShowOptions = {
    bgColor?: string;
    text?: string;
    image?: string;
    primaryButtonStyle?: string;
    secondaryButtonStyle?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
};

function show(options: ShowOptions) {
    let onNextCallback: () => void = () => { };

    if (typeof window === 'undefined') return { onNext: () => { } };

    if (!container) {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    }

    const handleClose = () => {
        if (root && container) {
            root.unmount();
            document.body.removeChild(container);
            root = null;
            container = null;
        }
    };

    root?.render(
        <ConfirmUI
            onClose={handleClose}
            onNext={() => onNextCallback()}
            {...options}
        />
    );

    return {
        onNext(fn: () => void) {
            onNextCallback = fn;
        }
    };
}

export const msConfirm = { show };
