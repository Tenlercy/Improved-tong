/* ======================================================
   TWITTERISH — App Logic
   ====================================================== */

'use strict';

// ── Utilities ──────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function linkify(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
}

// ── Data ───────────────────────────────────────────────
const CURRENT_USER = {
  id: 'u0',
  name: 'Felix Doe',
  handle: '@felixdoe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  bio: 'Building cool things on the web. Lover of design & coffee ☕',
  location: 'San Francisco, CA',
  joined: 'January 2020',
  following: 342,
  followers: 1_284,
  verified: false,
};

const USERS = [
  { id: 'u1', name: 'Alex Rivera', handle: '@alexrivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', verified: true },
  { id: 'u2', name: 'Sara Chen', handle: '@sarachen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', verified: false },
  { id: 'u3', name: 'James Park', handle: '@jamespark', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', verified: true },
  { id: 'u4', name: 'Mia Lopez', handle: '@mialopez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', verified: false },
  { id: 'u5', name: 'Dev Weekly', handle: '@devweekly', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevW', verified: true },
];

const FOLLOW_SUGGESTIONS = [
  { ...USERS[4], bio: 'Weekly dev digest' },
  { id: 'u6', name: 'Design Daily', handle: '@designdaily', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesD', verified: true, bio: 'Daily design inspiration' },
  { id: 'u7', name: 'Open Source Hub', handle: '@oshub', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OSH', verified: false, bio: 'OSS projects & community' },
];

const TRENDING = [
  { category: 'Technology', tag: '#OpenSource', count: '42.1K' },
  { category: 'Design', tag: '#UIDesign', count: '18.5K' },
  { category: 'Programming', tag: '#JavaScript', count: '85.3K' },
  { category: 'Technology', tag: '#WebDev', count: '31.2K' },
  { category: 'Trending', tag: '#TypeScript', count: '22.8K' },
];

let tweets = [
  {
    id: 't1',
    user: USERS[0],
    text: "Just shipped a major update to our design system! Dark mode, improved accessibility, and 40% faster load times. Really proud of what the team built 🎉 #webdev #design",
    ts: Date.now() - 1000 * 60 * 12,
    likes: 248, retweets: 61, replies: 34, views: 4200,
    liked: false, retweeted: false, bookmarked: false,
    pinned: false,
    image: null,
    replies_data: [],
  },
  {
    id: 't2',
    user: USERS[2],
    text: "Hot take: the best documentation is code that doesn't need documentation.\n\nWrite expressive, self-documenting code first. Add docs only when truly needed.",
    ts: Date.now() - 1000 * 60 * 45,
    likes: 912, retweets: 203, replies: 87, views: 18600,
    liked: true, retweeted: false, bookmarked: true,
    pinned: false,
    image: null,
    replies_data: [
      { id: 'r1', user: USERS[1], text: "Agreed, but there's always that one function that needs a comment 😅", ts: Date.now() - 1000 * 60 * 40 },
    ],
  },
  {
    id: 't3',
    user: USERS[1],
    text: "Morning routine update: swapped coffee for green tea ☕→🍵\n\nDay 3 and honestly feeling way more focused. Give it a try!",
    ts: Date.now() - 1000 * 60 * 90,
    likes: 143, retweets: 18, replies: 26, views: 2800,
    liked: false, retweeted: false, bookmarked: false,
    pinned: false,
    image: null,
    replies_data: [],
  },
  {
    id: 't4',
    user: USERS[4],
    text: "📰 This week in dev:\n\n• React 19 stable is here\n• Bun 1.2 released\n• CSS @starting-style lands in all browsers\n• Node 22 enters LTS\n\n#javascript #webdev",
    ts: Date.now() - 1000 * 60 * 60 * 3,
    likes: 1832, retweets: 547, replies: 112, views: 42000,
    liked: false, retweeted: true, bookmarked: false,
    pinned: false,
    image: null,
    replies_data: [],
  },
  {
    id: 't5',
    user: USERS[3],
    text: "CSS-only infinite scroll marquee — no JS, no libraries, 15 lines of code 🤯\n\n#css #webdev #frontenddevelopment",
    ts: Date.now() - 1000 * 60 * 60 * 7,
    likes: 3291, retweets: 891, replies: 204, views: 89000,
    liked: false, retweeted: false, bookmarked: false,
    pinned: false,
    image: null,
    replies_data: [],
  },
];

let notifications = [
  { id: 'n1', type: 'like', user: USERS[0], tweetSnippet: 'Just shipped a major update...', ts: Date.now() - 1000 * 60 * 5, unread: true },
  { id: 'n2', type: 'follow', user: USERS[2], ts: Date.now() - 1000 * 60 * 30, unread: true },
  { id: 'n3', type: 'retweet', user: USERS[4], tweetSnippet: 'Morning routine update...', ts: Date.now() - 1000 * 60 * 55, unread: true },
  { id: 'n4', type: 'reply', user: USERS[1], tweetSnippet: 'Agreed, but there's always...', ts: Date.now() - 1000 * 60 * 90, unread: false },
  { id: 'n5', type: 'like', user: USERS[3], tweetSnippet: 'Just shipped a major update...', ts: Date.now() - 1000 * 60 * 120, unread: false },
];

let messages = [
  { id: 'm1', user: USERS[0], preview: 'Hey! Did you see the new release?', ts: Date.now() - 1000 * 60 * 8, unread: true },
  { id: 'm2', user: USERS[2], preview: 'That CSS trick was mind-blowing 🤯', ts: Date.now() - 1000 * 60 * 120, unread: false },
  { id: 'm3', user: USERS[4], preview: 'We should collaborate on a project!', ts: Date.now() - 1000 * 60 * 60 * 24, unread: false },
];

let followingState = {};
let pendingImageDataUrl = null;
let pendingModalImageDataUrl = null;
let currentTweetId = null;
let activeTab = 'for-you';

// ── Theme ───────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('tw-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tw-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  $('#icon-sun').style.display = theme === 'light' ? 'block' : 'none';
  $('#icon-moon').style.display = theme === 'dark' ? 'block' : 'none';
}

// ── Navigation ─────────────────────────────────────────
function initNav() {
  $$('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;
      switchView(view);
      $$('.nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function switchView(view) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#view-${view}`).classList.add('active');

  if (view === 'notifications') renderNotifications();
  if (view === 'messages') renderMessages();
  if (view === 'bookmarks') renderBookmarks();
  if (view === 'profile') renderProfile();
  if (view === 'explore') renderExplore();
}

// ── Tabs ───────────────────────────────────────────────
function initTabs() {
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      renderFeed();
    });
  });
}

// ── Composer ───────────────────────────────────────────
function initComposer() {
  const input = $('#inline-input');
  const btn = $('#inline-post-btn');

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim() === '' && !pendingImageDataUrl;
    autoResize(input);
  });

  btn.addEventListener('click', () => postTweet(input.value.trim(), pendingImageDataUrl, 'inline'));
}

