export const INITIAL_PROJECTS = [
  { id: 1,  name: 'Airbnb campaign',         color: '#185FA5', status: 'in-progress', prog: 70, next: 'Schedule newsletter + TL', due: 'Apr 13' },
  { id: 2,  name: 'Crexi whitepaper',         color: '#3B6D11', status: 'published',   prog: 90, next: 'Jonas quote design',        due: 'Done' },
  { id: 3,  name: 'Purrrmitted Living',        color: '#854F0B', status: 'planning',    prog: 15, next: 'Define strategy + messaging', due: 'TBD' },
  { id: 4,  name: "Data's User Journey",       color: '#534AB7', status: 'planning',    prog: 10, next: 'Create monthly themes',      due: 'TBD' },
  { id: 5,  name: 'Data release automation',   color: '#0F6E56', status: 'in-progress', prog: 75, next: 'Blog distribution module',   due: 'This week' },
  { id: 6,  name: 'RevOps / HubSpot',          color: '#993C1D', status: 'in-progress', prog: 60, next: 'Lead scoring review',        due: 'Ongoing' },
  { id: 7,  name: 'Website v2',                color: '#888780', status: 'postponed',   prog: 30, next: 'Logos + testimonials',       due: 'Apr (delayed)' },
  { id: 8,  name: 'Google Ads',                color: '#E24B4A', status: 'blocked',     prog: 20, next: 'Set up GTM tag',             due: 'Overdue' },
  { id: 9,  name: 'Newsroom update',           color: '#378ADD', status: 'overdue',     prog: 40, next: 'Add Crexi, Airbnb, Dewey',   due: 'Apr 6' },
  { id: 10, name: 'Email marketing',           color: '#639922', status: 'scheduled',   prog: 85, next: 'Schedule newsletter + TL',  due: 'Apr 13' },
]

export const STATUSES = {
  'in-progress': 'In progress',
  published:     'Published',
  planning:      'Planning',
  postponed:     'Postponed',
  blocked:       'Blocked',
  overdue:       'Overdue',
  scheduled:     'Scheduled',
  done:          'Done',
}

export const STATUS_ORDER = ['planning','in-progress','scheduled','published','done','blocked','postponed','overdue']

export const STATUS_TAG = {
  'in-progress': 'blue',
  published:     'green',
  planning:      'amber',
  postponed:     'gray',
  blocked:       'red',
  overdue:       'red',
  scheduled:     'green',
  done:          'green',
}

export const TAG_COLORS = {
  blue:   { bg: 'var(--bluebg)',   tx: 'var(--bluetx)' },
  green:  { bg: 'var(--greenbg)',  tx: 'var(--green)'  },
  amber:  { bg: 'var(--amberbg)',  tx: 'var(--amber)'  },
  red:    { bg: 'var(--redbg)',    tx: 'var(--red)'    },
  purple: { bg: 'var(--purplebg)', tx: 'var(--purple)' },
  teal:   { bg: 'var(--tealbg)',   tx: 'var(--teal)'   },
  coral:  { bg: 'var(--coralbg)',  tx: 'var(--coral)'  },
  gray:   { bg: 'var(--bg2)',      tx: 'var(--tx2)'    },
}

export const TIMELINE_ROWS = [
  { name: 'Airbnb campaign',         color: '#185FA5', l: 5,  w: 45 },
  { name: 'Crexi whitepaper',         color: '#3B6D11', l: 0,  w: 28 },
  { name: 'Purrrmitted Living',        color: '#EF9F27', l: 26, w: 50 },
  { name: "Data's User Journey",       color: '#7F77DD', l: 26, w: 74 },
  { name: 'Data release automation',   color: '#1D9E75', l: 0,  w: 40 },
  { name: 'Website v2',                color: '#BA7517', l: 26, w: 48 },
  { name: 'Google Ads',                color: '#E24B4A', l: 26, w: 30 },
  { name: 'SEO / Content',             color: '#888780', l: 0,  w: 100 },
]

