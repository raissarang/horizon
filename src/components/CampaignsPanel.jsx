import { useState } from 'react'
import Badge from './Badge.jsx'

const TASK_STATUS = {
  todo: { label: 'To do', color: 'gray' },
  'in-progress': { label: 'In progress', color: 'blue' },
  done: { label: 'Done', color: 'green' },
  blocked: { label: 'Blocked', color: 'red' },
  backlog: { label: 'Backlog', color: 'amber' },
  postponed: { label: 'Postponed', color: 'gray' },
}

function TaskReadOnlyRow({ task }) {
  return (
    <div style={{ border: '0.5px solid var(--bd)', borderRadius: 10, padding: 12, marginBottom: 10, background: 'var(--bg2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)' }}>{task.title}</div>
        <Badge color={TASK_STATUS[task.status]?.color || 'gray'}>
          {TASK_STATUS[task.status]?.label || 'To do'}
        </Badge>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--tx3)', marginBottom: 6 }}>
        <span>Due: {task.date || 'No date set'}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.45 }}>
        {task.notes || 'No notes yet.'}
      </div>
    </div>
  )
}

function TaskEditRow({ task, onUpdate, onDelete }) {
  return (
    <div style={{ border: '0.5px solid var(--bd)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 140px 170px auto', gap: 10, alignItems: 'center' }}>
        <input
          value={task.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Task name"
          style={inputStyle}
        />
        <select
          value={task.status}
          onChange={(e) => onUpdate({ status: e.target.value })}
          style={inputStyle}
        >
          {Object.entries(TASK_STATUS).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={task.date || ''}
          onChange={(e) => onUpdate({ date: e.target.value })}
          style={inputStyle}
        />
        <button onClick={onDelete} style={dangerBtn}>Delete</button>
      </div>
      <textarea
        value={task.notes}
        onChange={(e) => onUpdate({ notes: e.target.value })}
        placeholder="Notes"
        rows={2}
        style={{ ...inputStyle, width: '100%', marginTop: 8, resize: 'vertical' }}
      />
      <div style={{ marginTop: 8 }}>
        <Badge color={TASK_STATUS[task.status]?.color || 'gray'}>
          {TASK_STATUS[task.status]?.label || 'To do'}
        </Badge>
      </div>
    </div>
  )
}

function CampaignCardReadOnly({ campaign }) {
  return (
    <section style={{ border: '0.5px solid var(--bd2)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{campaign.name}</div>
      {campaign.tasks.map((task) => <TaskReadOnlyRow key={task.id} task={task} />)}
      {campaign.tasks.length === 0 && (
        <div style={{ color: 'var(--tx3)', fontSize: 12 }}>No tasks yet.</div>
      )}
    </section>
  )
}

function CampaignCardEdit({ campaign, onRename, onDeleteCampaign, onAddTask, onUpdateTask, onDeleteTask }) {
  return (
    <section style={{ border: '0.5px solid var(--bd2)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <input
          value={campaign.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Campaign name"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={onAddTask} style={ghostBtn}>+ Task</button>
        <button onClick={onDeleteCampaign} style={dangerBtn}>Delete Campaign</button>
      </div>
      {campaign.tasks.map((task) => (
        <TaskEditRow
          key={task.id}
          task={task}
          onUpdate={(changes) => onUpdateTask(task.id, changes)}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
      {campaign.tasks.length === 0 && (
        <div style={{ color: 'var(--tx3)', fontSize: 12 }}>No tasks yet. Add one with `+ Task`.</div>
      )}
    </section>
  )
}

export default function CampaignsPanel({ campaigns, setCampaigns, onConfirm }) {
  const [isEditing, setIsEditing] = useState(false)

  const addCampaign = () => {
    setCampaigns((prev) => [
      ...prev,
      { id: Date.now(), name: 'New campaign', tasks: [] },
    ])
  }

  const renameCampaign = (campaignId, name) => {
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, name } : c)))
  }

  const deleteCampaign = (campaignId) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId))
  }

  const addTask = (campaignId) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaignId) return c
      return {
        ...c,
        tasks: [
          ...c.tasks,
          { id: Date.now(), title: 'New task', status: 'todo', notes: '', date: '' },
        ],
      }
    }))
  }

  const updateTask = (campaignId, taskId, changes) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaignId) return c
      return {
        ...c,
        tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
      }
    }))
  }

  const deleteTask = (campaignId, taskId) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaignId) return c
      return {
        ...c,
        tasks: c.tasks.filter((t) => t.id !== taskId),
      }
    }))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Campaigns</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isEditing && <button onClick={() => setIsEditing(true)} style={primaryBtn}>Edit</button>}
          {isEditing && (
            <>
              <button onClick={() => setIsEditing(false)} style={ghostBtn}>Done Editing</button>
              <button onClick={onConfirm} style={ghostBtn}>Confirm Changes</button>
              <button onClick={addCampaign} style={primaryBtn}>+ New Campaign</button>
            </>
          )}
        </div>
      </div>
      {campaigns.map((campaign) => (
        isEditing ? (
          <CampaignCardEdit
            key={campaign.id}
            campaign={campaign}
            onRename={(name) => renameCampaign(campaign.id, name)}
            onDeleteCampaign={() => deleteCampaign(campaign.id)}
            onAddTask={() => addTask(campaign.id)}
            onUpdateTask={(taskId, changes) => updateTask(campaign.id, taskId, changes)}
            onDeleteTask={(taskId) => deleteTask(campaign.id, taskId)}
          />
        ) : (
          <CampaignCardReadOnly
            key={campaign.id}
            campaign={campaign}
          />
        )
      ))}
      {campaigns.length === 0 && (
        <div style={{ color: 'var(--tx3)', fontSize: 12 }}>
          {isEditing ? 'No campaigns yet. Add one to start.' : 'No campaigns available.'}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  border: '0.5px solid var(--bd)',
  background: 'var(--bg)',
  color: 'var(--tx)',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 12,
  fontFamily: 'inherit',
}

const baseBtn = {
  border: '0.5px solid var(--bd)',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 11.5,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const primaryBtn = {
  ...baseBtn,
  background: 'var(--blue)',
  color: '#fff',
  border: '0.5px solid var(--blue)',
}

const ghostBtn = {
  ...baseBtn,
  background: 'var(--bg2)',
  color: 'var(--tx)',
}

const dangerBtn = {
  ...baseBtn,
  background: 'var(--redbg)',
  color: 'var(--red)',
  border: '0.5px solid var(--redbg)',
}
