export interface PersonalDetails {
  age?: string
  gender?: string
  location?: string
  relationship?: string
  children?: string
}

export interface WizardAnswers {
  values: string[]
  personalDetails?: PersonalDetails
  currentSituation: string
  futureVision: string
  /** The person's own words for what gets in their way. Mental contrasting
   *  only works when the obstacle is theirs, so this is never inferred. */
  obstacle: string
  focusArea: string
  timeframeYears: number
}

export interface FutureArtifact {
  id: string
  type: string
  title: string
  content: string
}

/**
 * Every date in the app is computed here, in code — never by the model.
 * Language models are unreliable at month/year arithmetic, which is what
 * produced timelines that drifted outside the chosen horizon. The prompts
 * below hand the model a closed list of dates and forbid it from inventing
 * any others; `repairActionPlan` enforces that on the way back.
 */
export interface Timeline {
  /** "September 2026" — the month the scenario is being created in. */
  today: string
  todayYear: number
  /** Halfway to the horizon, e.g. "March 2027" for a 1-year horizon. */
  midLabel: string
  /** The horizon itself, e.g. "September 2027". */
  targetLabel: string
  targetYear: number
  /** Exactly four action-plan deadlines, spread across the horizon. */
  deadlines: string[]
  horizonYears: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Day 1 avoids end-of-month overflow (Jan 31 + 1 month). */
function addMonths(base: Date, months: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + months, 1)
}

