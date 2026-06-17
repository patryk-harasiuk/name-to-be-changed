import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { parseMarkdownScript } from './parser';
import type { ParsedScript, ScriptStep } from './parser';
import './viewer.css';

export type NavigationMode = 'step' | 'page';

export interface ViewerProps {
  markdown: string;
  className?: string;
  initialMode?: NavigationMode;
  initialStep?: number;
  spotlight?: boolean;
  onStepChange?: (step: ScriptStep, parsedScript: ParsedScript) => void;
}

interface CameraState {
  x: number;
  y: number;
  scale: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

export const Viewer = ({
  markdown,
  className,
  initialMode = 'step',
  initialStep = 0,
  spotlight = true,
  onStepChange,
}: ViewerProps) => {
  const parsedScript = useMemo(() => parseMarkdownScript(markdown), [markdown]);
  const [activeIndex, setActiveIndex] = useState(initialStep);
  const [mode, setMode] = useState<NavigationMode>(initialMode);
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, scale: 1 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const safeActiveIndex =
    parsedScript.steps.length > 0 ? clamp(activeIndex, 0, parsedScript.steps.length - 1) : 0;
  const activeStep = parsedScript.steps[safeActiveIndex];
  const progress =
    parsedScript.steps.length > 0 && activeStep
      ? ((activeStep.index + 1) / parsedScript.steps.length) * 100
      : 0;

  useEffect(() => {
    if (activeStep) {
      onStepChange?.(activeStep, parsedScript);
    }
  }, [activeStep, onStepChange, parsedScript]);

  const goToStep = useCallback(
    (index: number) => {
      if (parsedScript.steps.length === 0) {
        return;
      }

      setActiveIndex(clamp(index, 0, parsedScript.steps.length - 1));
    },
    [parsedScript.steps.length],
  );

  const moveStep = useCallback(
    (delta: number) => {
      if (!activeStep) {
        return;
      }

      goToStep(activeStep.index + delta);
    },
    [activeStep, goToStep],
  );

  const movePage = useCallback(
    (delta: number) => {
      if (!activeStep) {
        return;
      }

      const targetPageIndex = clamp(
        activeStep.pageIndex + delta,
        0,
        Math.max(parsedScript.pages.length - 1, 0),
      );
      const targetPage = parsedScript.pages[targetPageIndex];

      if (targetPage?.steps[0]) {
        goToStep(targetPage.steps[0].index);
      }
    },
    [activeStep, goToStep, parsedScript.pages],
  );

  const advance = useCallback(() => {
    if (mode === 'page') {
      movePage(1);
      return;
    }

    moveStep(1);
  }, [mode, movePage, moveStep]);

  const retreat = useCallback(() => {
    if (mode === 'page') {
      movePage(-1);
      return;
    }

    moveStep(-1);
  }, [mode, movePage, moveStep]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;

    if (!viewport || !canvas || !activeStep) {
      return;
    }

    const updateCamera = () => {
      const activeElement = canvas.querySelector<HTMLElement>(`[data-step-id="${activeStep.id}"]`);

      if (!activeElement) {
        return;
      }

      const scale = activeStep.zoom;
      const centerX = activeElement.offsetLeft + activeElement.offsetWidth / 2;
      const centerY = activeElement.offsetTop + activeElement.offsetHeight / 2;

      setCamera({
        x: viewport.clientWidth / 2 - centerX * scale,
        y: viewport.clientHeight / 2 - centerY * scale,
        scale,
      });
    };

    const frame = window.requestAnimationFrame(updateCamera);
    const resizeObserver = new ResizeObserver(updateCamera);

    resizeObserver.observe(viewport);
    resizeObserver.observe(canvas);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [activeStep, parsedScript.pages.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        advance();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        retreat();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveStep(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveStep(-1);
      } else if (event.key === 'PageDown') {
        event.preventDefault();
        movePage(1);
      } else if (event.key === 'PageUp') {
        event.preventDefault();
        movePage(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToStep(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goToStep(parsedScript.steps.length - 1);
      } else if (event.key.toLowerCase() === 'm') {
        setMode((currentMode) => (currentMode === 'step' ? 'page' : 'step'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, goToStep, movePage, moveStep, parsedScript.steps.length, retreat]);

  if (!activeStep) {
    return (
      <section className={`interactive-script-viewer ${className ?? ''}`.trim()}>
        <div className="script-empty-state">Add Markdown content to start the presentation.</div>
      </section>
    );
  }

  return (
    <section
      className={`interactive-script-viewer ${spotlight ? 'has-spotlight' : ''} ${
        className ?? ''
      }`.trim()}
      aria-label="Interactive educational script viewer"
    >
      <header className="script-toolbar">
        <div>
          <p className="script-eyebrow">Interactive script</p>
          <h2>{parsedScript.title}</h2>
        </div>

        <div className="script-controls" aria-label="Presentation controls">
          <button type="button" onClick={retreat} aria-label="Go backward">
            Back
          </button>
          <button type="button" onClick={advance} aria-label="Go forward">
            Next
          </button>
          <div className="script-mode-toggle" role="group" aria-label="Navigation mode">
            <button
              type="button"
              className={mode === 'step' ? 'is-selected' : ''}
              onClick={() => setMode('step')}
            >
              Step
            </button>
            <button
              type="button"
              className={mode === 'page' ? 'is-selected' : ''}
              onClick={() => setMode('page')}
            >
              Page
            </button>
          </div>
        </div>
      </header>

      <div className="script-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="script-viewport" ref={viewportRef}>
        <motion.div
          ref={canvasRef}
          className="script-canvas"
          animate={{ x: camera.x, y: camera.y, scale: camera.scale }}
          transition={{ type: 'spring', stiffness: 92, damping: 22, mass: 0.9 }}
          style={{ transformOrigin: '0 0' }}
        >
          <div className="script-spread">
            {parsedScript.pages.map((page) => (
              <article
                className={`script-page ${page.id === activeStep.pageId ? 'is-active-page' : ''}`}
                data-page-id={page.id}
                key={page.id}
                aria-label={page.title}
              >
                <span className="script-page-label">
                  {page.index + 1} / {parsedScript.pages.length}
                </span>

                {page.steps.map((step) => (
                  <section
                    className={`script-step script-step-${step.kind} ${
                      step.id === activeStep.id ? 'is-active' : 'is-inactive'
                    }`}
                    data-step-id={step.id}
                    key={step.id}
                    aria-current={step.id === activeStep.id ? 'step' : undefined}
                    dangerouslySetInnerHTML={{ __html: step.html }}
                  />
                ))}
              </article>
            ))}
          </div>
        </motion.div>
      </div>

      <footer className="script-status">
        <span>
          Step {activeStep.index + 1} of {parsedScript.steps.length}
        </span>
        <span>
          Page {activeStep.pageIndex + 1} of {parsedScript.pages.length}
        </span>
        <span>Keys: arrows, space, PageUp/PageDown, M</span>
      </footer>
    </section>
  );
};