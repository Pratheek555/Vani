// Every claim the landing page makes lives here, so it can be checked against PLAN.md in one pass.
// Keep it honest: Telegram is the only live channel, there is no pricing yet, we name no vendors,
// and there are no testimonials or user numbers until real families give them to us.

export const site = {
  title: 'Vani: help for your parents back home',
  description:
    'Vani lives in your family group chat and helps your parents in India with groceries, medicine refills, lab reports and doctor visits, while you stay in the loop from abroad.',
}

export const links = {
  signup: '/signup',
  login: '/login',
}

export const nav = [
  { label: 'What it does', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Safety', href: '#safety' },
  { label: 'FAQ', href: '#faq' },
]

export const hero = {
  badge: { tag: 'Beta', text: 'For Indian families with a child abroad' },
  title: ['Your parents ask.', 'Vani takes care of it.'],
  body: "Vani lives in your family's group chat and handles what you'd normally sort out from abroad: groceries, medicine refills, lab reports and doctor visits. Your parents just ask in plain English. You stay in the loop, without the 2 AM calls.",
  primary: 'Set up your family',
  secondary: 'See how it works',
  notes: ['Your parents never fill in a form', 'Telegram today. WhatsApp and iMessage next.'],
}

export const problem = {
  label: 'Sound familiar?',
  title: ['You moved abroad.', "The errands didn't."],
  body: [
    "From thousands of kilometres away, you're still the one who reorders Mom's BP tablets, talks Papa through the grocery app and decodes every lab report. Usually in the middle of your night.",
    "Vani takes those errands off your plate and tells you what you need to know once you're awake. Anything urgent still reaches you straight away.",
  ],
}

export const features = {
  label: 'What Vani does',
  title: "Everything you'd do if you were home",
  body: 'Parents ask in plain English or send a photo. Vani does the legwork and checks with the right person before anything is bought.',
  groceries: {
    title: 'Groceries from a text or a photo',
    body: 'Mom sends a photo of her handwritten list, or just says "the usual". Vani builds the cart on a delivery app, sends her the total to confirm, and tracks the order to the door.',
  },
  refills: {
    title: 'Refills before the strip runs out',
    body: 'Snap a medicine strip or prescription once. Vani works out when each medicine will run out and offers to reorder about five days before.',
  },
  reports: {
    title: 'Lab reports in plain English',
    body: 'Send a photo or PDF. Vani explains each value, flags what is out of range, tracks trends over time and suggests questions for the doctor.',
  },
  visits: {
    title: "Ready for every doctor's visit",
    body: 'When an appointment comes up, Vani sends a checklist: reports to carry, current medicines, questions to ask. Afterwards it updates the medicine list from the new prescription.',
  },
  redFlags: {
    title: 'Urgent symptoms get urgent help',
    body: 'Chest pain, a fall or signs of a stroke get emergency guidance and 112 / 108 straight away. Vani also alerts you and the nearest relative, even in quiet mode.',
  },
  vault: {
    title: 'Every report, one message away',
    body: 'Prescriptions, lab reports and discharge summaries are kept in one place. Ask for any of them in a sentence.',
  },
  digest: {
    title: "You're always in the loop",
    body: 'A daily or weekly digest of orders, spending, refills and appointments, sent at a sensible hour in your time zone. Anything urgent reaches you right away.',
  },
}

export const etiquette = {
  label: 'Group manners',
  title: ['Polite in the group.', 'Detailed in private.'],
  body: 'Vani listens in the family group and speaks up only when it clearly helps. Anything personal moves to a private chat with the right person.',
  group: {
    title: 'In the family group',
    points: [
      'Short, warm and rare',
      'At most one unprompted message per topic',
      'Stays out of personal conversations',
      'Quiet hours in both time zones, plus a quiet mode switch',
    ],
  },
  private: {
    title: 'In private chats',
    points: [
      'Carts, totals and approvals',
      'Addresses and delivery updates',
      'Health details, reports and reminders',
      'Shared only with the person it concerns',
    ],
  },
}

export const steps = {
  label: 'How it works',
  title: ['Set up in minutes.', 'Then they just chat.'],
  items: [
    {
      title: 'Create your family',
      body: "Sign up and add yourself and your parents with their time zones. You're the owner, so digests and alerts come to you.",
    },
    {
      title: 'Send everyone their link',
      body: 'Each person gets a personal link. One tap connects their chat to Vani. No passwords, no forms.',
    },
    {
      title: 'Add Vani to your family group',
      body: 'Vani says hello in one short message, then gets to know each parent privately over time: address, regular medicines, preferred apps.',
    },
    {
      title: 'Choose your rules',
      body: 'Decide who approves what and how much Vani can spend. Change it any time just by asking.',
    },
  ],
}

export const rules = {
  label: 'Approvals & spending',
  title: 'Nothing is bought without your rules',
  body: 'Choose how hands-off Vani should be for groceries, medicines and everything else. Change it any time, just by asking.',
  prepare: {
    tag: 'Default',
    title: 'Prepare mode',
    body: 'Vani builds the cart. A family member approves it and pays with a payment link or UPI.',
    points: [
      'Cart summary sent privately to the approver',
      'Pick approvers for each category',
      'Moves to the next approver if nobody replies',
    ],
    note: 'Vani never touches the money.',
    example: { text: 'Your cart is ready: 7 items, ₹684.', action: 'Pay ₹684 with UPI' },
  },
  policy: {
    tag: 'Your rules',
    title: 'Set once, change by chat',
    amount: '₹2,000',
    amountCaption: 'Mom approves groceries under this',
    points: [
      'Who approves groceries, medicines and the rest',
      'Auto-approve under an amount you choose',
      'A hard monthly spending cap',
      'Who gets an FYI',
    ],
    ask: 'Vani, let Mom approve groceries under ₹2,000',
    reply: 'Done. Mom can approve grocery orders under ₹2,000. Bigger ones still come to you.',
  },
  autonomous: {
    tag: 'Optional',
    title: 'Autonomous mode',
    body: 'For routine orders. Vani checks out with cash on delivery or a prepaid store wallet, within your limits.',
    points: [
      'Per-order and monthly caps',
      'Any OTP or UPI prompt goes back to a person',
      'Every rupee recorded in the audit log',
    ],
    note: 'Card numbers, CVVs, UPI PINs and passwords are never stored.',
    example: { text: 'Ordered with cash on delivery: 7 items, ₹684. Arrives 5–6 PM.', action: 'Under your ₹2,000 limit' },
  },
}

export const safety = {
  label: 'Safety & privacy',
  title: 'The rules Vani never breaks',
  body: 'Vani helps with health and money, so the guardrails come built in.',
  items: [
    {
      icon: 'doctor',
      title: 'Not a doctor, and says so',
      body: 'Vani never diagnoses, changes a dose, or tells anyone to start or stop a medicine. It always points back to their doctor.',
    },
    {
      icon: 'emergency',
      title: 'Emergencies come first',
      body: 'Red-flag symptoms get 112 / 108 guidance right away, and you and the nearest relative are alerted, even in quiet mode.',
    },
    {
      icon: 'private',
      title: 'Private stays private',
      body: "Health and money details are shared only in private chats, never in the group, unless that person says it's okay.",
    },
    {
      icon: 'consent',
      title: 'Consent comes first',
      body: "Each parent is asked before any health information is stored, in line with India's DPDP Act. Anything can be deleted on request.",
    },
    {
      icon: 'payments',
      title: 'No payment secrets, ever',
      body: 'Card numbers, CVVs, UPI PINs and passwords are never stored. Every spend is logged where you can see it.',
    },
    {
      icon: 'prescription',
      title: 'Prescriptions required',
      body: 'Prescription medicines are only ordered with a valid prescription on file. No workarounds.',
    },
  ],
  footnote: 'Every family gets its own private Vani with its own storage, kept apart from every other family.',
} as const

export const faq = {
  label: 'FAQ',
  title: 'Questions, answered',
  items: [
    {
      q: 'Which chat apps does Vani work in?',
      a: 'Telegram today, in family groups and private chats. WhatsApp and iMessage are next. Your parents chat with Vani the way they chat with anyone else.',
    },
    {
      q: 'Do my parents need to set anything up?',
      a: 'No. You create the family and send each parent their personal link. They tap it once and start chatting. Vani learns details like their address and regular medicines gradually, in private, not all at once.',
    },
    {
      q: 'Which shops does Vani order from?',
      a: "Grocery and pharmacy delivery apps in India. We're starting with one of each and adding more. If an app has trouble, Vani sends a ready-made list with a link so nothing gets stuck.",
    },
    {
      q: 'Who pays? Does Vani hold our money?',
      a: 'Vani never holds your money. By default it prepares the cart and someone in the family pays with a payment link or UPI. If you switch on autonomous mode, it can use cash on delivery or a prepaid store wallet, within limits you set.',
    },
    {
      q: 'Does Vani give medical advice?',
      a: 'No. Vani explains reports in plain language, keeps track of medicines and refills, and helps prepare for doctor visits. It never diagnoses, changes doses or tells anyone to start or stop a medicine. For anything worrying it points to a doctor, and in an emergency it shares 112 and 108 right away.',
    },
    {
      q: "Who can see my parents' health information?",
      a: "Health details are only shared in private chats, never in the family group unless that parent says it's okay. Vani asks each parent for consent before storing health data, and anything can be deleted on request.",
    },
    {
      q: 'Will Vani spam our family group?',
      a: 'No. It speaks up only when it can clearly help, at most once per topic, and stays out of personal conversations. It respects quiet hours in both time zones, and you can switch on quiet mode any time.',
    },
    {
      q: 'What languages does Vani understand?',
      a: 'English for now, by text and photos. Hindi, regional languages and voice notes are on our list.',
    },
  ],
}

export const cta = {
  title: ['Give your parents a helper.', 'Get your nights back.'],
  body: 'Set up your family in a few minutes. Your parents just tap a link and start chatting.',
  primary: 'Set up your family',
  secondary: 'Log in',
}

export const footer = {
  tagline: 'An errand runner and care assistant for Indian families, living in your group chat.',
  disclaimer:
    'Vani is not a medical service and does not give medical advice. In an emergency, call 112 or 108.',
  credit: 'Built with Keiki and Maritime',
}
