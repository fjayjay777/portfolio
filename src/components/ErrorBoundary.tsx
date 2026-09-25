import { Component, type ReactNode } from 'react'

type ErrorBoundaryProps = { fallback: ReactNode; children: ReactNode }

/** Shows `fallback` in place of a subtree that throws, instead of letting React unmount the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
