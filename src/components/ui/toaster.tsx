"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="rounded-2xl border-none shadow-2xl">
            <div className="grid gap-1">
              {title && <ToastTitle className="font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm font-medium opacity-90">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="rounded-xl hover:bg-slate-100 transition-colors" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}