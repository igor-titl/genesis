/**
 * Podcast Player — Genesis Website
 * Vanilla JS, no dependencies.
 * Usage: new PodcastPlayer('#my-player', { src: 'audio.mp3' })
 * Or auto-init via data attributes on .pp-player elements.
 */

(function () {
  'use strict';

  const SPEEDS = [0.75, 1.0, 1.2, 1.5, 1.75, 2.0];
  const DEFAULT_LOGO_URL = 'https://cdn.prod.website-files.com/67ba1fc336b021e4a72670cd/69d7d5266cb6dc38ebbb52a7_podcast_logo.svg';
  const DEFAULT_BACK_ICON_URL = 'https://cdn.prod.website-files.com/67ba1fc336b021e4a72670cd/69d7d52664e2d7c467103e09_backward_15.svg';
  const DEFAULT_FORWARD_ICON_URL = 'https://cdn.prod.website-files.com/67ba1fc336b021e4a72670cd/69d7d52839097087002e6255_forward_15.svg';
  const DEFAULT_BG_URL = 'https://cdn.prod.website-files.com/67ba1fc336b021e4a72670cd/69d7d58a1753366637617aee_podcast-bg%20(1).jpg';

  class PodcastPlayer {
    constructor(el, opts) {
      if (typeof el === 'string') el = document.querySelector(el);
      if (!el) return;

      this.el = el;
      this.opts = Object.assign({
        src:      el.dataset.src      || '',
        title:    el.dataset.title    || '',
        podcast:  el.dataset.podcast  || '',
        duration: parseFloat(el.dataset.duration) || 0,
      }, opts || {});

      this.speedIndex = SPEEDS.indexOf(1.0);
      this.isDragging = false;

      this._build();
      this._bindAudio();
      this._bindUI();
    }

    /* ── DOM Build ────────────────────────────────────────── */
    _build() {
      const o = this.opts;

      this.el.innerHTML = `
        <div class="pp-content">
          <div class="pp-headline">
            <div class="pp-episode-info">
              <p class="pp-podcast-name">${this._esc(o.podcast)}</p>
              <p class="pp-episode-title">${this._esc(o.title)}</p>
            </div>
            <div class="pp-logo">
              <img src="${DEFAULT_LOGO_URL}" alt="${this._esc(o.podcast)} logo">
            </div>
          </div>

          <div class="pp-player-row">
            <div class="pp-playback">
              <div class="pp-transport">
                <button class="pp-skip-btn" data-skip="-15" aria-label="Back 15 seconds" title="−15s">
                  <img src="${DEFAULT_BACK_ICON_URL}" alt="" aria-hidden="true">
                </button>
                <button class="pp-play-btn pp-js-play" aria-label="Play">
                  <svg class="pp-icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4.5v15l12-7.5z"/></svg>
                  <svg class="pp-icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.5 4.5h5v15h-5zm8.5 0h5v15h-5z"/></svg>
                </button>
                <button class="pp-skip-btn" data-skip="15" aria-label="Forward 15 seconds" title="+15s">
                  <img src="${DEFAULT_FORWARD_ICON_URL}" alt="" aria-hidden="true">
                </button>
              </div>

              <div class="pp-progress-area">
                <p class="pp-time pp-js-time">0:00 / 0:00</p>
                <div class="pp-progress-bar pp-js-bar" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Seek">
                  <div class="pp-progress-track"></div>
                  <div class="pp-progress-fill pp-js-fill"></div>
                  <div class="pp-progress-handle pp-js-handle"></div>
                </div>
              </div>
            </div>

            <div class="pp-extras">
              <button class="pp-speed-btn pp-js-speed" aria-label="Playback speed" aria-haspopup="listbox">
                <span class="pp-js-speed-label">1.0×</span>
                <div class="pp-speed-dropdown pp-js-speed-dd" role="listbox">
                  ${SPEEDS.map(s => `<div class="pp-speed-option${s === 1.0 ? ' is-active' : ''}" role="option" data-speed="${s}">${s}×</div>`).join('')}
                </div>
              </button>

              <div class="pp-volume-wrap">
                <button class="pp-volume-btn pp-js-vol-btn" aria-label="Volume">
                  <span class="pp-icon-vol-on">${ICONS.volOn}</span>
                  <span class="pp-icon-vol-off">${ICONS.volOff}</span>
                </button>
                <div class="pp-volume-popup pp-js-vol-popup" role="dialog" aria-label="Volume control">
                  <input class="pp-volume-slider pp-js-vol-slider" type="range" min="0" max="1" step="0.02" value="1" aria-label="Volume">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Set static background image for the whole player
      const bgUrl = DEFAULT_BG_URL;
      this.el.style.backgroundImage = `url(${bgUrl})`;

      // Cache refs
      this.$ = {
        play:     this.el.querySelector('.pp-js-play'),
        time:     this.el.querySelector('.pp-js-time'),
        bar:      this.el.querySelector('.pp-js-bar'),
        fill:     this.el.querySelector('.pp-js-fill'),
        handle:   this.el.querySelector('.pp-js-handle'),
        speed:    this.el.querySelector('.pp-js-speed'),
        speedLabel: this.el.querySelector('.pp-js-speed-label'),
        speedDd:  this.el.querySelector('.pp-js-speed-dd'),
        volBtn:   this.el.querySelector('.pp-js-vol-btn'),
        volPopup: this.el.querySelector('.pp-js-vol-popup'),
        volSlider:this.el.querySelector('.pp-js-vol-slider'),
      };
    }

    /* ── Audio setup ──────────────────────────────────────── */
    _bindAudio() {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      if (this.opts.src) this.audio.src = this.opts.src;

      this.audio.addEventListener('loadedmetadata', () => this._updateTime());
      this.audio.addEventListener('timeupdate',     () => this._updateProgress());
      this.audio.addEventListener('ended',          () => this._onEnded());
      this.audio.addEventListener('waiting',        () => this.el.classList.add('is-loading'));
      this.audio.addEventListener('canplay',        () => this.el.classList.remove('is-loading'));
    }

    /* ── UI bindings ──────────────────────────────────────── */
    _bindUI() {
      const $ = this.$;

      // Play / pause
      $.play.addEventListener('click', () => this.togglePlay());

      // Skip buttons
      this.el.querySelectorAll('[data-skip]').forEach(btn => {
        btn.addEventListener('click', () => this.skip(parseFloat(btn.dataset.skip)));
      });

      // Progress bar — click
      $.bar.addEventListener('click', e => this._seekFromEvent(e));

      // Progress bar — drag
      $.bar.addEventListener('mousedown',  e => this._startDrag(e));
      $.bar.addEventListener('touchstart', e => this._startDrag(e), { passive: true });
      document.addEventListener('mousemove',  e => this.isDragging && this._dragMove(e));
      document.addEventListener('touchmove',  e => this.isDragging && this._dragMove(e), { passive: true });
      document.addEventListener('mouseup',    () => this._endDrag());
      document.addEventListener('touchend',   () => this._endDrag());

      // Speed dropdown
      $.speed.addEventListener('click', e => {
        e.stopPropagation();
        $.speedDd.classList.toggle('is-open');
        $.volPopup.classList.remove('is-open');
      });

      $.speedDd.querySelectorAll('.pp-speed-option').forEach(opt => {
        opt.addEventListener('click', e => {
          e.stopPropagation();
          this.setSpeed(parseFloat(opt.dataset.speed));
          $.speedDd.classList.remove('is-open');
        });
      });

      // Volume popup
      $.volBtn.addEventListener('click', e => {
        e.stopPropagation();
        $.volPopup.classList.toggle('is-open');
        $.speedDd.classList.remove('is-open');
      });

      $.volSlider.addEventListener('input', () => {
        this.setVolume(parseFloat($.volSlider.value));
      });

      // Close popups on outside click
      document.addEventListener('click', () => {
        $.speedDd.classList.remove('is-open');
        $.volPopup.classList.remove('is-open');
      });

      // Keyboard accessibility on progress bar
      $.bar.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') this.skip(5);
        if (e.key === 'ArrowLeft')  this.skip(-5);
      });
      $.bar.setAttribute('tabindex', '0');
    }

    /* ── Playback ─────────────────────────────────────────── */
    togglePlay() {
      if (this.audio.paused) this.play();
      else this.pause();
    }

    play() {
      this.audio.play().catch(() => {});
      this.el.classList.add('is-playing');
    }

    pause() {
      this.audio.pause();
      this.el.classList.remove('is-playing');
    }

    skip(seconds) {
      this.audio.currentTime = Math.max(0, Math.min(
        this.audio.duration || 0,
        this.audio.currentTime + seconds
      ));
    }

    setSpeed(speed) {
      this.audio.playbackRate = speed;
      this.$.speedLabel.textContent = speed + '×';
      this.$.speedDd.querySelector('.pp-speed-option.is-active')?.classList.remove('is-active');
      this.$.speedDd.querySelector(`[data-speed="${speed}"]`)?.classList.add('is-active');
    }

    setVolume(vol) {
      this.audio.volume = vol;
      if (vol === 0) {
        this.el.classList.add('is-muted');
      } else {
        this.el.classList.remove('is-muted');
      }
    }

    /* ── Progress ─────────────────────────────────────────── */
    _updateProgress() {
      const dur = this.audio.duration || 0;
      const cur = this.audio.currentTime || 0;
      const pct = dur ? (cur / dur) * 100 : 0;

      this.$.fill.style.width   = pct + '%';
      this.$.handle.style.left  = pct + '%';
      this.$.bar.setAttribute('aria-valuenow', Math.round(pct));
      this._updateTime(cur, dur);
    }

    _updateTime(cur, dur) {
      cur = cur ?? (this.audio.currentTime || 0);
      dur = dur ?? (this.audio.duration || this.opts.duration || 0);
      this.$.time.textContent = `${this._fmt(cur)} / ${this._fmt(dur)}`;
    }

    _onEnded() {
      this.el.classList.remove('is-playing');
      this.audio.currentTime = 0;
      this._updateProgress();
    }

    /* ── Seeking ──────────────────────────────────────────── */
    _seekFromEvent(e) {
      const rect = this.$.bar.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (this.audio.duration) {
        this.audio.currentTime = pct * this.audio.duration;
      }
    }

    _startDrag(e) {
      this.isDragging = true;
      this._seekFromEvent(e);
    }

    _dragMove(e) {
      if (!this.isDragging) return;
      this._seekFromEvent(e);
    }

    _endDrag() {
      this.isDragging = false;
    }

    /* ── Helpers ──────────────────────────────────────────── */
    _fmt(sec) {
      if (!isFinite(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    _esc(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /* ── Public: update src / metadata ───────────────────────*/
    load(opts) {
      Object.assign(this.opts, opts);
      if (opts.src)     this.audio.src = opts.src;
      if (opts.title)   this.el.querySelector('.pp-episode-title').textContent = opts.title;
      if (opts.podcast) this.el.querySelector('.pp-podcast-name').textContent = opts.podcast;
      const logoImg = this.el.querySelector('.pp-logo img');
      if (logoImg) logoImg.src = DEFAULT_LOGO_URL;
      this.el.style.backgroundImage = `url(${DEFAULT_BG_URL})`;
      this.pause();
      this._updateTime(0, opts.duration || 0);
    }
  }

  /* ── Icons ──────────────────────────────────────────────── */
  const ICONS = {
    volOn: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>`,

    volOff: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>`,
  };

  /* ── Auto-init ──────────────────────────────────────────── */
  function autoInit() {
    document.querySelectorAll('.pp-player[data-src]').forEach(el => {
      if (!el._ppInstance) {
        el._ppInstance = new PodcastPlayer(el);
      }
    });
  }

  // Expose globally
  window.PodcastPlayer = PodcastPlayer;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
