import { useState, useRef } from 'react'

const FARMING_INTENTS = {
  weather:    ['मौसम', 'बारिश', 'तापमान', 'ठंड', 'गर्मी', 'weather', 'rain', 'temperature', 'forecast'],
  mandi:      ['भाव', 'मंडी', 'कीमत', 'रेट', 'price', 'mandi', 'market', 'rate'],
  crop:       ['फसल', 'बीज', 'खेती', 'सिंचाई', 'crop', 'seed', 'farming', 'paddy', 'wheat', 'maize'],
  fertilizer: ['खाद', 'जैविक', 'कम्पोस्ट', 'जीवामृत', 'fertilizer', 'organic', 'compost'],
  pest:       ['कीट', 'रोग', 'दवाई', 'pest', 'disease', 'insect', 'spray'],
  scheme:     ['योजना', 'सरकार', 'सब्सिडी', 'scheme', 'subsidy', 'government', 'pm kisan']
}

const ANSWERS = {
  weather:    'आपके क्षेत्र में आज मौसम की जानकारी के लिए Weather सेक्शन देखें। / Check the Weather section for today\'s forecast in your area.',
  mandi:      'आज के मंडी भाव के लिए Mandi Prices सेक्शन देखें। / Check the Mandi Prices section for today\'s rates.',
  crop:       'फसल की जानकारी के लिए Crop Care सेक्शन देखें। / Visit the Crop Care section for crop guidance.',
  fertilizer: 'जैविक खाद बनाने की जानकारी के लिए Organic सेक्शन देखें। / Visit the Organic section for fertilizer guides.',
  pest:       'फसल के कीट और रोग की जानकारी के लिए Crop Care सेक्शन देखें। / Check Crop Care for pest and disease alerts.',
  scheme:     'सरकारी योजनाओं की जानकारी के लिए Govt Schemes सेक्शन देखें। / Visit Govt Schemes for subsidy information.',
  unknown:    'कृपया खेती से जुड़ा सवाल पूछें जैसे मौसम, मंडी भाव, फसल, या खाद। / Please ask a farming question about weather, mandi prices, crops, or fertilizer.'
}

function detectIntent(text) {
  const lower = text.toLowerCase()
  for (const [intent, keywords] of Object.entries(FARMING_INTENTS)) {
    if (keywords.some(k => lower.includes(k))) return intent
  }
  return 'unknown'
}

function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'hi-IN'
    utter.rate = 0.9
    window.speechSynthesis.speak(utter)
  }
}

export default function useMic() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [answer, setAnswer] = useState('')
  const [intent, setIntent] = useState(null)
  const recognitionRef = useRef(null)

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setAnswer('आपका browser voice support नहीं करता। / Browser does not support voice.')
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.lang = 'hi-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setListening(true)

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      setTranscript(text)
      const detected = detectIntent(text)
      setIntent(detected)
      const response = ANSWERS[detected]
      setAnswer(response)
      speak(response)
    }

    recognition.onerror = () => {
      setAnswer('आवाज़ सुनने में दिक्कत हुई। दोबारा कोशिश करें। / Could not hear. Please try again.')
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return { listening, transcript, answer, intent, startListening, stopListening }
}
