// =================================================== //
// == FINAL SCRIPT - AUTOMATIC PRICE FETCHING ENABLED == //
// == FOR VERCEL DEPLOYMENT - AUGUST 29, 2025        == //
// =================================================== //

// --- Mobile menu toggle ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// --- Hero Slideshow ---
let slideIndex = 0;
let slideTimeout;
showSlides();
function showSlides() {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    if (!slides.length || !dots.length) return;
    for (i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }
    for (i = 0; i < dots.length; i++) { dots[i].className = dots[i].className.replace(" active", ""); }
    if (slides[slideIndex - 1] && dots[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }
    slideTimeout = setTimeout(showSlides, 5000);
}
function currentSlide(n) {
    clearTimeout(slideTimeout);
    slideIndex = n - 1;
    showSlides();
}

// --- Package Card Selection ---
const packageCards = document.querySelectorAll('.package-card');
packageCards.forEach(card => {
    card.addEventListener('click', (event) => {
        if (event.target.closest('.ai-icon, .ai-icon-light')) { return; }
        packageCards.forEach(c => c.classList.remove('package-card-selected'));
        card.classList.add('package-card-selected');
    });
});

// --- Gemini AI Features ---
const apiKey = "AIzaSyDKEYeMjClEjwsSUyjDrBrvHufSesi-aBk "; // <--- PASTE YOUR NEW, SECRET API KEY HERE
const apiUrl = `https://generativela...`; // (API URL remains the same)
const modal = document.getElementById('ai-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

function closeModal() { if (modal) { modal.classList.add('hidden'); } }

async function callGeminiAPI(prompt, targetElement, isChat = false) {
    if (!apiKey) {
        const errorText = "API Key is missing. Please add your secret key to the script.js file.";
        console.error(errorText);
        let errorHtml = `<p class="text-red-500">${errorText}</p>`;
        if (isChat) {
            const errorBubble = document.createElement('div');
            errorBubble.className = 'chat-bubble bot';
            errorBubble.innerHTML = errorHtml;
            targetElement.appendChild(errorBubble);
        } else { targetElement.innerHTML = errorHtml; }
        return;
    }
    const loaderElement = document.createElement('div');
    if (isChat) {
        loaderElement.className = 'chat-bubble bot';
        loaderElement.innerHTML = '<div class="flex justify-center items-center p-1"><div class="loader"></div></div>';
        targetElement.appendChild(loaderElement);
        targetElement.scrollTop = targetElement.scrollHeight;
    } else { targetElement.innerHTML = '<div class="flex justify-center items-center p-4"><div class="loader"></div></div>'; }
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        if (!response.ok) { const errorData = await response.json(); throw new Error(`API request failed: ${errorData.error.message}`); }
        const result = await response.json();
        if (isChat) { loaderElement.remove(); }
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
            let text = result.candidates[0].content.parts[0].text;
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            if (isChat) {
                const botBubble = document.createElement('div');
                botBubble.className = 'chat-bubble bot';
                botBubble.innerHTML = text;
                targetElement.appendChild(botBubble);
                targetElement.scrollTop = targetElement.scrollHeight;
            } else { targetElement.innerHTML = text; }
        } else { throw new Error("No valid response content from API."); }
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorText = "An error occurred. Please try again later.";
        if (isChat) {
            loaderElement.remove();
            const errorBubble = document.createElement('div');
            errorBubble.className = 'chat-bubble bot';
            errorBubble.innerText = errorText;
            targetElement.appendChild(errorBubble);
        } else { targetElement.innerHTML = `<p class="text-red-500">${errorText}</p>`; }
    }
}

async function generateDescription(event, packageName, packageType) {
    event.stopPropagation();
    if (modal && modalTitle && modalContent) {
        modalTitle.innerText = packageName;
        modal.classList.remove('hidden');
        const prompt = `Write a short, fun, and exciting description (about 30-40 words) for a waterpark package called "${packageName}", which is ${packageType}. Make it sound like a great deal and an unmissable experience.`;
        await callGeminiAPI(prompt, modalContent);
    }
}

