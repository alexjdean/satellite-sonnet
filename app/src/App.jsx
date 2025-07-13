import { useEffect, useState } from 'react'

const LAMBDA_URL = 'https://frlhujgplrokvbaq3oymsrhq2e0frqys.lambda-url.us-west-2.on.aws/';

function formatDate(dateStr) {
  // Ensures consistent formatting regardless of locale timezone offset.
  const dateObj = new Date(`${dateStr}T00:00:00`);
  return dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const prefersDark = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [darkMode, setDarkMode] = useState(prefersDark);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch(LAMBDA_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="container">
      <div className="narrow">
        <p className="loading-text">Warming up the telescopes…</p>
        <div className="image-skeleton skeleton"></div>
        <div className="poem-skeleton skeleton"></div>
      </div>
    </div>
  );
  if (error) return <pre>{String(error)}</pre>;
  if (!data) return null;

  const {
    date,
    visitor_count,
    imageUrl,
    poem,
    title,
    copyright,
    explanation,
  } = data;

  let poemTitle = '';
  let poemBody = poem;
  if (poem.startsWith('**')) {
    const end = poem.indexOf('**', 2);
    if (end !== -1) {
      poemTitle = poem.slice(2, end);
      poemBody = poem.slice(end + 2).trim();
    }
  }

  return (
    <div className="container">
      <button className="toggle-btn" onClick={() => setDarkMode((d) => !d)}>
        {darkMode ? 'Prefer light mode?' : 'Prefer dark mode?'}
      </button>
      <div className="narrow">
      <p className="date-heading">Today is {formatDate(date)}</p>
      <p>Welcome! You are visitor number {visitor_count} today.</p>

      <p>
        Every day, scientists at NASA share a unique photograph of our fascinating universe. And 
        each day, this program generates a Shakespearean sonnet to commemorate the image and its features.
      </p>

      <p className="image-intro">
        Today&apos;s image is below.
      </p>

      {imageUrl && (
        <>
          <img className="apod" src={imageUrl} alt={title || 'NASA Astronomy Picture of the Day'} />
          <small>© {copyright}</small>
        </>
      )}

      {explanation && (
        <div className="explanation-box">
          <div className="explanation-title">Explanation written by a professional astronomer</div>
          <p style={{ margin: 0 }}>{explanation}</p>
        </div>
      )}

      <div className="poem-box">
        {poemTitle && <div className="poem-title">{poemTitle}</div>}
        <div className="poem-body">{poemBody}</div>
      </div>
      </div>
    </div>
  );
}

export default App