function initModalComposer() {
  const input = $('#modal-input');
  const btn = $('#modal-post-btn');

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim() === '' && !pendingModalImageDataUrl;
    autoResize(input);
  });

  btn.addEventListener('click', () => postTweet(input.value.trim(), pendingModalImageDataUrl, 'modal'));

  $('#open-composer').addEventListener('click', openModal);
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-overlay').addEventListener('click', e => {
    if (e.target === $('#modal-overlay')) closeModal();
  });
}

function initReplyComposer() {
  const input = $('#reply-input');
  const btn = $('#reply-post-btn');
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim() === '';
    autoResize(input);
  });
  btn.addEventListener('click', postReply);
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function openModal() {
  $('#modal-overlay').classList.add('open');
  $('#modal-input').focus();
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
  $('#modal-input').value = '';
  $('#modal-post-btn').disabled = true;
  removeModalImage();
}

function postTweet(text, imageDataUrl, source) {
  if (!text && !imageDataUrl) return;

  const newTweet = {
    id: 't' + Date.now(),
    user: CURRENT_USER,
    text,
    ts: Date.now(),
    likes: 0, retweets: 0, replies: 0, views: 0,
    liked: false, retweeted: false, bookmarked: false,
    pinned: false,
    image: imageDataUrl || null,
    replies_data: [],
  };

  tweets.unshift(newTweet);
  renderFeed();

  if (source === 'inline') {
    $('#inline-input').value = '';
    $('#inline-post-btn').disabled = true;
    pendingImageDataUrl = null;
    $('#image-preview-wrap').style.display = 'none';
    $('#image-preview').src = '';
    autoResize($('#inline-input'));
  } else {
    closeModal();
  }
}

