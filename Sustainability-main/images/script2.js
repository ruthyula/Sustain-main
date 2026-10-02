document.addEventListener('DOMContentLoaded', () => {
  /* Mobile navigation */
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuClose = document.querySelector('.menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  function setMenu(open) {
    menu.classList.toggle('active', open);
    menuOverlay.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (open) menuClose.focus();
  }

  menuToggle.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
  menuClose.addEventListener('click', () => setMenu(false));
  menuOverlay.addEventListener('click', () => setMenu(false));
  mobileLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('active')) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  /* Impact-story carousel */
  const stories = [...document.querySelectorAll('.story')];
  const prevStory = document.querySelector('.story-prev');
  const nextStory = document.querySelector('.story-next');
  const dotsContainer = document.querySelector('.story-dots');
  const storySection = document.querySelector('.stories');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STORY_INTERVAL = 7000;
  let currentStory = 0;
  let storyTimer;

  stories.forEach((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `story-dot${index === 0 ? ' active' : ''}`;
    button.setAttribute('aria-label', `Show story ${index + 1}`);
    button.addEventListener('click', () => {
      showStory(index);
      restartStories();
    });
    dotsContainer.appendChild(button);
  });

  const storyDots = [...dotsContainer.querySelectorAll('.story-dot')];

  function showStory(index) {
    currentStory = (index + stories.length) % stories.length;
    stories.forEach((story, storyIndex) => {
      const active = storyIndex === currentStory;
      story.hidden = !active;
      story.classList.toggle('active', active);
      story.setAttribute('aria-hidden', String(!active));
    });
    storyDots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentStory;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function stopStories() {
    window.clearInterval(storyTimer);
  }

  function startStories() {
    stopStories();
    if (!reduceMotion && !document.hidden) {
      storyTimer = window.setInterval(() => showStory(currentStory + 1), STORY_INTERVAL);
    }
  }

  function restartStories() {
    stopStories();
    startStories();
  }

  prevStory.addEventListener('click', () => {
    showStory(currentStory - 1);
    restartStories();
  });
  nextStory.addEventListener('click', () => {
    showStory(currentStory + 1);
    restartStories();
  });
  storySection.addEventListener('mouseenter', stopStories);
  storySection.addEventListener('mouseleave', startStories);
  storySection.addEventListener('focusin', stopStories);
  storySection.addEventListener('focusout', startStories);
  document.addEventListener('visibilitychange', () => document.hidden ? stopStories() : startStories());

  showStory(0);
  startStories();

  /* Accessible tabs */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];

  function activateTab(selectedTab) {
    tabs.forEach(tab => {
      const active = tab === selectedTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.id === selectedTab.getAttribute('aria-controls');
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  /* SDG horizontal slider */
  const goalsTrack = document.querySelector('.goals-track');
  const goalPrev = document.querySelector('.goal-prev');
  const goalNext = document.querySelector('.goal-next');

  function goalStep() {
    const card = goalsTrack.querySelector('.goal-card');
    const styles = window.getComputedStyle(goalsTrack);
    return card.getBoundingClientRect().width + (parseFloat(styles.gap) || 16);
  }

  goalPrev.addEventListener('click', () => goalsTrack.scrollBy({ left: -goalStep(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  goalNext.addEventListener('click', () => goalsTrack.scrollBy({ left: goalStep(), behavior: reduceMotion ? 'auto' : 'smooth' }));
});
