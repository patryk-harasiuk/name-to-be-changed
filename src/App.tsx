import { useEffect, useState } from 'react';
import { Viewer } from './lib/Viewer';

const lessonPath = '/lesson-scripts/example.md';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();

    fetch(lessonPath, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${lessonPath}`);
        }

        return response.text();
      })
      .then((text) => {
        setMarkdown(text);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <section className="app-intro" aria-labelledby="app-title">
        <div>
          <p className="app-kicker">Markdown in, classroom presentation out</p>
          <h1 id="app-title">Interactive Educational Script Viewer</h1>
          <p>
            A Vite, React, TypeScript, marked.js, and Framer Motion prototype that turns ordinary
            Markdown into a guided canvas. Each heading, paragraph, quote, list, or code block
            becomes a camera stop with spotlight isolation.
          </p>
        </div>

        <aside className="app-notes" aria-label="Prototype notes">
          <strong>Responsive assumption</strong>
          <span>
            Yes: the viewer runs as a single vertical column on compact screens and becomes an
            open-book two-page spread on wide displays.
          </span>
        </aside>
      </section>

      {status === 'loading' && <div className="app-state">Loading lesson script...</div>}
      {status === 'error' && (
        <div className="app-state app-state-error">The example Markdown file could not be loaded.</div>
      )}
      {status === 'ready' && <Viewer markdown={markdown} />}
    </main>
  );
}

export default App;