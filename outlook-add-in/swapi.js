Office.onReady(() => {
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('fetchSwapi');
    const result = document.getElementById('result');

    btn.addEventListener('click', async () => {
      result.textContent = 'Loading...';
      try {
        const response = await fetch('https://swapi.info/api/films');
        if (!response.ok) throw new Error('Failed to fetch films');
        const data = await response.json();

        const films = Array.isArray(data.result)
          ? data.result
          : Array.isArray(data)
          ? data
          : [];

        if (!films.length) throw new Error('No films found.');

        result.innerHTML = films
          .map(
            (film) => `
          <div class="film">
            <div class="film-title">${
              film.title
            } <span style="color:#888;">(Episode ${
              film.episode_id
            })</span></div>
            <div><strong>Director:</strong> ${film.director}</div>
            <div><strong>Release Date:</strong> ${film.release_date}</div>
            <div><strong>Producer:</strong> ${film.producer}</div>
            <div><strong>Opening Crawl:</strong> <br><em>${film.opening_crawl.slice(
              0,
              200
            )}...</em></div>
            <div><a href="${film.url}" target="_blank">More Info</a></div>
          </div>
        `
          )
          .join('');
      } catch (err) {
        result.textContent = 'Error: ' + err.message;
      }
    });
  });
});
