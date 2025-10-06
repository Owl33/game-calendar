/**
 * Modal - 모달 애니메이션 (Backdrop + Content)
 * CalendarHeader 모달 등에 사용
 */

import { motion } from "motion/react";
import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  contentClassName?: string;
  backdropClassName?: string;
  duration?: number;
}

export function Modal({
  children,
  isOpen,
  onClose,
  contentClassName = "",
  backdropClassName = "fixed inset-0 bg-black/50 z-50",
  duration = 0.2,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className={backdropClassName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
        onClick={onClose}
      />

      {/* Content */}
      <motion.div
        className={contentClassName}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration }}>
        {children}
      </motion.div>
    </>
  );
}
