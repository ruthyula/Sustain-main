// FAQ Accordion

const stories = document.querySelectorAll(".story");
const dots = document.querySelectorAll(".dot");
const storiesContainer = document.querySelector(".stories");
const prevBtn = document.querySelector(".nav-btn.prev");
const nextBtn = document.querySelector(".nav-btn.next");

let currentStory = 0;
let autoSlideTimer = null;
const SLIDE_INTERVAL = 60000; // 1 minute

/**
 * Display specific story by index and update navigation state
 * @param {number} index 
 */
function showStory(index) {
  if (!stories.length) return;

  // Update Stories state & accessibility
  stories.forEach((story, i) => {
    const isActive = i === index;
    story.classList.toggle("active", isActive);
    story.setAttribute("aria-hidden", !isActive);
    story.setAttribute("aria-label", `Story ${i + 1} of ${stories.length}`);
  });

  // Update Dots state & accessibility
  dots.forEach((dot, i) => {
    const isActive = i === index;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  currentStory = index;
}

/**
 * Navigate to next/previous story
 * @param {number} direction - 1 for Next, -1 for Previous
 */
function changeStory(direction) {
  const newIndex = (currentStory + direction + stories.length) % stories.length;
  showStory(newIndex);
  resetAutoSlide();
}

/**
 * Navigate directly to a specific story index
 * @param {number} index 
 */
function goToStory(index) {
  showStory(index);
  resetAutoSlide();
}

/**
 * Start the automatic story carousel timer
 */
function startAutoSlide() {
  stopAutoSlide();
  autoSlideTimer = setInterval(() => {
    changeStory(1);
  }, SLIDE_INTERVAL);
}

/**
 * Stop the automatic story carousel timer
 */
function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}

/**
 * Reset the timer after manual interaction
 */
function resetAutoSlide() {
  if (!document.hidden) {
    startAutoSlide();
  }
}

/* =========================
   EVENT LISTENERS (Non-Inline)
   ========================= */

// Attach click handlers to navigation dots
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    goToStory(index);
  });
});

// Attach click handlers to Prev/Next buttons
if (prevBtn) {
  prevBtn.addEventListener("click", () => changeStory(-1));
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => changeStory(1));
}

// Pause auto-slide when tab/window is hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoSlide();
  } else {
    startAutoSlide();
  }
});

// Pause auto-slide on hover
if (storiesContainer) {
  storiesContainer.addEventListener("mouseenter", stopAutoSlide);
  storiesContainer.addEventListener("mouseleave", () => {
    if (!document.hidden) startAutoSlide();
  });
}

// Keyboard navigation (Left / Right Arrow Keys)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    changeStory(-1);
  } else if (e.key === "ArrowRight") {
    changeStory(1);
  }
});

// Initialize display and rotation
showStory(currentStory);
if (!document.hidden) {
  startAutoSlide();
}