function postReply() {
  const input = $('#reply-input');
  const text = input.value.trim();
  if (!text || !currentTweetId) return;

  const tweet = tweets.find(t => t.id === currentTweetId);
  if (!tweet) return;

  const reply = {
    id: 'r' + Date.now(),
    user: CURRENT_USER,
    text,
    ts: Date.now(),
  };
  tweet.replies_data.push(reply);
  tweet.replies++;

  input.value = '';
  $('#reply-post-btn').disabled = true;
  renderReplies(tweet);
  renderFeed();
}

// ── Image upload ───────────────────────────────────────
function triggerImageUpload() { $('#image-upload').click(); }
function triggerModalImageUpload() { $('#modal-image-upload').click(); }

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImageDataUrl = ev.target.result;
    $('#image-preview').src = pendingImageDataUrl;
    $('#image-preview-wrap').style.display = 'block';
    $('#inline-post-btn').disabled = false;
  };
  reader.readAsDataURL(file);
}

function handleModalImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingModalImageDataUrl = ev.target.result;
    $('#modal-image-preview').src = pendingModalImageDataUrl;
    $('#modal-image-preview-wrap').style.display = 'block';
    $('#modal-post-btn').disabled = false;
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  pendingImageDataUrl = null;
  $('#image-preview-wrap').style.display = 'none';
  $('#image-preview').src = '';
  $('#image-upload').value = '';
  if (!$('#inline-input').value.trim()) $('#inline-post-btn').disabled = true;
}

function removeModalImage() {
  pendingModalImageDataUrl = null;
  $('#modal-image-preview-wrap').style.display = 'none';
  $('#modal-image-preview').src = '';
  $('#modal-image-upload').value = '';
  if (!$('#modal-input').value.trim()) $('#modal-post-btn').disabled = true;
}

// ── Feed Rendering ─────────────────────────────────────
function renderFeed() {
  const list = $('#tweet-list');
  list.innerHTML = '';

  const feed = activeTab === 'following'
    ? tweets.filter(t => t.user.id !== CURRENT_USER.id)
    : tweets;

  if (feed.length === 0) {
    list.appendChild(emptyState('Nothing here yet', 'Be the first to post something!'));
    return;
  }

  feed.forEach(tweet => list.appendChild(buildTweetEl(tweet)));
}

