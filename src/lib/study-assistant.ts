type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type AssistantInput = {
  question: string;
  role: "TEACHER" | "STUDENT";
  contextSummary?: string;
  history?: ChatHistoryItem[];
};

const knowledgeLibrary = {
  mathematics: {
    keywords: ["math", "maths", "mathematics", "algebra", "quadratic", "equation", "geometry", "trigonometry"],
    answer:
      "The best way to understand mathematics is to treat each concept as a pattern, not just a rule.\n\nDefinition: Most maths problems move from known information to an unknown value.\n\nSimple explanation:\n1. Identify what the question gives you.\n2. Mark what you need to find.\n3. Choose the correct formula or method.\n4. Solve it step by step.\n\nExample: In a quadratic equation, the highest power is 2, such as x^2 + 5x + 6 = 0. You can factor it as (x + 2)(x + 3) = 0, so x = -2 or -3.\n\nQuick recap: Follow the pattern: given values, formula, steps, and final answer.",
  },
  physics: {
    keywords: ["physics", "force", "motion", "newton", "energy", "work", "power", "velocity", "acceleration"],
    answer:
      "A simple way to study physics is to split each topic into concept, formula, and application.\n\nDefinition: Physics explains how things move, interact, and change.\n\nSimple explanation:\n1. Understand the principle first.\n2. Learn the formula and units.\n3. Connect it to a real-life example.\n\nExample: Newton's first law says an object stays at rest or in uniform motion unless an external force acts on it.\n\nQuick recap: Understand the concept before trying to memorize the formula.",
  },
  chemistry: {
    keywords: ["chemistry", "acid", "base", "atom", "molecule", "reaction", "periodic table", "bond"],
    answer:
      "A good way to remember chemistry is to think of reactions as small transformations.\n\nDefinition: Chemistry studies the composition, properties, and reactions of matter.\n\nSimple explanation:\n1. Identify the substances involved.\n2. Note their properties.\n3. Describe what changes during the reaction.\n4. State the final products.\n\nExample: Acid and base react to form salt and water. This is called neutralization.\n\nQuick recap: Learn names, formulas, and reaction patterns together.",
  },
  biology: {
    keywords: ["biology", "photosynthesis", "cell", "respiration", "plant", "human body", "organ", "ecosystem"],
    answer:
      "In biology, process flow is often the key idea.\n\nDefinition: Biology is the study of living things and how they function.\n\nSimple explanation:\n1. Look at the structure.\n2. Understand the function.\n3. Learn the order of the process.\n4. Use diagrams to revise.\n\nExample: In photosynthesis, plants use sunlight, carbon dioxide, and water to make food.\n\nQuick recap: Remember biological processes as steps, not just isolated facts.",
  },
  english: {
    keywords: ["english", "poem", "poetry", "grammar", "essay", "letter", "metaphor", "simile", "story"],
    answer:
      "English answers are strongest when they are clear and well-structured.\n\nDefinition: English studies include language, literature, and expression.\n\nSimple explanation:\n1. Identify the main idea.\n2. Pick the important lines or events.\n3. Explain the theme, tone, and message.\n4. Write in your own words.\n\nExample: A simile compares using 'like' or 'as', while a metaphor compares without those words.\n\nQuick recap: Clear understanding and expression matter more than memorization.",
  },
  history: {
    keywords: ["history", "freedom", "war", "revolution", "king", "empire", "movement", "timeline"],
    answer:
      "History answers work best when they follow sequence and cause-and-effect.\n\nDefinition: History studies past events and their impact.\n\nSimple explanation:\n1. State the event.\n2. Mention when it happened.\n3. Explain the causes.\n4. Describe the result.\n\nExample: For a historical movement, include the causes, leaders, major events, and outcome.\n\nQuick recap: Use timeline + causes + effects + conclusion.",
  },
  geography: {
    keywords: ["geography", "climate", "soil", "river", "mountain", "map", "earthquake", "monsoon"],
    answer:
      "Geography becomes easier when you connect place and process.\n\nDefinition: Geography studies the Earth, environments, places, and natural and human processes.\n\nSimple explanation:\n1. Identify the location.\n2. Understand the reason behind the process.\n3. Explain the effects.\n4. Connect it with a map or diagram.\n\nExample: Monsoon winds move because of temperature differences and pressure systems.\n\nQuick recap: Definitions become easier with examples and map thinking.",
  },
  computer: {
    keywords: ["computer", "programming", "python", "java", "algorithm", "database", "network", "html", "css", "javascript"],
    answer:
      "In computer studies, combine concept, example, and practice.\n\nDefinition: Computer science studies data, instructions, programs, and systems.\n\nSimple explanation:\n1. Understand the concept in simple words.\n2. Look at the syntax or structure.\n3. Study one small example.\n4. Understand the output or use case.\n\nExample: An algorithm is a step-by-step method used to solve a problem.\n\nQuick recap: Concept + example + practice is the strongest learning pattern.",
  },
} as const;

