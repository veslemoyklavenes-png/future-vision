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

export interface FutureArtifact {
  id: string
  type: string
  title: string
  content: string
}

function getTargetDate(yearsFromNow: number): { targetMonth: string; targetYear: number; startYear: number; midDate: string } {
  const now = new Date()
  const targetYear = now.getFullYear() + yearsFromNow
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const targetMonth = months[now.getMonth()]
  const midYear = now.getFullYear() + Math.floor(yearsFromNow / 2)
  const midMonth = months[now.getMonth()]
  return {
    targetMonth,
    targetYear,
    startYear: now.getFullYear(),
    midDate: `${midMonth} ${midYear}`,
  }
}

export function buildArtifactsPrompt(answers: WizardAnswers): string {
  const { targetMonth, targetYear } = getTargetDate(answers.timeframeYears)
  const pd = answers.personalDetails
  const personalSection = pd && Object.values(pd).some(v => v)
    ? `Personal context: ${[
        pd.age && `Age: ${pd.age}`,
        pd.location && `Location: ${pd.location}`,
        pd.relationship && `Relationship: ${pd.relationship}`,
        pd.children && `Children: ${pd.children}`,
      ].filter(Boolean).join(', ')}`
    : ''

  return `You are a creative future scenario designer using the "future artifacts" method from futures thinking.

A future artifact is a tangible piece of media FROM the future — something the person might share, read, or produce in ${targetMonth} ${targetYear}.

PERSON'S PROFILE:
- Core values: ${answers.values.join(', ')}
${personalSection ? `- ${personalSection}` : ''}
- Current situation: ${answers.currentSituation}
- Future vision: ${answers.futureVision}
- Focus area: ${answers.focusArea}
- Time horizon: ${answers.timeframeYears} year(s) from now = ${targetMonth} ${targetYear}

Generate EXACTLY 8 diverse future artifacts that could exist in ${targetMonth} ${targetYear} for this person. Make them specific, evocative, and grounded in their actual situation and values. Mix different types.

Respond with a JSON array ONLY — no other text:
[
  {
    "id": "1",
    "type": "Social Media Post",
    "title": "Short description of what this is",
    "content": "The actual artifact content written AS IF it exists in ${targetMonth} ${targetYear}. For social media: write the actual post. For news article: write the headline + first paragraph. For podcast: write the episode description. Make it feel real and specific to this person."
  }
]

Use these types (at least one of each of the first two, then vary the rest):
- Social Media Post (LinkedIn, Instagram — write it as an actual post)
- News Article (local or industry news — write headline + opening paragraph)
- Podcast Episode (episode title + description)
- Book excerpt or chapter title they've written
- Email or message they sent or received
- Award or recognition announcement
- Course or workshop they launched
- Review of their work/product/service

All 8 must feel like genuine artifacts from ${targetMonth} ${targetYear}, not vague descriptions.`
}

export function buildScenarioPrompt(answers: WizardAnswers, selectedArtifacts: FutureArtifact[]): string {
  const { targetMonth, targetYear, midDate } = getTargetDate(answers.timeframeYears)
  const pd = answers.personalDetails
  const personalSection = pd && Object.values(pd).some(v => v)
    ? `- Personal context: ${[
        pd.age && `Age: ${pd.age}`,
        pd.location && `Location: ${pd.location}`,
        pd.relationship && `Relationship: ${pd.relationship}`,
        pd.children && `Children: ${pd.children}`,
      ].filter(Boolean).join(', ')}`
    : ''

  const artifactsSection = selectedArtifacts.map((a, i) =>
    `Artifact ${i + 1} [${a.type}]: "${a.title}" — ${a.content}`
  ).join('\n')

  return `You are a thoughtful future scenario planner. Create a vivid, personal future scenario based on the profile and the 3 future artifacts the person selected.

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
SCENARIO DATE: ${targetMonth} ${targetYear}

PERSON'S PROFILE:
- Core values: ${answers.values.join(', ')}
${personalSection}
- Current situation: ${answers.currentSituation}
- Their vision: ${answers.futureVision}
- Focus area: ${answers.focusArea}

THE 3 FUTURE ARTIFACTS THEY CHOSE (these are windows into their future — build the scenario around them):
${artifactsSection}

Respond with a JSON object ONLY:
{
  "title": "A short evocative name for this scenario (max 6 words)",
  "category": "one of: Growth, Transformation, Stability, Adventure, Purpose",
  "scenario_text": "A rich 4-5 paragraph narrative in second person ('you') set in ${targetMonth} ${targetYear}. Use **bold** for key achievements. Reference the actual artifacts by name. Include two sections: **Horizon 1 (${midDate}):** what has shifted by then, and **Horizon 2 (${targetMonth} ${targetYear}):** where you've arrived. Be specific with dates, places, and names from their situation.",
  "action_plan": [
    {
      "title": "Action item title",
      "description": "What to do and why, with a specific deadline month",
      "timeline": "By [Month Year] | Monthly through [Month Year]",
      "priority": "high | medium | low",
      "sub_tasks": ["Concrete step 1", "Concrete step 2", "Concrete step 3"]
    }
  ]
}

Rules:
- action_plan: 4-5 items with SPECIFIC month+year deadlines based on today being ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
- scenario_text must reference ALL 3 selected artifacts
- Use **bold** for key milestones in scenario_text
- Be specific to THIS person, not generic`
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
