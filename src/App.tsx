import { useState, useEffect } from 'react';
import { Viewer } from './lib/Viewer'; 

function App() {
  const [md, setMd] = useState('');

  useEffect(() => {
    fetch('/lesson-scripts/example.md').then(r => r.text()).then(setMd);
  }, []);

  if (!md) return <div>Ładowanie...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mój interaktywny skrypt</h1>
      <Viewer markdown={md} />
    </div>
  );
}

export default App;