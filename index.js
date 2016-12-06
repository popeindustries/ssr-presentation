'use strict';

/** BUDDY BUILT **/

if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
if ('undefined' === typeof process) var process = { env: {} };
var $m = self.$m = self.$m || {};
if ('browser' != 'browser') {
  var $req = require;
  require = function buddyRequire (id) {
    if (!$m[id]) return $req(id);
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  };
} else {
  self.require = self.require || function buddyRequire (id) {
    if ($m[id]) {
      if ('function' == typeof $m[id]) $m[id]();
      return $m[id].exports;
    }

    if (process.env.NODE_ENV == 'development') {
      console.warn('module ' + id + ' not found');
    }
  };
}

(function () {
/*== src/index.js ==*/
$m['src/index'] = { exports: {} };

const srcindex__TOUCH_THRESHOLD = 100;

const srcindex__elSlides = document.querySelector('.slides');
const srcindex__elClock = document.querySelector('.clock');
const srcindex__isProduction = process.env.NODE_ENV == 'production';
const srcindex__isDevelopment = !srcindex__isProduction;
const srcindex__isLocal = window.location.hostname == 'localhost';
const srcindex__isNotes = window.name == 'notes';
const srcindex__start = Date.now();
const srcindex__startingSlide = srcindex__isProduction && !srcindex__isLocal ? 0 : srcindex__getUrlSlide();
let srcindex__model = window.model = srcindex__parse({
  notes: [],
  noteIndex: 0,
  notesWindow: null,
  slides: [],
  slideIndex: 0,
  steps: [],
  stepIndex: 0
});

/**
 * Parse slide elements
 * @param {Object} model
 * @returns {Array}
 */
function srcindex__parse(model) {
  model.slides = Array.prototype.slice.call(srcindex__elSlides.children).filter(element => {
    return element.tagName == 'HEADER' || element.tagName == 'SECTION';
  });
  model.notes = model.slides.reduce((notes, element, idx) => {
    notes.push(Array.prototype.slice.call(element.querySelectorAll('.note')));
    return notes;
  }, []);
  model.steps = model.notes.map(group => {
    let step = 0;

    return group.reduce((steps, element, idx) => {
      if (element.classList.contains('step')) step++;
      steps.push(step);
      return steps;
    }, []);
  });

  return model;
}

/**
 * Display slide at 'slideIndex'
 * @param {Number} slideIndex
 * @param {Boolean} back
 */
function srcindex__changeSlide(slideIndex, back) {
  const current = srcindex__model.slides[srcindex__model.slideIndex];
  const next = srcindex__model.slides[slideIndex];
  const noteIndex = back ? srcindex__model.notes[slideIndex].length - 1 : 0;

  srcindex__model.stepIndex = back ? srcindex__model.steps[slideIndex] + 1 : 0;

  next.classList.add('show');
  next.classList.remove('hide');
  next.style.zIndex = 100 - slideIndex;
  if (current && next != current) {
    current.classList.add('hide');
    current.addEventListener('transitionend', srcindex__onTransitionEnd, false);
  }
  srcindex__changeNote(srcindex__model.slideIndex, slideIndex, noteIndex);
  srcindex__model.slideIndex = slideIndex;
  if (srcindex__isLocal) window.history.pushState({}, '', window.location.pathname.replace(/\/\d*$/, `/${ slideIndex }`));
}

/**
 * Display note at 'noteIndex'
 * @param {Number} currentSlideIndex
 * @param {Number} nextSlideIndex
 * @param {Number} noteIndex
 */
function srcindex__changeNote(currentSlideIndex, nextSlideIndex, noteIndex) {
  const current = srcindex__model.notes[currentSlideIndex][srcindex__model.noteIndex];
  const next = srcindex__model.notes[nextSlideIndex][noteIndex];

  if (current) current.style.opacity = 0;
  if (next) next.style.opacity = 1;
  srcindex__changeStep(nextSlideIndex, srcindex__model.steps[nextSlideIndex][noteIndex]);
  if (srcindex__model.notesWindow) srcindex__model.notesWindow.change(currentSlideIndex, nextSlideIndex, srcindex__model.noteIndex, noteIndex);
  srcindex__model.noteIndex = noteIndex;
}

/**
 * Display step at 'stepIndex'
 * @param {Number} slideIndex
 * @param {Nunber} stepIndex
 */
function srcindex__changeStep(slideIndex, stepIndex) {
  const slide = srcindex__model.slides[slideIndex];
  let classStr = slide.getAttribute('class').replace(/step-\d*/g, '').replace(/\s+/, ' ');

  for (let i = 1; i <= stepIndex; i++) {
    classStr += ` step-${ i }`;
  }
  slide.setAttribute('class', classStr);
  srcindex__model.stepIndex = stepIndex;
}

/**
 * Display note in remote window
 * @param {Number} currentSlideIndex
 * @param {Number} nextSlideIndex
 * @param {Number} currentNoteIndex
 * @param {Number} nextNoteIndex
 */
function srcindex__changeRemoteNote(currentSlideIndex, nextSlideIndex, currentNoteIndex, nextNoteIndex) {
  const currentSlide = srcindex__model.slides[currentSlideIndex];
  const nextSlide = srcindex__model.slides[nextSlideIndex];
  const currentNote = srcindex__model.notes[currentSlideIndex][currentNoteIndex];
  const nextNote = srcindex__model.notes[nextSlideIndex][nextNoteIndex];

  nextSlide.classList.add('show');
  nextSlide.classList.remove('hide');
  nextSlide.style.zIndex = 100 - nextSlideIndex;
  if (currentSlide && nextSlide != currentSlide) {
    currentSlide.classList.add('hide');
    currentSlide.classList.remove('show');
  }
  if (currentNote) currentNote.style.opacity = 0;
  if (nextNote) nextNote.style.opacity = 1;
  srcindex__updateClock();
}

/**
 * Advance to next step/slide/note
 */
function srcindex__next() {
  if (srcindex__model.noteIndex + 1 < srcindex__model.notes[srcindex__model.slideIndex].length) {
    srcindex__changeNote(srcindex__model.slideIndex, srcindex__model.slideIndex, srcindex__model.noteIndex + 1);
  } else if (srcindex__model.slideIndex + 1 < srcindex__model.slides.length) {
    srcindex__changeSlide(srcindex__model.slideIndex + 1);
  } else {
    return;
  }
}

/**
 * Advance to previous step/slide/note
 */
function srcindex__prev() {
  if (srcindex__model.noteIndex - 1 >= 0) {
    srcindex__changeNote(srcindex__model.slideIndex, srcindex__model.slideIndex, srcindex__model.noteIndex - 1);
  } else if (srcindex__model.slideIndex - 1 >= 0) {
    srcindex__changeSlide(srcindex__model.slideIndex - 1, true);
  } else {
    return;
  }
}

/**
 * Update clock
 */
function srcindex__updateClock() {
  if (srcindex__isNotes) {
    const diff = Date.now() - srcindex__start;
    const m = Math.floor(diff / 60000);
    const s = (diff % 60000 / 1000).toFixed(0);

    srcindex__elClock.innerHTML = `${ m }:${ s < 10 ? 0 : '' }${ s }`;
  }
}

/**
 * Get current slide index from url
 * @returns {Number}
 */
function srcindex__getUrlSlide() {
  const slide = window.location.pathname.split('/').slice(-1)[0];

  return parseInt(slide, 0) || 0;
}

/**
 * Handle key down
 * @param {Event} evt
 */
function srcindex__onKeyDown(evt) {
  const key = (evt.key || evt.keyIdentifier).toLowerCase();

  if (key === 'arrowright' || key === 'arrowup' || key === 'right' || key === 'up' || key === 'pagedown') {
    srcindex__next();
  }
  if (key === 'arrowleft' || key === 'arrowdown' || key === 'left' || key === 'down' || key === 'pageup') {
    srcindex__prev();
  }
}

/**
 * Handle touch
 * @param {Event} evt
 */
function srcindex__onTouchStart(evt) {
  evt.preventDefault();
  const start = evt.layerX;
  let cb;

  document.documentElement.addEventListener('touchend', cb = function (evt) {
    document.documentElement.removeEventListener('touchend', cb, false);
    const diff = start - evt.layerX;

    if (Math.abs(diff) >= srcindex__TOUCH_THRESHOLD) diff > 0 ? srcindex__next() : srcindex__prev();
  }, false);
}

/**
 * Handle pop state event
 * @param {Event} evt
 */
function srcindex__onPopState(evt) {
  if (evt.state) srcindex__changeSlide(srcindex__getUrlSlide());
}

/**
 * Handle transition end event
 * @param {Event} evt
 */
function srcindex__onTransitionEnd(evt) {
  const slide = evt.target;

  slide.removeEventListener('transitionend', srcindex__onTransitionEnd, false);

  if (slide.classList.contains('hide') && slide.classList.contains('show')) {
    slide.classList.remove('show');
    slide.style.zIndex = null;
  }
}

if (!srcindex__isNotes) {
  document.addEventListener('keyup', srcindex__onKeyDown, false, { passive: true });
  document.documentElement.addEventListener('touchstart', srcindex__onTouchStart, false);

  window.hljs.initHighlightingOnLoad();

  if (srcindex__isProduction) {
    srcindex__model.notesWindow = window.open(window.location.href, 'notes');
    setTimeout(() => {
      srcindex__changeSlide(srcindex__startingSlide);
    }, 1000);
  } else {
    if (srcindex__isDevelopment) {
      document.documentElement.classList.add('dev');
    }
    if (srcindex__isLocal) {
      window.addEventListener('popstate', srcindex__onPopState, false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    srcindex__changeSlide(srcindex__startingSlide);
  }
} else {
  window.change = srcindex__changeRemoteNote;
  document.documentElement.classList.add('presentation-notes');
}
/*≠≠ src/index.js ≠≠*/
})()