function buildTweetEl(tweet, isDetail = false) {
  const wrap = el('div', `tweet${tweet.pinned ? ' pinned' : ''}`);

  // pinned label
  if (tweet.pinned) {
    const pinLabel = el('div', 'pinned-label', `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 4v6l-2 4h14l-2-4V4H7zm5 16c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/></svg> Pinned Post`);
    wrap.appendChild(pinLabel);
  }

  const avatarLink = el('a', '');
  const avatarImg = el('img', `avatar avatar-${isDetail ? 'lg' : 'md'}`);
  avatarImg.src = tweet.user.avatar;
  avatarImg.alt = tweet.user.name;
  avatarLink.appendChild(avatarImg);
  wrap.appendChild(avatarLink);

  const body = el('div', 'tweet-body');

  // header
  const header = el('div', 'tweet-header');
  header.innerHTML = `
    <span class="tweet-name">${tweet.user.name}</span>
    ${tweet.user.verified ? `<span class="tweet-verified"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.33-2.19c1.4.46 2.91.2 3.92-.81s1.26-2.52.8-3.91C21.37 14.67 22.25 13.43 22.25 12zM10.54 16.1l-3.92-3.93 1.42-1.42 2.5 2.51 5.64-5.65 1.42 1.41-7.06 7.08z"/></svg></span>` : ''}
    <span class="tweet-handle">${tweet.user.handle}</span>
    <span class="tweet-dot">·</span>
    <span class="tweet-time">${timeAgo(tweet.ts)}</span>
  `;
  body.appendChild(header);

  // text
  if (tweet.text) {
    const textEl = el('div', 'tweet-text', linkify(tweet.text));
    body.appendChild(textEl);
  }

  // image
  if (tweet.image) {
    const img = el('img', 'tweet-image');
    img.src = tweet.image;
    img.alt = 'Tweet image';
    body.appendChild(img);
  }

  // actions
  const actions = el('div', 'tweet-actions');
  actions.innerHTML = `
    <button class="action-btn reply-btn" data-id="${tweet.id}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
      <span>${formatCount(tweet.replies)}</span>
    </button>
    <button class="action-btn retweet-btn${tweet.retweeted ? ' retweeted' : ''}" data-id="${tweet.id}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>
      <span>${formatCount(tweet.retweets)}</span>
    </button>
    <button class="action-btn like-btn${tweet.liked ? ' liked' : ''}" data-id="${tweet.id}">
      <svg viewBox="0 0 24 24" fill="${tweet.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <span>${formatCount(tweet.likes)}</span>
    </button>
    <button class="action-btn bookmark-btn${tweet.bookmarked ? ' bookmarked' : ''}" data-id="${tweet.id}">
      <svg viewBox="0 0 24 24" fill="${tweet.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      <span>${formatCount(tweet.views)}</span>
    </button>
    <button class="action-btn share-btn" data-id="${tweet.id}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/></svg>
    </button>
  `;
  body.appendChild(actions);
  wrap.appendChild(body);

  // click tweet body → detail
  body.addEventListener('click', e => {
    if (e.target.closest('.action-btn')) return;
    openTweetDetail(tweet.id);
  });

  // action handlers
  wrap.querySelector('.reply-btn').addEventListener('click', e => {
    e.stopPropagation();
    openTweetDetail(tweet.id);
  });
  wrap.querySelector('.retweet-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleRetweet(tweet.id);
  });
  wrap.querySelector('.like-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleLike(tweet.id);
  });
  wrap.querySelector('.bookmark-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleBookmark(tweet.id);
  });
  wrap.querySelector('.share-btn').addEventListener('click', e => {
    e.stopPropagation();
    shareTweet(tweet);
  });

  return wrap;
}

// ── Actions ─────────────────────────────────────────────
function toggleLike(id) {
  const tweet = tweets.find(t => t.id === id);
  if (!tweet) return;
  tweet.liked = !tweet.liked;
  tweet.likes += tweet.liked ? 1 : -1;
  renderFeed();
  if (currentTweetId === id) openTweetDetail(id);
}

function toggleRetweet(id) {
  const tweet = tweets.find(t => t.id === id);
  if (!tweet) return;
  tweet.retweeted = !tweet.retweeted;
  tweet.retweets += tweet.retweeted ? 1 : -1;
  renderFeed();
}

function toggleBookmark(id) {
  const tweet = tweets.find(t => t.id === id);
  if (!tweet) return;
  tweet.bookmarked = !tweet.bookmarked;
  renderFeed();
  renderBookmarks();
}

function shareTweet(tweet) {
  const text = `${tweet.user.name}: "${tweet.text.slice(0, 80)}${tweet.text.length > 80 ? '...' : ''}"`;
  if (navigator.share) {
    navigator.share({ title: 'Twitterish post', text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('Link copied!'));
  } else {
    showToast('Link copied!');
  }
}

// ── Tweet Detail ───────────────────────────────────────
function openTweetDetail(id) {
  const tweet = tweets.find(t => t.id === id);
  if (!tweet) return;
  currentTweetId = id;

  const content = $('#tweet-detail-content');
  content.innerHTML = '';
  content.appendChild(buildTweetEl(tweet, true));

  renderReplies(tweet);

  $('#tweet-detail-overlay').classList.add('open');
  $('#reply-input').value = '';
  $('#reply-post-btn').disabled = true;
}

function closeTweetDetail() {
  $('#tweet-detail-overlay').classList.remove('open');
  currentTweetId = null;
}

function renderReplies(tweet) {
  const list = $('#replies-list');
  list.innerHTML = '';
  if (!tweet.replies_data.length) return;
  tweet.replies_data.forEach(reply => {
    const item = el('div', 'reply-item');
    const avatar = el('img', 'avatar avatar-sm');
    avatar.src = reply.user.avatar;
    avatar.alt = reply.user.name;
    const body = el('div', 'reply-body');
    body.innerHTML = `
      <div class="reply-header">
        <span class="reply-name">${reply.user.name}</span>
        <span class="reply-handle">${reply.user.handle}</span>
        <span class="tweet-dot">·</span>
        <span class="reply-time">${timeAgo(reply.ts)}</span>
      </div>
      <div class="reply-text">${linkify(reply.text)}</div>
    `;
    item.appendChild(avatar);
    item.appendChild(body);
    list.appendChild(item);
  });
}

$('#tweet-detail-overlay').addEventListener('click', e => {
  if (e.target === $('#tweet-detail-overlay')) closeTweetDetail();
});

// ── Notifications ──────────────────────────────────────
function renderNotifications() {
  const list = $('#notif-list');
  list.innerHTML = '';

  notifications.forEach(n => {
    const item = el('div', `notif-item${n.unread ? ' unread' : ''}`);
    item.addEventListener('click', () => {
      n.unread = false;
      renderNotifications();
      updateNotifBadge();
    });

    let iconHtml = '';
    let msgHtml = '';

    if (n.type === 'like') {
      iconHtml = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#f91880"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      msgHtml = `<strong>${n.user.name}</strong> liked your post: "${n.tweetSnippet}"`;
    } else if (n.type === 'follow') {
      iconHtml = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#1d9bf0"><path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"/></svg>`;
      msgHtml = `<strong>${n.user.name}</strong> followed you`;
    } else if (n.type === 'retweet') {
      iconHtml = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#00ba7c"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>`;
      msgHtml = `<strong>${n.user.name}</strong> reposted your post: "${n.tweetSnippet}"`;
    } else if (n.type === 'reply') {
      iconHtml = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#1d9bf0"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"/></svg>`;
      msgHtml = `<strong>${n.user.name}</strong> replied: "${n.tweetSnippet}"`;
    }

    item.innerHTML = `
      <div class="notif-icon">${iconHtml}</div>
      <div class="notif-content">
        <div class="notif-text">${msgHtml}</div>
        <div class="notif-time">${timeAgo(n.ts)}</div>
      </div>
    `;
    list.appendChild(item);
  });
}

