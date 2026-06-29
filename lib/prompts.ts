export interface PersonalDetails {
  age?: string
  location?: string
  relationship?: string
  children?: string
}

export interface WizardAnswers {
  values: string[]
  personalDetails?: PersonalDetails
  currentSituation: string
  futureVision: string
  focusArea: string
  timeframeYears: number
}

export function buildScenarioPrompt(answers: WizardAnswers): string {
  const pd = answers.personalDetails
  const personalSection = pd && Object.values(pd).some(v => v)
    ? `- Personal context: ${[
        pd.age && `Age: ${pd.age}`,
        pd.location && `Location: ${pd.location}`,
        pd.relationship && `Relationship: ${pd.relationship}`,
        pd.children && `Children: ${pd.children}`,
      ].filter(Boolean).join(', ')}`
    : ''

  return `You are a thoughtful future scenario planner. Create a personalized, vivid future scenario for a person based on their answers below. The scenario should feel real, grounded, and personally meaningful – not generic.

PERSON'S PROFILE:
- Core values guiding their work: ${answers.values.join(', ')}
${personalSection}
- Current situation: ${answers.currentSituation}
- Their vision for the future: ${answers.futureVision}
- Main focus area: ${answers.focusArea}
- Timeframe: ${answers.timeframeYears} year(s) from now

Respond with a JSON object in this exact format:
{
  "title": "A short, evocative name for this scenario (max 6 words, e.g. 'The Resilient Author' or 'Creative Independence')",
  "category": "one of: Growth, Transformation, Stability, Adventure, Purpose",
  "scenario_text": "A rich 3-4 paragraph narrative written in second person ('you') describing the future in vivid detail. Use **bold** for key milestones and achievements. Reference specific things from their current situation and values. Paint the scene: what their daily life looks like, what they've achieved, how they feel. Include two 'Horizons' – **Horizon 1** (first half of timeframe) and **Horizon 2** (second half).",
  "action_plan": [
    {
      "title": "Action item title",
      "description": "What to do and why",
      "timeline": "Next 30 days | Next 3 months | Monthly through [year]",
      "priority": "high | medium | low",
      "sub_tasks": ["Concrete step 1", "Concrete step 2", "Concrete step 3"]
    }
  ],
  "future_artifacts": [
    {
      "type": "one of exactly: Social Media Post | News Article | Podcast Episode | Book Review | Project Summary",
      "title": "Title of the imaginary artifact from the future",
      "content": "2-3 sentences of content written AS IF this artifact exists in their future. For Social Media Post: write it as an actual post they would share. For News Article: write it as a real headline + opening paragraph.",
      "relevance": "One sentence explaining why this artifact matters to their journey"
    }
  ]
}

Rules:
- action_plan: 4-5 items, mix of short-term and medium-term
- future_artifacts: EXACTLY 3 items — always include one "Social Media Post" and one "News Article", plus one more of your choice
- Use **bold** markdown in scenario_text for emphasis on key achievements and turning points
- Write in English
- Be specific to THIS person, not generic advice
- Make it inspiring but realistic`
}

export function buildReflectionPrompt(
  scenarioText: string,
  reflectionAnswers: { whatHappened: string; surprises: string; nextSteps: string }
): string {
  return `A person created this future scenario some time ago:

"${scenarioText.substring(0, 500)}..."

Now they're reflecting on what actually happened. Their reflections:
- What happened: ${reflectionAnswers.whatHappened}
- Surprises: ${reflectionAnswers.surprises}
- Next steps they see: ${reflectionAnswers.nextSteps}

Write a short (2-3 paragraph) reflection summary in second person that:
1. Acknowledges what they achieved and what shifted
2. Draws a meaningful connection between their original vision and reality
3. Points toward what's next with encouragement

Keep it warm, honest, and grounded. Max 200 words.`
}
