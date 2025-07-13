import { useEffect, useState } from 'react'

// Simple in-memory cache for the Lambda result
let cachedResponse = null;

const LAMBDA_URL = 'https://frlhujgplrokvbaq3oymsrhq2e0frqys.lambda-url.us-west-2.on.aws/';

function App() {
  const [data, setData] = useState(cachedResponse);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cachedResponse);

  useEffect(() => {
    // If we already have data cached, no need to fetch again.
    if (cachedResponse) return;

    setLoading(true);

    fetch(LAMBDA_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        cachedResponse = json; // store in module-level cache
        setData(json);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <pre>{String(error)}</pre>;
  if (!data) return null;

  return (
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default App
