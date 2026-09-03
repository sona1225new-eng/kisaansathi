import React, { useState } from 'react'
import useMic from '../hooks/useMic'
import { FiMic, FiMicOff } from 'react-icons/fi'

export default function GlobalMic() {
  const { listening, transcript, answer, intent, startListening, stopListening } = useMic()
  const [showResult, setShowResult] = useState(false)

  const handleClick = () => {
    setShowResult(true)
    listening ? stopListening() : startListening()
  }

  return (
    <>
      {/* Floating mic button - shows on all pages */}
      <button
        onClick={handleClick}
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          listening
            ? 'bg-red-500 animate-pulse scale-110'
            : 'bg-green-600 hover:bg-green-700 hover:scale-105'
        }`}
      >
        {listening ? (
          <FiMicOff className="text-white text-xl" />
        ) : (
          <FiMic className="text-white text-xl" />
        )}
      </button>

      {/* Response box */}
      {showResult && (transcript || answer) && (
        <div className="fixed bottom-36 right-4 left-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          {listening && (
            <p className="text-xs text-green-600 font-semibold mb-2 animate-pulse">
              🎙️ सुन रहा हूं... / Listening...
            </p>
          )}
          {transcript && (
            <p className="text-xs text-gray-400 mb-2">
              आपने कहा: <span className="text-gray-700 font-medium">{transcript}</span>
            </p>
          )}
          {answer && (
            <p className={`text-sm font-medium leading-relaxed ${
              intent === 'unknown' ? 'text-red-500' : 'text-green-700'
            }`}>
              {answer}
            </p>
          )}
          <button
            onClick={() => setShowResult(false)}
            className="text-xs text-gray-400 mt-3 hover:text-gray-600"
          >
            ✕ बंद करें / Close
          </button>
        </div>
      )}
    </>
  )
}
