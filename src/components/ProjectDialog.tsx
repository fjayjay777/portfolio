import { useEffect, useRef } from 'react'
import { MobileDemoFrame } from './MobileDemoFrame'

export type Project = {
  name: string
  category: string
  summary: string
  demo?: { url: string }
}

type ProjectDialogProps = {
  project: Project
  onClose: () => void
  returnFocus: HTMLElement | null
}

export function ProjectDialog({ project, onClose, returnFocus }: ProjectDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      returnFocus?.focus()
    }
  }, [onClose, returnFocus])

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="project-dialog"
        aria-labelledby="project-dialog-title"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="project-dialog__content">
          <div>
            <p className="eyebrow">{project.category}</p>
            <h2 id="project-dialog-title">{project.name} project details</h2>
            <p>{project.summary}</p>
            <button className="dialog-close" ref={closeButtonRef} type="button" onClick={onClose}>Close</button>
          </div>
          {project.demo && <MobileDemoFrame title={project.name} url={project.demo.url} />}
        </div>
      </section>
    </div>
  )
}
