'use client'

interface ScoreRingProps {
  score: number
  size?: number
}

export function ScoreRing({ score, size = 144 }: ScoreRingProps) {
  const radius = (size / 2) - (size < 80 ? 6 : 12)
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const strokeWidth = size < 80 ? 4 : 8
  const isSmall = size < 80

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-white ${isSmall ? 'text-sm' : 'text-3xl'}`}>{score}</span>
        {!isSmall && (
          <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">de 100</span>
        )}
      </div>
    </div>
  )
}