// --- AI PLANNER ---
const plannerButton = document.getElementById('planner-button');
const plannerInput = document.getElementById('planner-input');
const plannerOutput = document.getElementById('planner-output');
if (plannerButton) {
    plannerButton.addEventListener('click', async () => {
        const userInput = plannerInput.value;
        if (!userInput.trim()) {
            plannerOutput.innerHTML = "<p class='text-red-500'>Please describe your group first!</p>";
            plannerOutput.classList.remove('hidden');
            return;
        }
        plannerOutput.classList.remove('hidden');
        plannerOutput.innerHTML = '<div class="flex justify-center items-center p-4"><div class="loader"></div></div>';
        let livePriceInfo = '';
        try {
            const response = await fetch('/api/get-prices');
            const prices = await response.json();
            if (prices.length > 0) {
                livePriceInfo = prices.map(p => `- ${p.name} (${p.price})`).join('\n');
            } else { livePriceInfo = 'No packages are currently available.'; }
        } catch (error) {
            console.error('Could not fetch live prices for planner:', error);
            plannerOutput.innerHTML = "<p class='text-red-500'>Sorry, we couldn't fetch the latest packages right now. Please try again.</p>";
            return;
        }
        const prompt = `You are an expert day planner for "Ajman Water Park". Your task is to create a fun, personalized itinerary for a visitor.
        Here is the complete and updated list of available packages and their prices:
        ${livePriceInfo}
        Based on that list and the following group description, create a simple itinerary.
        Your response must:
        1. Have a catchy title.
        2. **Strongly recommend the most suitable package(s)** from the list, mentioning why it's a good fit.
        3. Provide a few bullet points for a suggested schedule (e.g., morning, lunch, afternoon).
        Group description: "${userInput}"`;
        await callGeminiAPI(prompt, plannerOutput);
    });
}

// --- AI CHATBOT ---
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');
if (chatbotToggle) chatbotToggle.addEventListener('click', () => chatbotWindow.classList.toggle('hidden'));
if (chatbotClose) chatbotClose.addEventListener('click', () => chatbotWindow.classList.add('hidden'));

const handleChat = async () => {
    const userInput = chatbotInput.value.trim();
    if (!userInput) return;
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerText = userInput;
    chatbotMessages.appendChild(userBubble);
    chatbotInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    let livePriceInfo = '';
    try {
        const response = await fetch('/api/get-prices');
        const prices = await response.json();
        if (prices.length > 0) {
            livePriceInfo = prices.map(p => `- ${p.name}: ${p.price}`).join('\n');
        } else { livePriceInfo = 'Sorry, I couldn\'t retrieve the prices at the moment.'; }
    } catch (error) {
        console.error('Could not fetch live prices:', error);
        livePriceInfo = 'Sorry, there was an error connecting to the pricing system.';
    }
    const prompt = `You are 'Captain Splash', the friendly and fun mascot of Ajman Water Park. Your personality is energetic, helpful, and you love water puns. Answer the user's question based ONLY on the following park information.
    Park Info:
    - Name: Ajman Water Park
    - Location: Ajman Clock Tower, Al Rashidiya 1, Ajman
    - Phone: +971527128173
    - Email: info@gladiators.ae
    - Hours: Mon-Fri (11am-4pm), Sat-Sun & Holidays (9am-5pm)
    - Live Ticket Pricing:
        ${livePriceInfo}
    If the question is about something else, politely say you only know about the water park. If you don't know the answer to a park-related question, say you'll ask the park crew and suggest they call +971527128173.
    User's question: "${userInput}"`;
    await callGeminiAPI(prompt, chatbotMessages, true);
};
if (chatbotSend) chatbotSend.addEventListener('click', handleChat);
if (chatbotInput) chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { handleChat(); } });

// --- Progress Bars & WhatsApp Widget (No changes here) ---
const skillsSection = document.getElementById('skills');
const progressBars = document.querySelectorAll('.progress-bar');
if (skillsSection && progressBars.length > 0) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressBars.forEach(bar => { bar.style.width = bar.dataset.width; });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    skillsObserver.observe(skillsSection);
}
const whatsappContainer = document.querySelector('.whatsapp-chat-container');
if (whatsappContainer) {
    const launcher = whatsappContainer.querySelector('.whatsapp-launcher');
    const closeBtn = whatsappContainer.querySelector('.whatsapp-close-btn');
    const sendBtnLink = whatsappContainer.querySelector('.whatsapp-send-btn');
    const textarea = document.getElementById('whatsapp-input');
    const phoneNumber = '639695890598'; // <--- PALITAN ANG IYONG WHATSAPP NUMBER DITO
    const baseWhatsAppURL = `https://wa.me/${phoneNumber}`;
    if (launcher) launcher.addEventListener('click', () => whatsappContainer.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => whatsappContainer.classList.remove('open'));
    if (textarea && sendBtnLink) {
        textarea.addEventListener('input', () => {
            const message = textarea.value.trim();
            sendBtnLink.href = message ? `${baseWhatsAppURL}?text=${encodeURIComponent(message)}` : baseWhatsAppURL;
        });
    }
}