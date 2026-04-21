import Badge from './Badge.jsx'
import { AIRBNB_TASKS, TAG_COLORS } from '../data.js'

function ICard({ icon, bg, tx, title, desc, badge, label }) {
  const { bg: bbg, tx: btx } = TAG_COLORS[badge] || TAG_COLORS.gray
  return (
    <div style={{ display: 'flex', gap: 10, padding: '11px 14px', borderRadius: 10, border: '0.5px solid var(--bd)', marginBottom: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, background: bg, color: tx }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--tx2)', lineHeight: 1.45 }}>{desc}</div>
      </div>
      {label && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, fontSize: 10.5, fontWeight: 500, background: bbg, color: btx, flexShrink: 0, alignSelf: 'flex-start' }}>{label}</span>}
    </div>
  )
}

function SectionHeader({ title, badge, badgeColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
      {badge && <Badge color={badgeColor}>{badge}</Badge>}
    </div>
  )
}

export default function CampaignsPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Airbnb campaign</div>
        <Badge color="blue">In progress</Badge>
      </div>
      {AIRBNB_TASKS.map((t, i) => <ICard key={i} {...t} />)}

      <SectionHeader title="Crexi whitepaper" badge="Published" badgeColor="green" />
      <ICard icon="✓" bg="var(--greenbg)" tx="var(--green)" title="Whitepaper live" desc="Blog, LinkedIn, newsletter all published. Angle: rent-to-cap-rate disconnect." badge="green" label="Live" />
      <ICard icon="Q" bg="var(--amberbg)" tx="var(--amber)" title="Jonas quote design" desc="Create graphic referencing whitepaper. Confirm with Allyse (Crexi)." badge="amber" label="Pending" />

      <SectionHeader title="Purrrmitted Living" badge="Planning" badgeColor="amber" />
      <ICard icon="S" bg="var(--amberbg)" tx="var(--amber)" title="Define strategy" desc="Messaging, content calendar, assets. Send video script to Jonas." badge="amber" label="This week" />
      <ICard icon="V" bg="var(--amberbg)" tx="var(--amber)" title="Video script for Jonas" desc="Draft script and send over for review before producing assets." badge="amber" label="Pending" />

      <SectionHeader title="Data's User Journey" badge="Planning" badgeColor="purple" />
      <ICard icon="T" bg="var(--purplebg)" tx="var(--purple)" title="Strategic vision + monthly themes" desc="Create vision. Break monthly themes down next week." badge="purple" label="Next week" />
      <ICard icon="C" bg="var(--purplebg)" tx="var(--purple)" title="Content calendar" desc="Build out calendar once monthly themes are defined." badge="purple" label="TBD" />
    </div>
  )
}
