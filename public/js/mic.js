(function () {
    var btn = document.createElement('button')
    btn.id = 'micBtn'
    btn.innerHTML = '🎤'
    btn.setAttribute('style', 'position:fixed;bottom:80px;right:16px;z-index:9999;width:56px;height:56px;border-radius:50%;background:#16a34a;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-size:20px')
    document.body.appendChild(btn)

    var resultDiv = document.createElement('div')
    resultDiv.id = 'micResult'
    resultDiv.setAttribute('style', 'display:none;position:fixed;bottom:150px;right:16px;left:16px;z-index:9999;background:white;border-radius:16px;padding:16px;box-shadow:0 4px 20px rgba(0,0,0,0.15)')
    resultDiv.innerHTML = '<p id="micTranscript" style="font-size:12px;color:#6b7280;margin-bottom:8px"></p><p id="micAnswer" style="font-size:14px;font-weight:500;color:#15803d"></p><button onclick="document.getElementById(\'micResult\').style.display=\'none\'" style="font-size:12px;color:#9ca3af;margin-top:8px;border:none;background:none;cursor:pointer">X Band Karen</button>'
    document.body.appendChild(resultDiv)

    var INTENTS = {
        weather: ['weather', 'rain', 'temperature', 'forecast'],
        mandi: ['price', 'mandi', 'market', 'rate'],
        crop: ['crop', 'seed', 'farming', 'paddy', 'wheat', 'maize'],
        fertilizer: ['fertilizer', 'organic', 'compost'],
        pest: ['pest', 'disease', 'insect', 'spray'],
        scheme: ['scheme', 'subsidy', 'government']
    }

    var ANSWERS = {
        weather: 'Mausam ki jaankari yahan uplabdh hai. Weather info is on this page.',
        mandi: 'Aaj ke mandi bhav yahan dekhein. Check mandi prices on this page.',
        crop: 'Fasal ki jaankari ke liye Crop Care dekhein. Visit Crop Care section.',
        fertilizer: 'Jaivik khad ki jaankari Organic section mein hai. Check Organic section.',
        pest: 'Keet aur rog ki jaankari Crop Care mein hai. Check Crop Care.',
        scheme: 'Sarkari yojanaen Govt Schemes mein hain. Visit Govt Schemes.',
        unknown: 'Kripa kheti se juda sawal poochhen. Please ask a farming question.'
    }

    function detectIntent(text) {
        var lower = text.toLowerCase()
        for (var intent in INTENTS) {
            var keywords = INTENTS[intent]
            for (var i = 0; i < keywords.length; i++) {
                if (lower.indexOf(keywords[i]) !== -1) return intent
            }
        }
        return 'unknown'
    }

    var listening = false
    var recognition

    btn.onclick = function () {
        if (listening) { if (recognition) recognition.stop(); return }
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) { alert('Browser does not support voice'); return }
        recognition = new SR()
        recognition.lang = 'hi-IN'
        recognition.onstart = function () { listening = true; btn.style.background = '#ef4444'; btn.innerHTML = '🔴' }
        recognition.onresult = function (e) {
            var text = e.results[0][0].transcript
            var intent = detectIntent(text)
            var answer = ANSWERS[intent]
            document.getElementById('micTranscript').textContent = 'Aapne kaha: ' + text
            document.getElementById('micAnswer').textContent = answer
            document.getElementById('micAnswer').style.color = intent === 'unknown' ? '#ef4444' : '#15803d'
            document.getElementById('micResult').style.display = 'block'
            var utter = new SpeechSynthesisUtterance(answer)
            utter.lang = 'hi-IN'
            window.speechSynthesis.speak(utter)
        }
        recognition.onend = function () { listening = false; btn.style.background = '#16a34a'; btn.innerHTML = '🎤' }
        recognition.start()
    }
})()