function updateNotifBadge() {
  const badge = $('#notif-badge');
  const count = notifications.filter(n => n.unread).length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ── Messages ───────────────────────────────────────────
function renderMessages() {
  const list = $('#messages-list');
  list.innerHTML = '';
  messages.forEach(m => {
    const item = el('div', `message-item${m.unread ? ' unread' : ''}`);
    item.addEventListener('click', () => { m.unread = false; renderMessages(); });
    const avatar = el('img', 'avatar avatar-md');
    avatar.src = m.user.avatar;
    avatar.alt = m.user.name;
    item.appendChild(avatar);
    const info = el('div', 'msg-info');
    info.innerHTML = `
      <div class="msg-header">
        <span class="msg-name">${m.user.name}</span>
        <span class="msg-time">${timeAgo(m.ts)}</span>
      </div>
      <div class="msg-preview">${m.preview}</div>
    `;
    item.appendChild(info);
    list.appendChild(item);
  });
}

// ── Bookmarks ──────────────────────────────────────────
function renderBookmarks() {
  const list = $('#bookmark-list');
  list.innerHTML = '';
  const bookmarked = tweets.filter(t => t.bookmarked);
  if (!bookmarked.length) {
    list.appendChild(emptyState('No bookmarks yet', 'Save posts by clicking the bookmark icon.'));
    return;
  }
  bookmarked.forEach(t => list.appendChild(buildTweetEl(t)));
}

// ── Profile ────────────────────────────────────────────
function renderProfile() {
  const page = $('#profile-page');
  page.innerHTML = `
    <div class="profile-banner"></div>
    <div class="profile-info-section">
      <div class="profile-avatar-wrap">
        <img src="${CURRENT_USER.avatar}" alt="${CURRENT_USER.name}" class="avatar avatar-xl" />
        <button class="btn-edit-profile">Edit profile</button>
      </div>
      <div class="profile-name">${CURRENT_USER.name}</div>
      <div class="profile-handle">${CURRENT_USER.handle}</div>
      <div class="profile-bio">${CURRENT_USER.bio}</div>
      <div class="profile-meta">
        <span class="profile-meta-item">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 14.315c-2.088 0-4.003-.906-5.391-2.398C5.79 10.928 5.251 9.1 5.251 7.182 5.251 3.332 8.241.5 12 .5s6.749 2.832 6.749 6.682c0 1.918-.54 3.746-1.358 4.735-1.388 1.492-3.303 2.398-5.391 2.398zm0-12.315c-2.837 0-4.749 2.089-4.749 4.682 0 1.531.429 2.976 1.213 3.947.98 1.105 2.182 1.686 3.536 1.686s2.556-.581 3.535-1.686c.785-.971 1.214-2.416 1.214-3.947C16.749 4.089 14.837 2 12 2z"/><path d="M3.75 23.5c-.414 0-.75-.336-.75-.75 0-4.549 3.945-6.5 9-6.5s9 1.951 9 6.5c0 .414-.336.75-.75.75S19.5 23.664 19.5 23.25c0-2.686-2.271-5-7.5-5s-7.5 2.314-7.5 5c0 .414-.336.75-.75.75z"/></svg>
          ${CURRENT_USER.location}
        </span>
        <span class="profile-meta-item">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v13c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-13C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.28 0-.5.22-.5.5v13c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-13c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6z"/></svg>
          Joined ${CURRENT_USER.joined}
        </span>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><strong>${CURRENT_USER.following.toLocaleString()}</strong> <span>Following</span></div>
        <div class="profile-stat"><strong>${CURRENT_USER.followers.toLocaleString()}</strong> <span>Followers</span></div>
      </div>
    </div>
    <div class="tweet-list" id="profile-tweets"></div>
  `;

  const myTweets = tweets.filter(t => t.user.id === CURRENT_USER.id);
  const profileList = page.querySelector('#profile-tweets');
  if (!myTweets.length) {
    profileList.appendChild(emptyState("You haven't posted yet", "When you do, your posts will show up here."));
  } else {
    myTweets.forEach(t => profileList.appendChild(buildTweetEl(t)));
  }
}

// ── Explore ────────────────────────────────────────────
function renderExplore() {
  const container = $('#trending-explore');
  container.innerHTML = `<div class="explore-section-title">Trending now</div>`;

  TRENDING.forEach(item => {
    const div = el('div', 'trending-item');
    div.innerHTML = `
      <div class="trending-meta">${item.category} · Trending</div>
      <div class="trending-tag">${item.tag}</div>
      <div class="trending-count">${item.count} posts</div>
    `;
    div.addEventListener('click', () => {
      $('#search-input').value = item.tag;
      handleSearch(item.tag);
    });
    container.appendChild(div);
  });
}

function handleSearch(query) {
  const container = $('#trending-explore');
  if (!query.trim()) {
    renderExplore();
    return;
  }

  const q = query.toLowerCase();
  const results = tweets.filter(t =>
    t.text.toLowerCase().includes(q) ||
    t.user.name.toLowerCase().includes(q) ||
    t.user.handle.toLowerCase().includes(q)
  );

  container.innerHTML = `<div class="explore-section-title">Results for "${query}"</div>`;
  if (!results.length) {
    container.appendChild(emptyState('No results', `Try a different search term.`));
    return;
  }
  results.forEach(t => container.appendChild(buildTweetEl(t)));
}

// ── Right Sidebar ──────────────────────────────────────
function renderTrending() {
  const list = $('#trending-list');
  list.innerHTML = '';
  TRENDING.slice(0, 4).forEach(item => {
    const div = el('div', 'trending-item');
    div.innerHTML = `
      <div class="trending-meta">${item.category} · Trending</div>
      <div class="trending-tag">${item.tag}</div>
      <div class="trending-count">${item.count} posts</div>
    `;
    div.addEventListener('click', () => {
      switchView('explore');
      $$('.nav-item').forEach(l => l.classList.remove('active'));
      $('[data-view="explore"]').classList.add('active');
      $('#search-input').value = item.tag;
      handleSearch(item.tag);
    });
    list.appendChild(div);
  });
  const more = el('a', 'show-more', 'Show more');
  more.href = '#';
  more.addEventListener('click', e => {
    e.preventDefault();
    switchView('explore');
  });
  list.appendChild(more);
}

function renderFollowSuggestions() {
  const list = $('#follow-list');
  list.innerHTML = '';
  FOLLOW_SUGGESTIONS.forEach(user => {
    const item = el('div', 'follow-item');
    const avatar = el('img', 'avatar avatar-sm');
    avatar.src = user.avatar;
    avatar.alt = user.name;
    item.appendChild(avatar);
    const info = el('div', 'follow-item-info');
    info.innerHTML = `<div class="follow-item-name">${user.name}</div><div class="follow-item-handle">${user.handle}</div>`;
    item.appendChild(info);

    const btn = el('button', `btn-follow${followingState[user.id] ? ' following' : ''}`,
      followingState[user.id] ? 'Following' : 'Follow');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      followingState[user.id] = !followingState[user.id];
      btn.textContent = followingState[user.id] ? 'Following' : 'Follow';
      btn.classList.toggle('following', followingState[user.id]);
    });
    item.appendChild(btn);
    list.appendChild(item);
  });
  const more = el('a', 'show-more', 'Show more');
  more.href = '#';
  list.appendChild(more);
}

// ── Toast ──────────────────────────────────────────────
function showToast(msg) {
  const toast = el('div', '', msg);
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--color-accent)', color: '#fff', padding: '10px 20px',
    borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '0.9rem',
    zIndex: 999, animation: 'fadeIn .2s ease', boxShadow: '0 4px 16px rgba(0,0,0,.2)',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

// ── Empty state ─────────────────────────────────────────
function emptyState(title, subtitle) {
  const div = el('div', 'empty-state');
  div.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
  return div;
}

// ── Auto-refresh timestamps ────────────────────────────
setInterval(() => {
  $$('.tweet-time').forEach(el => {
    // timestamps are rendered per-tweet; a full re-render is lightweight
  });
}, 60_000);

// ── Init ───────────────────────────────────────────────
function init() {
  initTheme();
  initNav();
  initTabs();
  initComposer();
  initModalComposer();
  initReplyComposer();
  renderFeed();
  renderTrending();
  renderFollowSuggestions();
  updateNotifBadge();

  $('#theme-toggle').addEventListener('click', toggleTheme);

  // keyboard: Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeTweetDetail();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
