(() => {
  const mount = document.querySelector('[data-repo-browser]');
  if (!mount || mount.shadowRoot) return;

  const profile = 'https://github.com/Tran-Steven?tab=repositories';
  const endpoint = 'https://api.github.com/users/Tran-Steven/repos';
  const root = mount.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <link rel="stylesheet" href="/repos/browser.css">
    <section aria-labelledby="repo-heading">
      <details class="account">
        <summary><img src="/repos/avatar.png" alt=""> Tran-Steven</summary>
        <div class="account-menu">
          <a href="https://github.com/Tran-Steven" target="_blank" rel="noopener noreferrer">View profile</a>
          <a href="${profile}" target="_blank" rel="noopener noreferrer">All repositories</a>
        </div>
      </details>
      <header>
        <h2 id="repo-heading">Top Repositories</h2>
        <span class="new" aria-hidden="true">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5A1.5 1.5 0 0 1 4.5 1H13v11H4.5A1.5 1.5 0 0 0 3 13.5V2.5Zm0 11A1.5 1.5 0 0 0 4.5 15H13M6 11.9V16l1.5-1 1.5 1v-4.1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          New
        </span>
      </header>
      <input type="search" aria-label="Find a repository" placeholder="Find a repository…">
      <div class="results">
        <p class="status" role="status">Loading repositories…</p>
        <ul class="rows" aria-label="Public repositories"></ul>
        <button class="more" type="button" hidden>Show more repositories</button>
      </div>
    </section>`;

  const input = root.querySelector('input');
  const rows = root.querySelector('.rows');
  const results = root.querySelector('.results');
  const status = root.querySelector('.status');
  const more = root.querySelector('.more');
  let repositories = [];
  let loaded = false;
  let limit = 7;

  function render() {
    const query = input.value.trim().toLowerCase();
    const matches = repositories.filter(repo =>
      [repo.name, repo.language, repo.description].some(value => value?.toLowerCase().includes(query)));
    // Reserve the unfiltered list space, including when the search finds nothing.
    results.style.setProperty('--repo-slots', String(Math.min(limit, repositories.length || 7)));
    status.textContent = loaded
      ? query ? (matches.length ? `${matches.length} matching repositories` : 'No repositories match your search.') : ''
      : 'Loading repositories…';
    status.hidden = !status.textContent;
    status.classList.toggle('visually-hidden', Boolean(loaded && query && matches.length));
    rows.replaceChildren(...matches.slice(0, limit).map(repo => {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = repo.html_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const avatar = document.createElement('img');
      avatar.src = '/repos/avatar.png';
      avatar.alt = '';
      const name = document.createElement('span');
      name.textContent = `Tran-Steven/${repo.name}`;
      link.title = name.textContent;
      link.append(avatar, name);
      row.append(link);
      return row;
    }));
    more.hidden = matches.length <= limit;
  }

  input.addEventListener('input', render);
  more.addEventListener('click', () => {
    const firstNewRow = rows.children.length;
    limit += 7;
    render();
    rows.children[firstNewRow]?.querySelector('a')?.focus({ preventScroll: true });
  });

  async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Repository request failed');
    return response.json();
  }

  async function load() {
    try {
      repositories = await json('/repos/snapshot.json');
      loaded = true;
      render();
    } catch {
      // The GitHub request can still populate the list.
    }

    try {
      const latest = [];
      for (let page = 1; ; page++) {
        const batch = await json(`${endpoint}?per_page=100&sort=pushed&direction=desc&page=${page}`);
        latest.push(...batch.filter(repo => repo.private === false).map(
          ({ name, html_url, description, language, pushed_at }) => ({ name, html_url, description, language, pushed_at })));
        if (batch.length < 100) break;
      }
      const changed = JSON.stringify(repositories) !== JSON.stringify(latest);
      repositories = latest;
      loaded = true;
      if (changed || !rows.children.length) render();
    } catch {
      if (!loaded) status.textContent = 'Repositories are unavailable here. You can still browse them on GitHub.';
    }
  }

  load();
})();
