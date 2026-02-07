'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { GripVertical, LucideIcon } from 'lucide-react'

interface KPIItem {
  id: string
  icon: LucideIcon
  label: string
  value: string
  change: string
  positive: boolean
  accent: 'emerald' | 'cyan' | 'violet' | 'amber'
}

interface DraggableKPICardProps {
  item: KPIItem
}

const accentStyles = {
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    positiveColor: 'text-emerald-400',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    positiveColor: 'text-cyan-400',
  },
  violet: {
    iconBg: 'bg-violet-500/10',
    iconBorder: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    positiveColor: 'text-violet-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    positiveColor: 'text-amber-400',
  },
}

function SortableKPICard({ item }: DraggableKPICardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  const styles = accentStyles[item.accent]
  const Icon = item.icon

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative group bg-[#0d1321]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4
        ${isDragging ? 'shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/30' : ''}
        hover:border-white/[0.12] transition-all duration-200`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} className="text-white/30" />
      </button>

      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${styles.iconBg} border ${styles.iconBorder} flex items-center justify-center`}>
          <Icon size={18} className={styles.iconColor} />
        </div>
        <div className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full ${
          item.positive
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          <span>{item.positive ? '↗' : '↘'}</span>
          <span>{item.change}</span>
        </div>
      </div>

      <p className="text-white/40 text-[11px] uppercase tracking-wide mt-4">{item.label}</p>
      <p className="text-white text-2xl font-semibold mt-1">{item.value}</p>
    </motion.div>
  )
}

interface DraggableKPIGridProps {
  items: KPIItem[]
  onReorder?: (items: KPIItem[]) => void
}

export function DraggableKPIGrid({ items: initialItems, onReorder }: DraggableKPIGridProps) {
  const [items, setItems] = useState(initialItems)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder?.(newItems)
        return newItems
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <SortableKPICard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
