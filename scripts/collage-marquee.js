document.addEventListener('DOMContentLoaded', function() {
  var track = document.querySelector('.focus-frame .collage-track');
  if (!track) return;
  var rows = track.querySelectorAll('.collage-row');

  rows.forEach(function(row) {
    var html = row.innerHTML;
    row.insertAdjacentHTML('beforeend', html);
  });

  var imgs = track.querySelectorAll('.collage-item img');
  imgs.forEach(function(img, i) {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('fetchpriority', 'low');
    if (!img.dataset.src) {
      var original = img.getAttribute('src') || '';
      if (original) img.dataset.src = original;
    }
    if (img.complete && img.naturalWidth > 0) {
      img.dataset.loaded = 'true';
    } else {
      img.addEventListener('load', function() { img.dataset.loaded = 'true'; }, { once: true });
      img.addEventListener('error', function() { img.dataset.loaded = 'true'; }, { once: true });
    }
  });

  var supportsIO = 'IntersectionObserver' in window;
  if (supportsIO) {
    var ioPlay = new IntersectionObserver(function(entries) {
      var running = entries.some(function(e) { return e.isIntersecting; });
      rows.forEach(function(row) {
        row.style.animationPlayState = running ? 'running' : 'paused';
      });
    }, { threshold: 0.01 });
    ioPlay.observe(track);
  } else {
    rows.forEach(function(row) { row.style.animationPlayState = 'running'; });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    rows.forEach(function(row) { row.style.animationPlayState = 'paused'; });
  }
});
