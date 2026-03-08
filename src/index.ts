import http from 'http';
import { MatchResultsCollection } from './types/results';

const PORT = 3000;

const mockResults: MatchResultsCollection = {
  matches: [
    {
      id: '1',
      date: new Date().toISOString(),
      homeTeam: { name: 'River Plate', shortName: 'RIV' },
      awayTeam: { name: 'Boca Juniors', shortName: 'BOC' },
      score: { home: 2, away: 1 },
      status: 'finished',
      competition: 'Liga Profesional',
    },
    {
      id: '2',
      date: new Date().toISOString(),
      homeTeam: { name: 'Manchester City', shortName: 'MCI' },
      awayTeam: { name: 'Arsenal', shortName: 'ARS' },
      score: { home: 0, away: 0 },
      status: 'live',
      competition: 'Premier League',
    },
  ],
  totalCount: 2,
  scrapedAt: new Date().toISOString(),
  source: 'mock',
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Football Results Fetcher</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; }
    header { background: #1e293b; padding: 1.5rem 2rem; border-bottom: 2px solid #334155; }
    header h1 { font-size: 1.5rem; font-weight: 700; color: #38bdf8; }
    header p { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
    main { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .matches { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
    .match-card {
      background: #1e293b; border-radius: 0.75rem; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      border: 1px solid #334155;
    }
    .team { flex: 1; }
    .team.away { text-align: right; }
    .team-name { font-weight: 600; font-size: 1rem; }
    .score-block { text-align: center; flex-shrink: 0; padding: 0 1.5rem; }
    .score { font-size: 1.75rem; font-weight: 800; letter-spacing: 0.1em; color: #38bdf8; }
    .status { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.2rem; }
    .status.live { color: #4ade80; }
    .status.finished { color: #94a3b8; }
    .competition { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
    h2 { font-size: 1.1rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .api-note { margin-top: 2rem; background: #1e293b; border-radius: 0.75rem; padding: 1rem 1.5rem; border: 1px solid #334155; }
    .api-note p { font-size: 0.85rem; color: #94a3b8; }
    .api-note code { color: #38bdf8; background: #0f172a; padding: 0.1rem 0.4rem; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <header>
    <h1>Football Results Fetcher</h1>
    <p>Live &amp; recent match results</p>
  </header>
  <main>
    <h2>Latest Matches</h2>
    <div class="matches" id="matches">Loading...</div>
    <div class="api-note">
      <p>JSON API available at <code>GET /api/results</code></p>
    </div>
  </main>
  <script>
    fetch('/api/results')
      .then(r => r.json())
      .then(data => {
        const container = document.getElementById('matches');
        container.innerHTML = data.matches.map(m => \`
          <div class="match-card">
            <div class="team"><div class="team-name">\${m.homeTeam.name}</div><div class="competition">\${m.competition || ''}</div></div>
            <div class="score-block">
              <div class="score">\${m.score.home} – \${m.score.away}</div>
              <div class="status \${m.status}">\${m.status}</div>
            </div>
            <div class="team away"><div class="team-name">\${m.awayTeam.name}</div></div>
          </div>
        \`).join('');
      });
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/api/results' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockResults, null, 2));
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Football Results Fetcher running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/results`);
});
