'use strict';

// Progressive enhancement: the video retains native controls if this script
// cannot initialise. The footage and poster remain ordinary local media.
document.querySelectorAll('.studio-film-player').forEach(player => {
  const video = player.querySelector('video');
  const start = player.querySelector('.film-start');
  const controls = player.querySelector('.film-controls');
  const play = player.querySelector('.film-play');
  const mute = player.querySelector('.film-mute');
  const volume = player.querySelector('.film-volume');
  const seek = player.querySelector('.film-seek');
  const current = player.querySelector('.film-current');
  const duration = player.querySelector('.film-duration');
  const fullscreen = player.querySelector('.film-fullscreen');
  const status = player.querySelector('.film-status');
  if (![video, start, controls, play, mute, volume, seek, current, duration, fullscreen, status].every(Boolean)) return;

  let playPending = false;
  let lastVolume = video.volume || 1;
  const time = value => {
    const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  function message(text = '') { status.textContent = text; status.hidden = !text; }
  function updatePlayback() {
    const playing = !video.paused && !video.ended;
    player.dataset.filmPlaying = String(playing);
    play.setAttribute('aria-label', playing ? 'Pause video' : video.ended ? 'Replay video' : 'Play video');
    start.setAttribute('aria-label', video.ended ? 'Replay studio film' : 'Play studio film');
    // Keep a keyboard user's next pause action reachable when the overlay hides.
    if (playing && document.activeElement === start) play.focus({ preventScroll: true });
    start.hidden = playing;
  }
  function updateTime() {
    const known = Number.isFinite(video.duration) && video.duration > 0;
    current.textContent = time(video.currentTime);
    duration.hidden = !known;
    duration.textContent = known ? ` / ${time(video.duration)}` : '';
    seek.disabled = !known;
    if (known) {
      seek.max = String(video.duration);
      seek.value = String(video.currentTime);
      seek.style.setProperty('--range-progress', `${video.currentTime / video.duration * 100}%`);
      seek.setAttribute('aria-valuetext', `${time(video.currentTime)} of ${time(video.duration)}`);
    }
  }
  function updateVolume() {
    const silent = video.muted || video.volume === 0;
    player.dataset.filmMuted = String(silent);
    mute.setAttribute('aria-label', silent ? 'Unmute video' : 'Mute video');
    mute.setAttribute('aria-pressed', String(silent));
    volume.value = String(video.muted ? 0 : video.volume);
    volume.style.setProperty('--range-progress', `${Number(volume.value) * 100}%`);
    volume.setAttribute('aria-valuetext', `${Math.round(Number(volume.value) * 100)} percent`);
  }
  async function togglePlayback() {
    if (!video.paused) { video.pause(); return; }
    if (playPending) return;
    playPending = true;
    message();
    try {
      if (video.ended) video.currentTime = 0;
      await video.play();
    } catch (error) {
      // Pausing during a pending play is a normal interruption, not a failure.
      if (error.name !== 'AbortError') message('The video could not start. Press play to try again.');
    } finally {
      playPending = false;
      updatePlayback();
    }
  }
  function updateFullscreen() {
    const active = document.fullscreenElement === player;
    player.dataset.filmFullscreen = String(active);
    fullscreen.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
  }
  start.addEventListener('click', togglePlayback);
  play.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  mute.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
      if (video.volume === 0) video.volume = lastVolume;
      video.muted = false;
    } else {
      lastVolume = video.volume;
      video.muted = true;
    }
  });
  volume.addEventListener('input', () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
    if (video.volume > 0) lastVolume = video.volume;
  });
  seek.addEventListener('input', () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = Math.min(video.duration, Math.max(0, Number(seek.value)));
    updateTime();
  });
  fullscreen.hidden = !(document.fullscreenEnabled && player.requestFullscreen) && !video.webkitEnterFullscreen;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === player) await document.exitFullscreen();
      else if (document.fullscreenEnabled && player.requestFullscreen) await player.requestFullscreen();
      else video.webkitEnterFullscreen?.();
    } catch { message('Full screen is unavailable in this browser window.'); }
  });
  ['play', 'playing', 'pause', 'ended', 'emptied'].forEach(event => video.addEventListener(event, updatePlayback));
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeking', 'ended', 'emptied'].forEach(event => video.addEventListener(event, updateTime));
  video.addEventListener('volumechange', updateVolume);
  video.addEventListener('playing', () => message());
  video.addEventListener('error', () => message('The video could not load. Please reload the page to try again.'));
  document.addEventListener('fullscreenchange', updateFullscreen);
  updatePlayback(); updateTime(); updateVolume(); updateFullscreen();
  video.controls = false;
  player.dataset.filmEnhanced = 'true';
  controls.hidden = false;
});
