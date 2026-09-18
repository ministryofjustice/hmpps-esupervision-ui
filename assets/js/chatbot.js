import { init } from '@justiceaiunit/chatbot-widget'
import '@justiceaiunit/chatbot-widget/style.css'

const CONTENT = {
  en: {
    displayTitle: "Hi, I'm Fred",
    placeholder: 'Ask about online check-ins…',
    welcomeMessage:
      "I'm Fred. Ask me about online check-ins — how they work, what you're asked, what happens if you miss one, or how your information is used.",
    suggestedQuestions: [
      'How do online check-ins work?',
      'What will I be asked?',
      'What if I miss a check-in?',
      'Can I stop using online check-ins?',
      'How is my information used?',
    ],
  },
  cy: {
    displayTitle: 'Helo, Fred ydw i',
    placeholder: 'Gofynnwch am online check-ins…',
    welcomeMessage:
      "Fred ydw i. Gofynnwch i mi am online check-ins — sut maen nhw'n gweithio, beth fyddwch chi'n cael ei ofyn, beth sy'n digwydd os ydych chi'n colli un, neu sut mae'ch gwybodaeth yn cael ei defnyddio.",
    suggestedQuestions: [
      'Sut mae online check-ins yn gweithio?',
      "Beth fydda i'n cael fy ngofyn?",
      'Beth os byddaf yn colli check-in?',
      "Alla i roi'r gorau i ddefnyddio online check-ins?",
      'Sut mae fy ngwybodaeth yn cael ei defnyddio?',
    ],
  },
}

const lang = new URLSearchParams(window.location.search).get('lang') === 'cy' ? 'cy' : 'en'
const content = CONTENT[lang]

init({
  container: '#chatbot-root',
  apiBaseUrl: '/api/chatbot/chat',
  domain: 'online-checkins',
  config: {
    assistantName: 'Fred',
    displayTitle: content.displayTitle,
    placeholder: content.placeholder,
    welcomeMessage: content.welcomeMessage,
    suggestedQuestions: content.suggestedQuestions,
    persistSession: false,
    initiallyOpen: false,
    privacyMessage: null,
    privacyUrl: null,
  },
})