function label(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function buildTimeline(yearsFromNow: number, now: Date = new Date()): Timeline {
  const totalMonths = Math.max(1, Math.round(yearsFromNow * 12))
  const target = addMonths(now, totalMonths)

  // Halfway point, but never "this month" — a 1-year horizon used to place
  // Horizon 1 on today's date because of a floor() on whole years.
  const midMonths = Math.min(totalMonths - 1 || 1, Math.max(1, Math.round(totalMonths / 2)))

  // Four deadlines spread across the horizon, forced strictly increasing so
  // short horizons don't collapse two action items onto the same month.
  const offsets: number[] = []
  for (const fraction of [0.1, 0.3, 0.55, 0.85]) {
    const previous = offsets.length ? offsets[offsets.length - 1] : 0
    let months = Math.max(1, Math.round(totalMonths * fraction))
    if (months <= previous) months = previous + 1
    offsets.push(months)
  }

  return {
    today: label(now),
    todayYear: now.getFullYear(),
    midLabel: label(addMonths(now, midMonths)),
    targetLabel: label(target),
    targetYear: target.getFullYear(),
    deadlines: offsets.map(m => label(addMonths(now, m))),
    horizonYears: yearsFromNow,
  }
}

/** The only month-year strings the model is allowed to write. */
export function allowedDates(timeline: Timeline): string[] {
  return [timeline.today, ...timeline.deadlines, timeline.midLabel, timeline.targetLabel]
}

function dateBlock(timeline: Timeline): string {
  return `DATES — USE THESE EXACTLY, DO NOT CALCULATE ANY OTHERS:
- Today is ${timeline.today}.
- The scenario is set in ${timeline.targetLabel} (${timeline.horizonYears} year(s) from today).
- Halfway point: ${timeline.midLabel}.
- The four action-plan deadlines, in this order: ${timeline.deadlines.map((d, i) => `(${i + 1}) ${d}`).join(', ')}.

Every month-and-year you write must be copied verbatim from the list above. Do not do date arithmetic yourself, do not invent quarters, and never write a date later than ${timeline.targetLabel}. Referring to the person's own past (a year they mentioned in their situation) is fine; inventing future dates is not.`
}

function personalContext(pd?: PersonalDetails): string {
  if (!pd || !Object.values(pd).some(Boolean)) return ''
  return [
    pd.age && `Age: ${pd.age}`,
    pd.gender && `Gender: ${pd.gender}`,
    pd.location && `Location: ${pd.location}`,
    pd.relationship && `Relationship: ${pd.relationship}`,
    pd.children && `Children: ${pd.children}`,
  ].filter(Boolean).join(', ')
}

/**
 * Register instructions shared by both generators. Without these the model
 * defaults to motivational-poster English, which is the wrong voice for a
 * tool about honest, uncertain futures.
 */
const VOICE = `VOICE:
- Calm, grounded, specific. Understated rather than triumphant.
- No hype, no coaching clichés, no exclamation marks, no "you've got this".
- Concrete over abstract: named places, real numbers, small observable details.
- Confident about the details, honest about the uncertainty. Not everything has to have worked out.
- Warm, but never flattering. Write like a thoughtful friend, not a brand.`

export function buildArtifactsPrompt(answers: WizardAnswers): string {
  const timeline = buildTimeline(answers.timeframeYears)
  const pd = personalContext(answers.personalDetails)

  return `You are a creative future scenario designer using the "future artifacts" method from futures thinking.

A future artifact is a tangible piece of media FROM the future — something the person might share, read, or produce in ${timeline.targetLabel}.

${dateBlock(timeline)}

PERSON'S PROFILE:
- Core values: ${answers.values.join(', ')}
${pd ? `- Personal context: ${pd}` : ''}
- Current situation: ${answers.currentSituation}
- Future vision: ${answers.futureVision}
${answers.obstacle ? `- What they say gets in their way: ${answers.obstacle}` : ''}
- Focus area: ${answers.focusArea}

${VOICE}

The obstacle is context, not subject matter. Do not write artifacts about it. Let it keep the artifacts honest — the kind of achievement this person would reach having worked around that, not the kind that assumes it away.

Generate EXACTLY 6 diverse future artifacts that could exist in ${timeline.targetLabel} for this person. Make them specific, evocative, and grounded in their actual situation and values. Mix different types. Keep each "content" to 1-2 punchy sentences — vivid but concise.

Respond with a JSON array ONLY — no other text:
[
  {
    "id": "1",
    "type": "Social Media Post",
    "title": "Short description of what this is",
    "content": "The actual artifact content written AS IF it exists in ${timeline.targetLabel}. For social media: write the actual post. For news article: write the headline + first paragraph. For podcast: write the episode description. Make it feel real and specific to this person."
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

All 6 must feel like genuine artifacts from ${timeline.targetLabel}, not vague descriptions. Be concrete and specific — real-sounding names, numbers, and details rather than generic statements. Do NOT assume the person's gender, a spouse/partner, or children unless stated in their profile above.`
}

export function buildScenarioPrompt(answers: WizardAnswers, selectedArtifacts: FutureArtifact[]): string {
  const timeline = buildTimeline(answers.timeframeYears)
  const pd = personalContext(answers.personalDetails)

  const artifactsSection = selectedArtifacts.map((a, i) =>
    `Artifact ${i + 1} [${a.type}]: "${a.title}" — ${a.content}`
  ).join('\n')

  return `You are a thoughtful future scenario planner. Create a vivid, personal future scenario based on the profile and the 3 future artifacts the person selected.

${dateBlock(timeline)}

PERSON'S PROFILE:
- Core values: ${answers.values.join(', ')}
${pd ? `- Personal context: ${pd}` : ''}
- Current situation: ${answers.currentSituation}
- Their vision: ${answers.futureVision}
${answers.obstacle ? `- In their own words, what gets in their way: "${answers.obstacle}"` : ''}
- Focus area: ${answers.focusArea}

THE 3 FUTURE ARTIFACTS THEY CHOSE (these are windows into their future — build the scenario around them):
${artifactsSection}

${VOICE}

Respond with a JSON object ONLY:
{
  "title": "A short evocative name for this scenario (max 6 words)",
  "category": "one of: Growth, Transformation, Stability, Adventure, Purpose",
  "obstacle_reflection": "Two short paragraphs. See the rules below. Omit this field entirely if no obstacle was given.",
  "scenario_text": "A vivid 3-4 paragraph narrative in second person ('you') set in ${timeline.targetLabel}. Use **bold** for key achievements. Reference the actual artifacts by name. Include two short sections: **Horizon 1 (${timeline.midLabel}):** what has shifted by then, and **Horizon 2 (${timeline.targetLabel}):** where you've arrived. Be specific with places and names from their situation.",
  "action_plan": [
    {
      "title": "Action item title",
      "description": "What to do and why",
      "timeline": "By <one of the four deadlines above>",
      "priority": "high | medium | low",
      "sub_tasks": ["Concrete step 1", "Concrete step 2", "Concrete step 3"]
    }
  ]
}

Rules for "obstacle_reflection" (skip if no obstacle was given):
- This is the one place the future and the obstacle are held side by side. Write it in second person, at most 120 words, in two short paragraphs.
- Use the person's own words for the obstacle. Do not rename it, upgrade it into a condition, or speculate about where it comes from.
- Say concretely where it is likely to meet them on the way to THIS future: which of the four action-plan moments, which month, which specific situation.
- Do not solve it. No advice, no techniques, no reassurance, no "but you've got this". Do not promise it gets easier.
- Do not soften the ending. Stop on the difficulty rather than resolving it — this section earns its place by being the part that does not comfort.
- If the person named an external circumstance rather than something in themselves, take it at face value. Do not correct them or reach for a hidden inner cause.

Rules:
- action_plan: EXACTLY 4 items, in chronological order. Item 1 uses deadline ${timeline.deadlines[0]}, item 2 uses ${timeline.deadlines[1]}, item 3 uses ${timeline.deadlines[2]}, item 4 uses ${timeline.deadlines[3]}. Write each "timeline" as "By <that date>" — copied exactly.
- The only dates permitted anywhere in your response: ${allowedDates(timeline).join(' · ')}.
- scenario_text must reference ALL 3 selected artifacts and must use the two Horizon headers exactly as written above.
- CONCRETE OVER VAGUE: avoid abstract filler like "you've grown so much" or "things have shifted." Show specific, observable details instead. If a line could apply to anyone, rewrite it so it could only be about this person.
- DO NOT ASSUME gender, a spouse, a partner, or children unless they appear in the profile above. Never invent a "wife", "husband", "partner", or kids that weren't stated. If gender is given, you may use matching pronouns; if it is not given, write naturally without assuming one.`
}

/**
 * Last line of defence on dates. Any action-plan timeline that doesn't quote
 * one of the permitted dates is replaced with the deadline that slot was
 * supposed to carry, so a stray model date never reaches the database.
 */
export function repairActionPlan(
  actionPlan: { title: string; description: string; timeline?: string; priority?: string; sub_tasks?: string[] }[] | undefined,
  timeline: Timeline
) {
  const permitted = allowedDates(timeline)
  return (actionPlan ?? []).slice(0, 4).map((item, i) => {
    const fallback = timeline.deadlines[i] ?? timeline.targetLabel
    const quotesPermittedDate = item.timeline && permitted.some(d => item.timeline!.includes(d))
    return {
      ...item,
      timeline: quotesPermittedDate ? item.timeline! : `By ${fallback}`,
      priority: item.priority ?? 'medium',
      sub_tasks: item.sub_tasks ?? [],
    }
  })
}

/** True when the narrative mentions a year beyond the chosen horizon. */
export function hasDateDrift(scenarioText: string | undefined, timeline: Timeline): boolean {
  if (!scenarioText) return false
  const years = scenarioText.match(/\b(20\d{2})\b/g) ?? []
  return years.some(y => Number(y) > timeline.targetYear)
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
3. Points toward what's next

${VOICE}

Keep it honest and grounded. Max 200 words.`
}
