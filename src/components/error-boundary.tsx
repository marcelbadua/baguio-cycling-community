
// ============================================================
// src/components/error-boundary.tsx
// ============================================================
'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props  { children: ReactNode }
interface State  { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="font-semibold text-lg">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {this.state.message ?? 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <Button onClick={() => this.setState({ hasError: false })}>Try Again</Button>
        </div>
      )
    }
    return this.props.children
  }
}