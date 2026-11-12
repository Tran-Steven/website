(() => {
  const grid = document.querySelector('[data-project-grid]');
  const section = grid?.parentElement;
  const heading = section?.querySelector('#projects');
  const georgia = document.querySelector('[data-georgia-reveal]');
  if (!heading) return;

  const cards = [...grid.querySelectorAll(':scope > a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const singleColumn = matchMedia('(max-width: 640px)');
  const lastCardProgress = new WeakMap();
  let revealFrame = 0;
  let lastHeading = -1;
  let lastGeorgia = -1;

  function scrollProgress(top, start, end) {
    const progress = Math.max(0, Math.min(1, (start - top) / (start - end)));
    return progress * progress * (3 - 2 * progress);
  }

  function reveal() {
    revealFrame = 0;
    if (reduced.matches) {
      section.removeAttribute('data-gallery-reveal');
      return;
    }

    const height = window.innerHeight;
    // Measure layout positions so the reveal does not feed back into its own progress.
    const headingTop = heading.parentElement.getBoundingClientRect().top;
    const gridTop = grid.getBoundingClientRect().top;
    const headingProgress = scrollProgress(headingTop, height, height * .76);
    const georgiaProgress = georgia && scrollProgress(georgia.getBoundingClientRect().top,
      height * .97, height * (singleColumn.matches ? .40 : .26));
    const start = height * (singleColumn.matches ? .96 : .99);
    const cardProgress = cards.map(card => {
      const distance = singleColumn.matches
        ? height * .39
        : Math.min(height * .41, card.offsetHeight);
      return scrollProgress(gridTop + card.offsetTop, start, start - distance);
    });

    if (headingProgress !== lastHeading) {
      section.style.setProperty('--heading-in', headingProgress);
      lastHeading = headingProgress;
    }
    if (georgia && georgiaProgress !== lastGeorgia) {
      georgia.style.setProperty('--georgia-in', georgiaProgress);
      georgia.toggleAttribute('data-georgia-opening', georgiaProgress < 1);
      lastGeorgia = georgiaProgress;
    }
    for (const [index, card] of cards.entries()) {
      const progress = cardProgress[index];
      if (progress === lastCardProgress.get(card)) continue;
      card.style.setProperty('--card-in', progress);
      card.toggleAttribute('data-project-revealing', progress < 1);
      lastCardProgress.set(card, progress);
    }
    section.toggleAttribute('data-gallery-reveal', true);
  }

  function queueReveal() {
    if (!revealFrame) revealFrame = requestAnimationFrame(reveal);
  }

  window.addEventListener('scroll', queueReveal, { passive: true });
  window.addEventListener('resize', queueReveal, { passive: true });
  reduced.addEventListener('change', queueReveal);
  reveal();
})();
