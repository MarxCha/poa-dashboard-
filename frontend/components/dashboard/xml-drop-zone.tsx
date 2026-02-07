'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  message?: string
}

interface XMLDropZoneProps {
  onUpload?: (files: File[]) => Promise<void>
}

export function XMLDropZone({ onUpload }: XMLDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = async (fileList: FileList) => {
    const xmlFiles = Array.from(fileList).filter(
      (f) => f.name.endsWith('.xml') || f.type === 'text/xml'
    )

    if (xmlFiles.length === 0) {
      return
    }

    const newFiles: UploadedFile[] = xmlFiles.map((f) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: f.size,
      status: 'uploading' as const,
    }))

    setFiles((prev) => [...newFiles, ...prev])

    // Simulate upload
    for (const file of newFiles) {
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: Math.random() > 0.1 ? 'success' : 'error',
                message:
                  Math.random() > 0.1
                    ? 'CFDI procesado correctamente'
                    : 'Error de validación XML',
              }
            : f
        )
      )
    }

    if (onUpload) {
      await onUpload(xmlFiles)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    await processFiles(e.dataTransfer.files)
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.06)',
        }}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'bg-emerald-500/10 border-emerald-500/50'
            : 'bg-[#0d1321]/50 border-white/[0.06] hover:border-white/[0.12]'
        }`}
      >
        <input
          type="file"
          accept=".xml,text/xml"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
              isDragging
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-white/[0.06] border border-white/[0.08]'
            }`}
          >
            <Upload
              size={28}
              className={isDragging ? 'text-emerald-400' : 'text-white/40'}
            />
          </div>

          <h3 className="text-white font-medium">
            {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra tus CFDIs XML'}
          </h3>
          <p className="text-white/40 text-sm mt-2">
            o haz clic para seleccionar archivos
          </p>
          <p className="text-white/30 text-xs mt-4">
            Soporta múltiples archivos XML del SAT
          </p>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-white/60 text-sm font-medium">
                Archivos ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                className="text-white/40 text-xs hover:text-white transition-colors"
              >
                Limpiar
              </button>
            </div>

            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#0d1321] border border-white/[0.06]"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    file.status === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : file.status === 'error'
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-white/[0.06] border border-white/[0.08]'
                  }`}
                >
                  {file.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {file.status === 'error' && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{file.name}</p>
                  <p
                    className={`text-xs ${
                      file.status === 'success'
                        ? 'text-emerald-400'
                        : file.status === 'error'
                        ? 'text-red-400'
                        : 'text-white/40'
                    }`}
                  >
                    {file.status === 'uploading'
                      ? 'Procesando...'
                      : file.message || formatSize(file.size)}
                  </p>
                </div>

                <FileText className="w-4 h-4 text-white/20" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
