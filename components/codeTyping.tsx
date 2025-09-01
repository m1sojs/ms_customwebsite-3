'use client'

import { useEffect, useState } from 'react'
import { Typewriter } from 'react-simple-typewriter'

const codeSnippets = [
  `Citizen.CreateThread(function()
    while true do
        print("Memorious Studio | ยินดีให้บริการ")
        Wait(0)
    ends
end)`,

  `function()
    return "สคริปต์ดี ราคาประหยัด คุณภาพสูง ลื่นไหล"
end`,
  `TriggerServerEvent("cgxlion-studio")
AddEventHandle("cgxlion-studio", function(data)
    ["Custom ได้ตามต้องการเริ่มต้นเพียง 100 บาท"] = data
end)`
]

export default function CodeTyper() {
  const [codeIndex, setCodeIndex] = useState(0)
  const [reset, setReset] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setReset(true)
      setTimeout(() => {
        setCodeIndex((prev) => (prev + 1) % codeSnippets.length)
        setReset(false)
      }, 10)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto p-2 bg-[#1e1e1e66] rounded-xl shadow-lg">
      <div className="flex items-center space-x-2 px-3 py-2">
        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
      </div>

      <div className="font-prompt text-gray-300 text-sm px-4 py-3 whitespace-pre-wrap min-h-[200px]">
        {!reset && (
          <Typewriter
            words={[codeSnippets[codeIndex]]}
            loop={1}
            cursor
            cursorStyle="/"
            typeSpeed={30}
            deleteSpeed={20}
            delaySpeed={2000}
          />
        )}
      </div>
    </div>
  )
}