export const CALENDAR_EVENTS = [
  { day: 6,  color: 'var(--red)',    dc: 'APR 6',  label: 'Newsroom update (overdue)',     sub: 'Crexi, Airbnb, Censai, Local Logic' },
  { day: 6,  color: 'var(--bluetx)', dc: 'APR 6',  label: 'Google Ads — set up & trigger', sub: 'GTM tag + site audit checklist' },
  { day: 6,  color: 'var(--bluetx)', dc: 'APR 6',  label: 'Censai + Oril announcements',   sub: 'Partnership posts' },
  { day: 13, color: 'var(--amber)',  dc: 'APR 13', label: 'Newsletter send',                sub: 'Crexi whitepaper, Airbnb, Dewey' },
  { day: 13, color: 'var(--amber)',  dc: 'APR 13', label: 'Thought leadership send',        sub: 'Proptech segment, HS contacts' },
]

export const AIRBNB_TASKS = [
  { icon: 'B', bg: 'var(--greenbg)',  tx: 'var(--green)',   title: 'Blog posts (4 articles)',             desc: 'Articles 4–7 drafted. Renter blog + B2B blog pending scheduling.',  badge: 'green',  label: 'Done'    },
  { icon: 'N', bg: 'var(--amberbg)',  tx: 'var(--amber)',   title: 'Newsletter + thought leadership',      desc: 'Schedule Apr 13. Isolate proptech segment for TL send.',             badge: 'amber',  label: 'Apr 13'  },
  { icon: 'L', bg: 'var(--purplebg)', tx: 'var(--purple)',  title: 'LinkedIn posts (Jonas + Dwellsy)',     desc: 'Assets ready. Schedule posts.',                                     badge: 'blue',   label: 'Ready'   },
  { icon: 'E', bg: 'var(--redbg)',    tx: 'var(--red)',     title: 'B2C email (Sendgrid)',                 desc: 'Confirm launch date with Nikolay before sending.',                   badge: 'red',    label: 'Blocked' },
  { icon: 'P', bg: 'var(--tealbg)',   tx: 'var(--teal)',    title: 'Press release + PR',                  desc: 'EinPresswire. Airbnb landing page copy done.',                       badge: 'teal',   label: 'Ready'   },
]

export const COLORS_POOL = [
  '#185FA5','#3B6D11','#854F0B','#534AB7',
  '#0F6E56','#993C1D','#888780','#E24B4A',
  '#378ADD','#639922','#D4537E','#1D9E75',
]

export const SYSTEM_PROMPT = `You are Horizon AI, an embedded project intelligence assistant for Dwellsy IQ's marketing team. Today is April 7, 2026. The user is Rae (marketer). Key stakeholders: Jonas (founder/LinkedIn), Jim (sales), Lily (HubSpot/automation), Garrett (design/web), Rosalind (Google Ads), Lais (freelance writer), Allyse & Shanti (Crexi), Nikolay (Sendgrid/B2C email).

OVERDUE (due Apr 6): Newsroom update (Crexi, Airbnb, Censai, Local Logic), Google Ads setup + GTM tag, Censai & Oril partnership announcements.

ACTIVE CAMPAIGNS:
- Airbnb: blogs done (4 articles), LinkedIn posts ready, newsletter/TL due Apr 13, B2C email BLOCKED on Nikolay confirmation, PR/press release ready
- Crexi whitepaper: published Mar 23, Jonas quote design pending
- Purrrmitted Living: strategy not yet defined — need messaging + content calendar + assets + video script for Jonas
- Data's User Journey: strategic vision + monthly themes not yet created

WORKSTREAMS:
- Data Release Automation: modules 1+2 done, blog distribution (final piece) still missing. Jim's sales automation queued next.
- RevOps/HubSpot: lead scoring live, MQL workflow updated, data dictionary page on blog needed
- Website v2: postponed to April — needs logos + testimonials (Jim gathering), data dictionary button, data sample, site audit checklist for Rosalind
- SEO/Content: ongoing hub content + internal linking strategy, AEO analysis (Profound) pending
- Google Ads: blocked — GTM tag not created, site audit checklist not sent to Rosalind
- Email marketing Apr 13: newsletter + thought leadership ready to schedule, proptech segment isolated for TL

UPCOMING: Apr 13 newsletter + TL send. May 9 blog publish. TBD Airbnb B2C email (Nikolay).

Be concise (2–4 sentences), direct, and specific. Reference real names, dates, and tasks. Never invent data.`
