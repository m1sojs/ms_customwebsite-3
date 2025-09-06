// components/msAsk.tsx
'use client';

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Image from 'next/image';

let container: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

type AskUIProps = {
    onClose: () => void;
    onNext: (inputValue: string) => void;
    bgColor?: string;
    headerText?: string;
    text?: string;
    image?: string;
    primaryButtonStyle?: string;
    secondaryButtonStyle?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    placeholder?: string;
};

function AskUI({
    onClose,
    onNext,
    bgColor,
    headerText,
    text,
    image,
    primaryButtonStyle,
    secondaryButtonStyle,
    primaryButtonText,
    secondaryButtonText,
    placeholder
}: AskUIProps) {
    const [fading, setFading] = useState(true);
    const [visible, setVisible] = useState(true);
    const [inputValue, setInputValue] = useState('');

    const fadingAnimation = () => {
        if (!visible) {
            setFading(!fading);
            setVisible(!visible);
        } else {
            setFading(!fading);
            setTimeout(() => {
                setVisible(!visible);
                onClose();
            }, 150);
        }
    };

    return (
        visible && (
            <div className={`fixed inset-0 z-[999] flex items-center justify-center ${bgColor || 'bg-black/60'} ${fading ? 'fade-in' : 'fade-out'}`} onClick={onClose}>
                <div onClick={(e) => e.stopPropagation()} className="flex flex-col bg-white backdrop-blur-md rounded-4xl gap-4 p-4 items-center justify-center w-[400px] min-h-[200px] h-auto">
                    {image && <div className="relative w-[128px] h-[128px] mt-2"><Image src={image} fill alt={image} /></div>}
                    <span className="font-black text-black text-xl mt-2 font-prompt text-center">{headerText}</span>
                    <span className="text-black mt-2 font-prompt text-center">{text}</span>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder || 'พิมพ์ที่นี่...'}
                        className="w-full text-black font-prompt px-4 py-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex mt-2 ml-auto gap-2">
                        <span onClick={fadingAnimation} className={`cursor-pointer p-2 rounded-full ${secondaryButtonStyle || 'bg-gray-200 text-black'}`}>
                            {secondaryButtonText || 'ยกเลิก'}
                        </span>
                        <span onClick={() => { fadingAnimation(); onNext(inputValue); }} className={`cursor-pointer px-4 py-2 rounded-full ${primaryButtonStyle || 'bg-red-500 text-white'}`}>
                            {primaryButtonText || 'ยืนยัน'}
                        </span>
                    </div>
                </div>
            </div>
        )
    );
}

type ShowOptions = {
    bgColor?: string;
    headerText?: string;
    text?: string;
    image?: string;
    primaryButtonStyle?: string;
    secondaryButtonStyle?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    placeholder?: string;
};

function show(options: ShowOptions) {
    let onNextCallback: (value: string) => void = () => { };

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
        <AskUI
            onClose={handleClose}
            onNext={(value: string) => onNextCallback(value)}
            {...options}
        />
    );

    return {
        onNext(fn: (value: string) => void) {
            onNextCallback = fn;
        }
    };
}

export const msAsk = { show };
