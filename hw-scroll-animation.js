(function () {
  const cardList = document.querySelector('.hw-card-list');
  const cards    = Array.from(document.querySelectorAll('.hw-card'));

  const images = [
    document.querySelector('.hw-card_img._11'),
    document.querySelector('.hw-card_img._2'),
    document.querySelector('.hw-card_img._3'),
  ];
  const texts = [
    document.querySelector('.hw-img-clmn_desc .hw-card_text._1'),
    document.querySelector('.hw-img-clmn_desc .hw-card_text._2'),
    document.querySelector('.hw-img-clmn_desc .hw-card_text._3'),
  ];

  if (!cardList || !cards.length) return;

  images.forEach(el => { if (el) el.style.transition = 'opacity 0.4s ease'; });

  let currentIndex = -1;

  function applyActive(index) {
    if (currentIndex === index) return;
    currentIndex = index;
    images.forEach((img, i) => { if (img) img.style.opacity = i === index ? '1' : '0'; });
    texts.forEach((txt, i)  => { if (txt) txt.style.display = i === index ? 'flex' : 'none'; });
  }

  // Card whose vertical center is closest to the viewport midpoint
  function getActiveIndex() {
    const mid = window.innerHeight * 0.5;
    let best = 0, bestDist = Infinity;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const dist = Math.abs((r.top + r.height / 2) - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  let rafId;
  function tick() {
    applyActive(getActiveIndex());
  }

  window.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }, { passive: true });

  tick(); // run on load
})();
