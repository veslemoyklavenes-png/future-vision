export const dynamic = 'force-dynamic'
import { Landmark, GraduationCap, BookOpen, Lightbulb, FileText, ExternalLink } from 'lucide-react'

interface Resource {
  title: string
  description: string
  tags: string[]
  url?: string
}

interface Section {
  icon: typeof Landmark
  title: string
  items: Resource[]
}

const sections: Section[] = [
  {
    icon: Landmark,
    title: 'Organizations',
    items: [
      {
        title: 'Institute for the Future (IFTF)',
        description: 'A nonprofit research organization helping people think systematically about the future. Known for their Foresight Essentials toolkit and future-focused research.',
        tags: ['Research', 'Foresight Tools'],
        url: 'https://www.iftf.org',
      },
      {
        title: 'Copenhagen Institute for Futures Studies',
        description: "One of the world's leading futures studies organizations, offering research, scenarios, and strategic foresight services.",
        tags: ['Research', 'Scenarios'],
        url: 'https://cifs.dk',
      },
      {
        title: 'World Futures Studies Federation',
        description: 'A global network of practicing futurists and futures studies scholars promoting futures thinking worldwide.',
        tags: ['Community', 'Academic'],
        url: 'https://wfsf.org',
      },
    ],
  },
  {
    icon: GraduationCap,
    title: 'Learning & Courses',
    items: [
      {
        title: 'School of International Futures',
        description: 'Offers futures literacy programs and strategic foresight training for organizations and governments.',
        tags: ['Training', 'Government'],
        url: 'https://soif.org.uk',
      },
      {
        title: 'Futures Thinking Specialization (Coursera)',
        description: 'A comprehensive online course series on futures thinking methods and applications from IFTF.',
        tags: ['Online Course', 'Beginner-Friendly'],
        url: 'https://www.coursera.org/specializations/futures-thinking',
      },
      {
        title: 'Foresight University',
        description: 'Resources and community for learning about technological foresight and long-term thinking.',
        tags: ['Technology', 'Community'],
        url: 'https://foresight.org/',
      },
    ],
  },
  {
    icon: BookOpen,
    title: 'Books & Reading',
    items: [
      {
        title: 'Imaginable by Jane McGonigal',
        description: "A guide to using simulation and imagination to prepare for the future, based on IFTF's research methods.",
        tags: ['Simulation', 'Practical Guide'],
        url: 'https://janemcgonigal.com/',
      },
      {
        title: 'The Art of the Long View by Peter Schwartz',
        description: 'The classic introduction to scenario planning from the pioneer at Shell and Global Business Network.',
        tags: ['Scenario Planning', 'Classic'],
        url: 'https://en.wikipedia.org/wiki/The_Art_of_the_Long_View',
      },
      {
        title: 'Futures Thinking Playbook (UN SDG:Learn)',
        description: 'A practical toolkit with methods for applying futures thinking to everyday decisions and planning.',
        tags: ['Toolkit', 'Practical'],
        url: 'https://www.unsdglearn.org/',
      },
    ],
  },
  {
    icon: Lightbulb,
    title: 'Tools & Frameworks',
    items: [
      {
        title: 'Futures Wheel',
        description: 'A structured brainstorming method for identifying direct and indirect consequences of trends or events.',
        tags: ['Method', 'Free'],
        url: 'https://en.wikipedia.org/wiki/Futures_wheel',
      },
      {
        title: 'Three Horizons Framework',
        description: 'A simple framework for thinking about transformation over time, widely used in strategic foresight.',
        tags: ['Framework', 'Strategy'],
        url: 'https://www.h3uni.org/tutorial/three-horizons',
      },
      {
        title: 'Causal Layered Analysis (CLA)',
        description: 'A futures research method developed by Sohail Inayatullah for exploring deeper layers of change.',
        tags: ['Method', 'Advanced'],
        url: 'https://foresight.unglobalpulse.net/blog/tools/causal-layered-analysis/',
      },
    ],
  },
  {
    icon: FileText,
    title: 'Articles & Papers',
    items: [
      {
        title: 'OECD Strategic Foresight',
        description: "OECD's hub for strategic foresight, futures literacy, and anticipatory governance resources.",
        tags: ['Overview', 'OECD'],
        url: 'https://www.oecd.org/en/about/programmes/strategic-foresight.html',
      },
      {
        title: 'Shell Scenarios',
        description: "Shell's scenarios hub, including the 2026 Energy Security Scenarios and earlier work.",
        tags: ['Case Study', 'Corporate'],
        url: 'https://www.shell.com/energy-and-innovation/the-energy-future/scenarios.html',
      },
      {
        title: 'Four Keys to Effective Horizon Scanning (MIT Sloan)',
        description: 'Practical guidance for building better strategic foresight through horizon scanning.',
        tags: ['Academic', 'Business'],
        url: 'https://sloanreview.mit.edu/',
      },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif text-ink mb-2">Resources</h1>
      <p className="text-ink-muted mb-10 leading-relaxed">
        Futures thinking is a real, practiced discipline — not fortune-telling. These are the
        organizations, courses, books, and methods behind it, if you&apos;d like to go deeper.
      </p>

      <div className="space-y-12">
        {sections.map(({ icon: SectionIcon, title, items }) => (
          <section key={title}>
            <div className="flex items-center gap-2 mb-4">
              <SectionIcon size={22} className="text-sage-deep" />
              <h2 className="font-serif text-2xl text-ink">{title}</h2>
            </div>
            <div className="space-y-3">
              {items.map(item => {
                const inner = (
                  <>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-semibold text-ink">{item.title}</h3>
                      {item.url && <ExternalLink size={14} className="text-sage-deep shrink-0" />}
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs text-ink-muted border border-border rounded-full px-3 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )
                return item.url ? (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card rounded-xl border border-border p-5 shadow-sm transition-colors hover:border-sage-mid"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={item.title} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                    {inner}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-sm text-ink-soft mt-12 pt-8 border-t border-border">
        Know a great resource we should include?{' '}
        <a
          href="mailto:veslemoy.klavenes@gmail.com?subject=Resource%20suggestion%20for%20Stories%20for%20the%20Future"
          className="text-sage-deep font-medium hover:underline"
        >
          Let us know
        </a>
      </p>
    </div>
  )
}
