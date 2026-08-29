'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Lock,
  CheckCircle2,
  Pencil,
  X,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LUXURY_EASE } from '@/components/motion/motion';

import type { ExtractedIncome } from '@/lib/ocr/income-parser';

// Lazy-import OCR functions so Tesseract.js is not bundled with the page
// unless the user actually uses the uploader.
const ocrModule = () => import('@/lib/ocr/income-ocr');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OcrState =
  | { stage: 'idle' }
  | { stage: 'processing'; progress: number; status: string }
  | { stage: 'detected'; income: ExtractedIncome; fileName: string }
  | { stage: 'confirmed'; amount: number }
  | { stage: 'error'; message: string };

interface DocumentOcrUploaderProps {
  /** Called when the user confirms an amount (or manually edits it). */
  onAmountConfirmed: (amount: number) => void;
  /** Optional class name for outer wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentOcrUploader({
  onAmountConfirmed,
  className = '',
}: DocumentOcrUploaderProps) {
  const [state, setState] = useState<OcrState>({ stage: 'idle' });
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefersReduced = useReducedMotion();

  // Cleanup OCR worker on unmount
  useEffect(() => {
    return () => {
      ocrModule().then((m) => m.terminateOcrWorker());
    };
  }, []);

  // -----------------------------------------------------------------------
  // File selection handler
  // -----------------------------------------------------------------------
  const handleFile = useCallback(async (file: File) => {
    const { isAcceptedFile, recognizeDocument } = await ocrModule();

    if (!isAcceptedFile(file)) {
      setState({
        stage: 'error',
        message: 'Unsupported file type. Please upload a PNG, JPG, or WebP image.',
      });
      return;
    }

    setState({ stage: 'processing', progress: 0, status: 'Preparing image…' });

    try {
      const result = await recognizeDocument(file, (progress, status) => {
        setState({ stage: 'processing', progress, status });
      });

      if (result.income) {
        setState({
          stage: 'detected',
          income: result.income,
          fileName: file.name,
        });
      } else {
        setState({
          stage: 'error',
          message:
            'Could not reliably find a statement total. Please enter the amount manually.',
        });
      }
    } catch {
      setState({
        stage: 'error',
        message:
          'An error occurred while processing the document. Please try again or enter the amount manually.',
      });
    }

    // Clear the file input so re-uploading the same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // -----------------------------------------------------------------------
  // Drop handler
  // -----------------------------------------------------------------------
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // -----------------------------------------------------------------------
  // Confirm / Edit handlers
  // -----------------------------------------------------------------------
  const handleConfirm = (amount: number) => {
    setState({ stage: 'confirmed', amount });
    onAmountConfirmed(amount);
  };

  const handleStartEdit = (amount: number) => {
    setEditValue(String(amount));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const parsed = parseFloat(editValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setIsEditing(false);
    handleConfirm(parsed);
  };

  const handleReset = () => {
    setState({ stage: 'idle' });
    setIsEditing(false);
  };

  // -----------------------------------------------------------------------
  // Currency formatting helper
  // -----------------------------------------------------------------------
  const formatCurrency = (amount: number, currency: string | null) => {
    const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="wait">
        {/* ── IDLE ── */}
        {state.stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className={`relative rounded-lg border-2 border-dashed transition-colors p-6 text-center cursor-pointer ${
              isDragOver
                ? 'border-[#00A8E8] bg-[#00A8E8]/5'
                : 'border-white/20 hover:border-[#00A8E8]/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.08, y: -2 }}>
              <Upload className="w-8 h-8 text-[#00A8E8] mx-auto mb-2" />
            </motion.div>
            <div className="text-sm font-bold text-white">Upload bank statement</div>
            <div className="text-[11px] text-[#908682] mt-1">
              PNG, JPG, or WebP — processed locally with OCR
            </div>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {state.stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="rounded-lg border border-[#00A8E8]/30 bg-[#231F20] p-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-[#00A8E8] animate-pulse" />
              <span className="font-mono text-[#00A8E8] text-xs font-bold">
                {state.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-[#231F20] rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4A6B32] to-[#00A8E8] rounded-full"
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            <div className="text-[11px] font-mono text-[#908682] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A8E8]" />
              Reading document locally…
            </div>
          </motion.div>
        )}

        {/* ── DETECTED ── */}
        {state.stage === 'detected' && !isEditing && (
          <motion.div
            key="detected"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="rounded-lg border border-[#00A8E8]/40 bg-[#231F20] p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#00A8E8]" />
              <span className="text-sm font-bold text-white">Income Detected</span>
            </div>

            {/* Amount card */}
            <div className="p-4 rounded-lg bg-[#231F20] border border-[#00A8E8]/20 text-center">
              <div className="text-2xl font-bold text-[#00A8E8] font-mono">
                {formatCurrency(state.income.amount, state.income.currency)}
              </div>
              <div className="text-[11px] text-[#908682] mt-1 font-mono">
                Source: Bank statement ({state.fileName})
              </div>
              <div className="text-[11px] text-[#908682] mt-0.5 font-mono">
                Matched label: <span className="text-white">{state.income.label}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                type="button"
                onClick={() => handleConfirm(state.income.amount)}
                className="flex-1 py-2.5 px-4 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-bold text-xs transition-colors cursor-pointer"
              >
                Use this amount
              </motion.button>
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                type="button"
                onClick={() => handleStartEdit(state.income.amount)}
                className="py-2.5 px-4 rounded-md bg-[#231F20] hover:bg-white/10 text-white text-xs font-mono border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </motion.button>
            </div>

            {/* Privacy indicator */}
            <div className="text-[11px] font-mono text-[#908682] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B32]" />
              <span>
                ✓ Document processed locally — Only the extracted value is used for the
                eligibility proof.
              </span>
            </div>
          </motion.div>
        )}

        {/* ── EDITING ── */}
        {state.stage === 'detected' && isEditing && (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="rounded-lg border border-[#B86A36]/40 bg-[#231F20] p-5 space-y-3"
          >
            <div className="text-sm font-bold text-white">Edit Extracted Amount</div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908682] font-bold text-sm">
                {state.income.currency === 'EUR' ? '€' : state.income.currency === 'GBP' ? '£' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-[#231F20] border border-white/20 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#00A8E8]"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 px-4 rounded-md bg-[#00A8E8] hover:bg-[#0277BD] text-[#231F20] font-bold text-xs transition-colors cursor-pointer"
              >
                Confirm
              </motion.button>
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2.5 px-4 rounded-md bg-[#231F20] hover:bg-white/10 text-white text-xs font-mono border border-white/15 transition-colors cursor-pointer"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── CONFIRMED ── */}
        {state.stage === 'confirmed' && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="rounded-lg border border-[#4A6B32]/40 bg-[#231F20] p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4A6B32]" />
              <div>
                <div className="text-sm font-bold text-white">Confirmed income</div>
                <div className="text-xs font-mono text-[#00A8E8]">
                  {formatCurrency(state.amount, null)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded hover:bg-white/10 text-[#908682] transition-colors cursor-pointer"
              aria-label="Reset"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {state.stage === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
            className="rounded-lg border border-[#E85D31]/30 bg-[#231F20] p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#E85D31]" />
              <span className="text-sm text-[#E85D31] font-bold">Extraction Failed</span>
            </div>
            <p className="text-xs text-[#908682] font-mono">{state.message}</p>
            <motion.button
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
              type="button"
              onClick={handleReset}
              className="py-2 px-4 rounded-md bg-[#231F20] hover:bg-white/10 text-white text-xs font-mono border border-white/15 transition-colors cursor-pointer"
            >
              Try again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Privacy badge (always visible in idle) ── */}
      {state.stage === 'idle' && (
        <div className="text-[11px] font-mono text-[#908682] flex items-center gap-1.5 justify-center">
          <Lock className="w-3.5 h-3.5 text-[#00A8E8]" />
          <span>🔒 Processed locally — Your document never leaves this device.</span>
        </div>
      )}
    </div>
  );
}
