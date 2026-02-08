'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileText, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react'
import { getCFDIs, CFDIItem, formatMXN } from '@/lib/api'

interface CFDIsTableProps {
  companyId: number
}

export function CFDIsTable({ companyId }: CFDIsTableProps) {
  const [cfdis, setCfdis] = useState<CFDIItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'ingreso' | 'egreso'>('todos')
  const perPage = 10

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const tipo = filter === 'todos' ? undefined : filter
        const result = await getCFDIs(companyId, page, perPage, tipo)
        setCfdis(result.cfdis)
        setTotal(result.total)
      } catch (e) {
        console.error('Failed to load CFDIs:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId, page, filter])

  const totalPages = Math.ceil(total / perPage)

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d1321]/80 border border-white/[0.06] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-accent-400" />
          <h3 className="text-white font-semibold text-sm">CFDIs Recientes</h3>
          <span className="text-white/30 text-xs">({total.toLocaleString()} total)</span>
        </div>
        <div className="flex gap-1 p-0.5 bg-white/[0.04] rounded-lg">
          {(['todos', 'ingreso', 'egreso'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filter === f
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'todos' ? 'Todos' : f === 'ingreso' ? 'Ingresos' : 'Egresos'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="text-accent-400 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 text-white/30 text-[10px] uppercase tracking-wider font-medium">Folio</th>
                <th className="text-left px-3 py-3 text-white/30 text-[10px] uppercase tracking-wider font-medium">Tipo</th>
                <th className="text-left px-3 py-3 text-white/30 text-[10px] uppercase tracking-wider font-medium">Emisor / Receptor</th>
                <th className="text-right px-3 py-3 text-white/30 text-[10px] uppercase tracking-wider font-medium">Monto</th>
                <th className="text-left px-3 py-3 text-white/30 text-[10px] uppercase tracking-wider font-medium">Fecha</th>
                <th className="text-left px-5 py-3 text-white/30 text-[10px] uppercase tracking-wider font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cfdis.map((cfdi) => (
                <tr key={cfdi.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-white/80 text-xs font-mono">{cfdi.folio || cfdi.uuid.slice(0, 8)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {cfdi.tipo_comprobante === 'ingreso' ? (
                        <ArrowDownLeft size={12} className="text-emerald-400" />
                      ) : (
                        <ArrowUpRight size={12} className="text-cyan-400" />
                      )}
                      <span className={`text-xs ${cfdi.tipo_comprobante === 'ingreso' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {cfdi.tipo_comprobante === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-white/70 text-xs truncate max-w-[200px]">
                      {cfdi.tipo_comprobante === 'ingreso' ? cfdi.receptor_nombre : cfdi.emisor_nombre}
                    </p>
                    <p className="text-white/30 text-[10px] font-mono">
                      {cfdi.tipo_comprobante === 'ingreso' ? cfdi.receptor_rfc : cfdi.emisor_rfc}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-white/80 text-xs font-medium">{formatMXN(cfdi.total)}</span>
                  </td>
                  <td className="px-3 py-3 text-white/50 text-xs">{formatDate(cfdi.fecha_emision)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      cfdi.estado === 'vigente'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {cfdi.estado === 'vigente' ? 'Vigente' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <span className="text-white/30 text-xs">
            Mostrando {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} de {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-white/50 text-xs px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
