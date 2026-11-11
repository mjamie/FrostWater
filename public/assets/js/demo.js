'use strict';
const media = window.DEMO_MEDIA?.[document.body.dataset.demo];
const player = document.querySelector('#demo-video');
const videoWindow = document.querySelector('#video-window');
const emptyVideo = document.querySelector('#video-placeholder');
const status = document.querySelector('#media-status');
if (media?.video) {
  player.src = media.video;
  player.hidden = false;
  emptyVideo.hidden = true;
  if (media.captions) {
    const track = document.createElement('track');
    Object.assign(track, { kind: 'captions', label: 'English', srclang: 'en', src: media.captions, default: true });
    player.append(track);
  }
  player.addEventListener('error', () => {
    player.hidden = true;
    emptyVideo.hidden = false;
    emptyVideo.querySelector('h3').textContent = 'Video unavailable';
    emptyVideo.querySelector('p').textContent = 'This walkthrough could not be loaded. You can still explore the images and example below.';
  });
}
document.querySelector('#fullscreen-video').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (videoWindow.requestFullscreen) await videoWindow.requestFullscreen();
    else if (!player.hidden && player.webkitEnterFullscreen) player.webkitEnterFullscreen();
    else status.textContent = 'Fullscreen is unavailable in this browser. Use the video player’s native controls when a video is available.';
  } catch {
    status.textContent = 'Fullscreen could not be opened. Try the video player’s fullscreen control.';
  }
});
document.addEventListener('fullscreenchange', () => {
  document.querySelector('#fullscreen-video').textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
});
const image = document.querySelector('#gallery-image');
const caption = document.querySelector('#gallery-caption');
const thumbs = document.querySelector('#gallery-thumbnails');
const gallery = media?.gallery || [];
const dialog = document.querySelector('#image-dialog');
const expanded = dialog.querySelector('img');
function showImage(index) {
  const item = gallery[index];
  image.src = item.src; image.alt = item.alt; caption.textContent = item.caption;
  [...thumbs.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}
gallery.forEach((item, index) => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'media-thumb';
  button.textContent = String(index + 1).padStart(2, '0');
  button.setAttribute('aria-label', 'Show image ' + (index + 1) + ': ' + item.alt);
  button.addEventListener('click', () => showImage(index));
  thumbs.append(button);
});
if (gallery.length) showImage(0);
image.addEventListener('error', () => { caption.textContent = 'This image could not be loaded. Please select another image.'; });
document.querySelector('#expand-image').addEventListener('click', () => {
  expanded.src = image.src; expanded.alt = image.alt;
  dialog.querySelector('p').textContent = caption.textContent;
  dialog.showModal();
});
dialog.querySelector('button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