//scllores
(function(){
  const scrollDiv = document.getElementById('scrollDiv');
  const wrapper = document.getElementById('wrapper');
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const cards = Array.from(scrollDiv.querySelectorAll('.goal-card'));
  const dotsWrap = document.getElementById('dots');
  const total = cards.length;
  let currentIndex = 0;
  let autoInterval = null;
  let userInteracting = false;
  let resumeTimeout = null;

  // build dots
  for (let i=0;i<total;i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i===0 ? ' active' : '');
    d.dataset.index = i;
    d.setAttribute('role','tab');
    d.setAttribute('aria-selected', i===0 ? 'true' : 'false');
    dotsWrap.appendChild(d);
  }
  const dots = Array.from(dotsWrap.children);

  // compute card width including gap
  function getCardStep() {
    const style = getComputedStyle(scrollDiv);
    const gap = parseFloat(style.gap || style.columnGap) || 16;
    const cardW = cards[0].offsetWidth;
    return cardW + gap;
  }

  function setActiveDot(index) {
    dots.forEach((dot,i)=>{
      dot.classList.toggle('active', i===index);
      dot.setAttribute('aria-selected', i===index ? 'true' : 'false');
    });
  }

  function scrollToIndex(index, behavior = 'smooth') {
    const step = getCardStep();
    scrollDiv.scrollTo({ left: Math.round(index * step), behavior });
    currentIndex = index;
    setActiveDot(currentIndex);
  }

  // arrow controls
  btnLeft.addEventListener('click', ()=> {
    stopAuto();
    currentIndex = (currentIndex - 1 + total) % total;
    scrollToIndex(currentIndex);
    restartAutoAfterInteraction();
  });

  btnRight.addEventListener('click', ()=> {
    stopAuto();
    currentIndex = (currentIndex + 1) % total;
    scrollToIndex(currentIndex);
    restartAutoAfterInteraction();
  });

  // clickable dots
  dots.forEach(d => d.addEventListener('click', (e) => {
    stopAuto();
    const idx = Number(d.dataset.index);
    scrollToIndex(idx);
    restartAutoAfterInteraction();
  }));

  // debounce helper
  function debounce(fn, wait=80){
    let t;
    return (...args)=> {
      clearTimeout(t);
      t = setTimeout(()=> fn.apply(this, args), wait);
    };
  }

  // update index while user scrolls (no snapping)
  const onScroll = debounce(() => {
    const step = getCardStep();
    const idx = Math.round(scrollDiv.scrollLeft / step);
    currentIndex = Math.max(0, Math.min(total-1, idx));
    setActiveDot(currentIndex);
  }, 60);

  scrollDiv.addEventListener('scroll', () => {
    userInteracting = true;
    onScroll();
    // ensure auto is stopped while interacting
    stopAuto();
    // will restart later via restartAutoAfterInteraction
    clearTimeout(resumeTimeout);
  });

  // pause/resume on pointer enter/leave
  wrapper.addEventListener('pointerenter', () => {
    stopAuto();
  });
  wrapper.addEventListener('pointerleave', () => {
    restartAutoAfterInteraction();
  });

  // also listen for touchstart/touchend for mobile explicit touches
  scrollDiv.addEventListener('touchstart', () => {
    stopAuto();
    userInteracting = true;
  }, {passive:true});
  scrollDiv.addEventListener('touchend', () => {
    // wait a little then snap to nearest
    setTimeout(()=> {
      const step = getCardStep();
      const idx = Math.round(scrollDiv.scrollLeft / step);
      scrollToIndex(Math.max(0, Math.min(total-1, idx)));
      restartAutoAfterInteraction();
      userInteracting = false;
    }, 120);
  });

  // auto scroll
  function startAuto() {
    if (autoInterval) return;
    autoInterval = setInterval(()=> {
      currentIndex = (currentIndex + 1) % total;
      scrollToIndex(currentIndex);
    }, 1000);
  }
  function stopAuto() {
    if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
  }
  function restartAutoAfterInteraction(delay = 2000) {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(()=> {
      userInteracting = false;
      startAuto();
    }, delay);
  }

  // responsive: if layout changes recalc and snap
  window.addEventListener('resize', debounce(()=> {
    // snap to current index after resize
    scrollToIndex(currentIndex, 'smooth');
  }, 120));

  // initial setup
  // ensure container is snapped to first card on load
  setTimeout(()=> scrollToIndex(0, 'auto'), 20);
  startAuto();

  // expose for debugging (optional)
  window.__sdgCarousel = { scrollToIndex, startAuto, stopAuto };

})();


const btn1 = document.getElementById('btn1');
    const btn2 = document.getElementById('btn2');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');

    btn1.addEventListener('click', () => {
      page1.classList.add('active');
      page2.classList.remove('active');
      btn1.classList.add('active');
      btn2.classList.remove('active');
    });

    btn2.addEventListener('click', () => {
      page2.classList.add('active');
      page1.classList.remove('active');
      btn2.classList.add('active');
      btn1.classList.remove('active');
    });

/*document.addEventListener('DOMContentLoaded', () =>{
  const faqContainer = document.querySelector('.faq-content');
  faqContainer.addEventListener('click', (e) => {
    const groupHeader = e.target.closest('.faq-group-header');
    if(!groupHeader) return;

    const group = groupHeader.parentElement;
    const groupBody = group.querySelector('.faq-group-body');
    const icon = groupHeader.querySelector('i');
    //Toggle icon
    icon.classList.toggle('fa-plus');
    icon.classList.toggle('fa-minus');
    //Toggle visibility of body
    groupBody.classList.toggle('open');

    //Close other open FAQ bodies
   const otherGroups = faqContainer.querySelectorAll('.faq-group');
    otherGroups.forEach((otherG) => {
      if(otherG !== group) {
      const otherGroupBody = otherG.querySelector('.faq-group-body');
      const otherIcon =  otherG.querySelector('.faq-group-header i');
      otherGroupBody.classList.remove('open');
      otherIcon.classList.remove('fa-minus');
      otherIcon.classList.add('fa-plus');
    
      }
    }); 
  });
});*/

//Mobile Menu
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButton = document.querySelector('.hamburger-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  hamburgerButton.addEventListener('click', () => mobileMenu.classList.toggle('active')
  );
});


//scllores