const greetingKeywords = ["hello", "hi", "hey", "good morning", "good evening", "good afternoon"];
const thanksKeywords = ["thank you", "thanks", "thx"];
const writingKeywords = ["write", "draft", "email", "message", "paragraph", "essay", "caption", "speech", "rewrite"];
const codingKeywords = ["code", "bug", "error", "javascript", "typescript", "python", "java", "html", "css", "react", "next.js"];
const planKeywords = ["plan", "schedule", "roadmap", "steps", "how do i start", "how should i start"];
const compareKeywords = ["difference", "compare", "vs", "distinguish"];
const summaryKeywords = ["summary", "summarize", "short note", "notes", "brief"];
const definitionKeywords = ["what is", "define", "meaning", "definition"];
const studyPlanKeywords = ["study plan", "revision plan", "how to study", "revise", "preparation", "exam"];
const productivityKeywords = ["focus", "productive", "time management", "procrastination", "routine", "habit"];
const lifeKeywords = ["motivate", "motivation", "confidence", "stress", "tired", "sad", "anxious", "nervous"];
const factualPrefixes = ["who is", "where is", "when did", "why does", "how does", "which is"];

function includesAny(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function withFriendlyIntro(title: string, lines: string[]) {
  return [title, "", ...lines].join("\n");
}

function detectTopic(text: string) {
  for (const [topic, data] of Object.entries(knowledgeLibrary)) {
    if (includesAny(text, data.keywords)) {
      return topic as keyof typeof knowledgeLibrary;
    }
  }

  return null;
}

function buildGreetingAnswer(input: AssistantInput) {
  return withFriendlyIntro("Hi, I can help with that.", [
    "I’m best for study help, writing support, simple coding guidance, planning, summaries, and comparisons.",
    `Current context: ${input.contextSummary || input.role}`,
    "Try something like:",
    '- "Explain photosynthesis in simple words."',
    '- "Write a polite email to my teacher."',
    '- "Help me understand a JavaScript error."',
    '- "Make a study plan for this week."',
  ]);
}

function buildThanksAnswer() {
  return "You’re welcome. Send the next question whenever you’re ready.";
}

function buildStudyPlan(subjectLabel: string) {
  return withFriendlyIntro(`Here is a simple study plan for ${subjectLabel}.`, [
    "1. Spend 25-30 minutes understanding the concept.",
    "2. Spend 20 minutes reviewing examples or solved questions.",
    "3. Spend 20 minutes practicing on your own.",
    "4. Use the last 10 minutes to write a short recap.",
    "5. Do a 5-minute revision the next day.",
    "Quick tip: write down 3 important points at the end of each study session.",
  ]);
}

function buildComparisonAnswer(question: string) {
  return withFriendlyIntro(`A clear way to answer "${question}" is:`, [
    "1. Define the first concept.",
    "2. Define the second concept.",
    "3. Write 3-4 clear points of difference.",
    "4. End with one short example.",
    "Quick structure:",
    "- Meaning",
    "- Main feature",
    "- Use or effect",
    "- One example",
  ]);
}

function buildSummaryAnswer(question: string) {
  return withFriendlyIntro(`Here is a good short-note structure for "${question}".`, [
    "1. Write a one-line introduction to the topic.",
    "2. Add 3-5 key points.",
    "3. Include one example if possible.",
    "4. End with a one-line conclusion.",
    "This format works well for both short exam answers and notes.",
  ]);
}

function buildDefinitionAnswer(question: string) {
  return withFriendlyIntro(`A simple definition-style answer for "${question}" would be:`, [
    "Definition: explain the topic in one simple and accurate line.",
    "Explanation: add 2-3 lines about its role or importance.",
    "Example: include one basic example or real-life use.",
    "Recap: end with a short conclusion.",
  ]);
}

function buildWritingHelp(question: string) {
  return withFriendlyIntro("I can help you write that. Use this structure:", [
    "1. Start with the main purpose in one line.",
    "2. Keep the message clear and direct.",
    "3. Add the important details in short sentences.",
    "4. End politely with a closing line.",
    "If you want, ask again with the exact type of writing you need, such as email, paragraph, speech, essay, or caption.",
  ]);
}

function buildCodingHelp(question: string) {
  return withFriendlyIntro("Let’s break that coding problem down.", [
    "1. Identify the exact error message.",
    "2. Find the file or line that triggers it.",
    "3. Check inputs, variable names, and function arguments.",
    "4. Test one small change at a time.",
    "For a stronger answer, include:",
    "- language or framework",
    "- error message",
    "- expected result",
    "- current code snippet",
  ]);
}

function buildPlanAnswer(question: string) {
  return withFriendlyIntro(`Here’s a practical way to approach "${question}".`, [
    "1. Define the goal clearly.",
    "2. Break it into 3-5 small tasks.",
    "3. Start with the easiest useful step.",
    "4. Review progress at the end of the day.",
    "5. Adjust the next step based on what worked.",
    "If you want, I can also turn it into a daily or weekly plan.",
  ]);
}

function buildProductivityAnswer() {
  return withFriendlyIntro("Here’s a simple productivity method.", [
    "1. Pick one important task.",
    "2. Work on it for 25 minutes without switching.",
    "3. Take a 5-minute break.",
    "4. Repeat this cycle 3-4 times.",
    "5. At the end, write what you finished and what comes next.",
    "Focus improves when the next step is small and clear.",
  ]);
}

function buildLifeSupportAnswer() {
  return withFriendlyIntro("A small reset can help here.", [
    "1. Pause for one minute and breathe slowly.",
    "2. Write down what is bothering you in one sentence.",
    "3. Pick the smallest useful next action.",
    "4. Avoid trying to solve everything at once.",
    "If you want, tell me what is stressing you and I will help you break it down.",
  ]);
}

function buildFactualFallback(question: string) {
  return withFriendlyIntro(`I may not know the exact current answer to "${question}" without live internet access.`, [
    "I can still help by:",
    "1. Explaining the topic or background.",
    "2. Helping you phrase a better question.",
    "3. Giving a likely answer if it is not time-sensitive.",
    "For exact current facts, I would need a live web-connected source.",
  ]);
}

function buildContextualFallback(input: AssistantInput) {
  const recentUserQuestion = [...(input.history ?? [])].reverse().find((item) => item.role === "user")?.content;

  return withFriendlyIntro("I can help with that, but I’ll do better with a little more detail.", [
    "I work best for explanations, definitions, comparisons, summaries, writing help, basic coding guidance, and study or productivity plans.",
    `Current context: ${input.contextSummary || input.role}`,
    recentUserQuestion ? `Recent question: ${recentUserQuestion}` : "Recent question: none",
    "Try asking again in a more specific way and I’ll give you a much better answer.",
  ]);
}

export function generateStudyAssistantAnswer(input: AssistantInput) {
  const normalized = input.question.toLowerCase().trim();
  const topic = detectTopic(normalized);

  if (includesAny(normalized, greetingKeywords)) {
    return buildGreetingAnswer(input);
  }

  if (includesAny(normalized, thanksKeywords)) {
    return buildThanksAnswer();
  }

  if (includesAny(normalized, compareKeywords)) {
    return buildComparisonAnswer(input.question);
  }

  if (includesAny(normalized, summaryKeywords)) {
    return buildSummaryAnswer(input.question);
  }

  if (includesAny(normalized, definitionKeywords)) {
    return buildDefinitionAnswer(input.question);
  }

  if (includesAny(normalized, studyPlanKeywords)) {
    const label = topic ? topic[0].toUpperCase() + topic.slice(1) : "this topic";
    return buildStudyPlan(label);
  }

  if (includesAny(normalized, writingKeywords)) {
    return buildWritingHelp(input.question);
  }

  if (includesAny(normalized, codingKeywords)) {
    return buildCodingHelp(input.question);
  }

  if (includesAny(normalized, planKeywords)) {
    return buildPlanAnswer(input.question);
  }

  if (includesAny(normalized, productivityKeywords)) {
    return buildProductivityAnswer();
  }

  if (includesAny(normalized, lifeKeywords)) {
    return buildLifeSupportAnswer();
  }

  if (topic) {
    return knowledgeLibrary[topic].answer;
  }

  if (factualPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return buildFactualFallback(input.question);
  }

  return buildContextualFallback(input);
}
