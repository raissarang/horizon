import { TAG_COLORS } from '../data.js'

export default function Badge({ color = 'gray', children, onClick, style }) {
  const { bg, tx } = TAG_COLORS[color] || TAG_COLORS.gray
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 20,
        fontSize: 10.5,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        background: bg,
        color: tx,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
