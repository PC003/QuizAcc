// QuizMaster Pro - Quiz Platform Application Logic
(function() {
  'use strict';

  // State Management
  const state = {
    allQuestions: [],
    currentCategory: 'CAT 1',
    currentTopic: 'ALL',
    filterMode: 'all', // 'all', 'unanswered', 'mistakes', 'bookmarked'
    searchQuery: '',
    filteredQuestions: [],
    currentIndex: 0,
    userAnswers: {},   // { [questionId]: { selected: 'A', isCorrect: true, timestamp: Date.now() } }
    bookmarks: new Set(),
    soundEnabled: true,
    theme: 'dark'
  };

  // Audio Feedback Synthesizer using Web Audio API
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'correct') {
        // High pleasant major chord chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        // Low gentle buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Audio playback fails gracefully if not permitted
    }
  }

  // DOM Elements
  const DOM = {
    sectionPills: document.querySelectorAll('.section-pills .pill-btn'),
    topicFilter: document.getElementById('topic-filter'),
    modePills: document.querySelectorAll('.mode-pills .mode-pill'),
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search'),
    soundBtn: document.getElementById('sound-btn'),
    themeBtn: document.getElementById('theme-btn'),
    restartTopBtn: document.getElementById('restart-top-btn'),
    restartAllBtn: document.getElementById('restart-all-btn'),
    restartSectionBtn: document.getElementById('restart-section-btn'),
    gridToggleBtn: document.getElementById('grid-toggle-btn'),
    closeDrawerBtn: document.getElementById('close-drawer-btn'),
    matrixDrawer: document.getElementById('matrix-drawer'),
    paletteGrid: document.getElementById('palette-grid'),
    matrixCount: document.getElementById('matrix-count'),
    
    // Stats
    statAnswered: document.getElementById('stat-answered'),
    statCorrect: document.getElementById('stat-correct'),
    statWrong: document.getElementById('stat-wrong'),
    statAccuracy: document.getElementById('stat-accuracy'),
    mistakesCount: document.getElementById('mistakes-count'),
    bookmarkedCount: document.getElementById('bookmarked-count'),
    progressBar: document.getElementById('quiz-progress-bar'),

    // Question Card
    questionCard: document.getElementById('question-card'),
    qCatBadge: document.getElementById('q-cat-badge'),
    qTopicBadge: document.getElementById('q-topic-badge'),
    qNumLabel: document.getElementById('q-num-label'),
    qText: document.getElementById('q-text'),
    optionsContainer: document.getElementById('options-container'),
    bookmarkBtn: document.getElementById('bookmark-btn'),
    
    // Feedback
    feedbackCard: document.getElementById('feedback-card'),
    feedbackHeader: document.getElementById('feedback-header'),
    feedbackStatus: document.getElementById('feedback-status'),
    feedbackCorrectOpt: document.getElementById('feedback-correct-opt'),
    feedbackExplanation: document.getElementById('feedback-explanation'),
    
    // Navigation
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    
    // Completion View
    completionView: document.getElementById('completion-view'),
    completionSubtitle: document.getElementById('completion-subtitle'),
    fTotal: document.getElementById('f-total'),
    fCorrect: document.getElementById('f-correct'),
    fWrong: document.getElementById('f-wrong'),
    fAccuracy: document.getElementById('f-accuracy'),
    reviewMistakesBtn: document.getElementById('review-mistakes-btn'),
    continueNextCatBtn: document.getElementById('continue-next-cat-btn'),
    
    // Modals
    restartModal: document.getElementById('restart-modal'),
    restartModalMsg: document.getElementById('restart-modal-msg'),
    cancelRestartBtn: document.getElementById('cancel-restart-btn'),
    confirmRestartBtn: document.getElementById('confirm-restart-btn')
  };

  // Local Storage Helpers
  function saveStorage() {
    try {
      localStorage.setItem('quiz_user_answers', JSON.stringify(state.userAnswers));
      localStorage.setItem('quiz_bookmarks', JSON.stringify([...state.bookmarks]));
      localStorage.setItem('quiz_theme', state.theme);
      localStorage.setItem('quiz_sound', state.soundEnabled ? 'true' : 'false');
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  function loadStorage() {
    try {
      const savedAnswers = localStorage.getItem('quiz_user_answers');
      if (savedAnswers) state.userAnswers = JSON.parse(savedAnswers);

      const savedBookmarks = localStorage.getItem('quiz_bookmarks');
      if (savedBookmarks) state.bookmarks = new Set(JSON.parse(savedBookmarks));

      const savedTheme = localStorage.getItem('quiz_theme');
      if (savedTheme) {
        state.theme = savedTheme;
        applyTheme(savedTheme);
      }

      const savedSound = localStorage.getItem('quiz_sound');
      if (savedSound !== null) {
        state.soundEnabled = savedSound === 'true';
        updateSoundUI();
      }
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      DOM.themeBtn.querySelector('.moon-icon').classList.add('hidden');
      DOM.themeBtn.querySelector('.sun-icon').classList.remove('hidden');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      DOM.themeBtn.querySelector('.moon-icon').classList.remove('hidden');
      DOM.themeBtn.querySelector('.sun-icon').classList.add('hidden');
    }
  }

  function updateSoundUI() {
    const onIcon = DOM.soundBtn.querySelector('.sound-on');
    const offIcon = DOM.soundBtn.querySelector('.sound-off');
    if (state.soundEnabled) {
      onIcon.classList.remove('hidden');
      offIcon.classList.add('hidden');
    } else {
      onIcon.classList.add('hidden');
      offIcon.classList.remove('hidden');
    }
  }

  // Populate Topics dropdown based on current category
  function updateTopicsDropdown() {
    const questionsInCat = state.currentCategory === 'ALL'
      ? state.allQuestions
      : state.allQuestions.filter(q => q.category === state.currentCategory);

    const topicCounts = {};
    questionsInCat.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });

    const topics = Object.keys(topicCounts).sort();
    
    DOM.topicFilter.innerHTML = '<option value="ALL">All Topics in Section (' + questionsInCat.length + ' Qs)</option>';
    topics.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = `${t} (${topicCounts[t]})`;
      if (t === state.currentTopic) opt.selected = true;
      DOM.topicFilter.appendChild(opt);
    });

    // Reset topic to ALL if previously selected topic doesn't exist in current category
    if (state.currentTopic !== 'ALL' && !topicCounts[state.currentTopic]) {
      state.currentTopic = 'ALL';
      DOM.topicFilter.value = 'ALL';
    }
  }

  // Filter Questions Pipeline
  function applyFilters() {
    let list = state.allQuestions;

    // 1. Category Filter
    if (state.currentCategory !== 'ALL') {
      list = list.filter(q => q.category === state.currentCategory);
    }

    // 2. Topic Filter
    if (state.currentTopic !== 'ALL') {
      list = list.filter(q => q.topic === state.currentTopic);
    }

    // 3. Mode Filter (all, unanswered, mistakes, bookmarked)
    if (state.filterMode === 'unanswered') {
      list = list.filter(q => !state.userAnswers[q.id]);
    } else if (state.filterMode === 'mistakes') {
      list = list.filter(q => state.userAnswers[q.id] && !state.userAnswers[q.id].isCorrect);
    } else if (state.filterMode === 'bookmarked') {
      list = list.filter(q => state.bookmarks.has(q.id));
    }

    // 4. Search Filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      list = list.filter(q => {
        if (q.question.toLowerCase().includes(query)) return true;
        if (q.topic.toLowerCase().includes(query)) return true;
        for (let key in q.options) {
          if (q.options[key].toLowerCase().includes(query)) return true;
        }
        return false;
      });
    }

    state.filteredQuestions = list;
    if (state.currentIndex >= list.length) {
      state.currentIndex = Math.max(0, list.length - 1);
    }

    updateStats();
    renderPalette();
    renderCurrentQuestion();
  }

  // Update Live Stats
  function updateStats() {
    // Current pool stats
    const pool = state.filteredQuestions;
    const answeredInPool = pool.filter(q => state.userAnswers[q.id]);
    const correctInPool = pool.filter(q => state.userAnswers[q.id] && state.userAnswers[q.id].isCorrect);
    const wrongInPool = answeredInPool.length - correctInPool.length;
    const accuracy = answeredInPool.length > 0
      ? Math.round((correctInPool.length / answeredInPool.length) * 100)
      : 0;

    DOM.statAnswered.textContent = `${answeredInPool.length} / ${pool.length}`;
    DOM.statCorrect.textContent = correctInPool.length;
    DOM.statWrong.textContent = wrongInPool;
    DOM.statAccuracy.textContent = `${accuracy}%`;

    // Global counts for badges
    const allMistakes = state.allQuestions.filter(q => state.userAnswers[q.id] && !state.userAnswers[q.id].isCorrect).length;
    DOM.mistakesCount.textContent = allMistakes;
    DOM.bookmarkedCount.textContent = state.bookmarks.size;

    // Progress bar
    const progress = pool.length > 0 ? (answeredInPool.length / pool.length) * 100 : 0;
    DOM.progressBar.style.width = `${progress}%`;
  }

  // Format Code/Math Text in Strings
  function formatContent(text) {
    if (!text) return '';
    // Escape standard HTML
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Format code within backticks or java code patterns
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
    return escaped;
  }

  // Render Current Question
  function renderCurrentQuestion() {
    const list = state.filteredQuestions;

    if (list.length === 0) {
      DOM.questionCard.classList.remove('hidden');
      DOM.completionView.classList.add('hidden');
      DOM.qCatBadge.textContent = state.currentCategory;
      DOM.qTopicBadge.textContent = 'No Questions';
      DOM.qNumLabel.textContent = '0 of 0';
      DOM.qText.textContent = 'No questions match the current filter or search criteria.';
      DOM.optionsContainer.innerHTML = '';
      DOM.feedbackCard.classList.add('hidden');
      DOM.prevBtn.disabled = true;
      DOM.nextBtn.disabled = true;
      return;
    }

    const q = list[state.currentIndex];
    const userAns = state.userAnswers[q.id];

    DOM.questionCard.classList.remove('hidden');
    DOM.completionView.classList.add('hidden');

    // Header Meta
    DOM.qCatBadge.textContent = q.category;
    DOM.qCatBadge.className = 'badge cat-badge';
    if (q.category === 'CAT 1') DOM.qCatBadge.style.borderColor = 'var(--cat1-color)';
    else if (q.category === 'CAT 2') DOM.qCatBadge.style.borderColor = 'var(--cat2-color)';
    else if (q.category === 'CAT 3') DOM.qCatBadge.style.borderColor = 'var(--cat3-color)';

    DOM.qTopicBadge.textContent = q.topic;
    DOM.qNumLabel.textContent = `Question ${state.currentIndex + 1} of ${list.length}`;

    // Bookmark Status
    if (state.bookmarks.has(q.id)) {
      DOM.bookmarkBtn.classList.add('active');
    } else {
      DOM.bookmarkBtn.classList.remove('active');
    }

    // Question Text
    DOM.qText.innerHTML = formatContent(q.question);

    // Options Rendering
    DOM.optionsContainer.innerHTML = '';
    const optionKeys = ['A', 'B', 'C', 'D'];

    optionKeys.forEach(key => {
      const optText = q.options[key] || '';
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('data-option', key);
      btn.setAttribute('role', 'radio');

      const isUserChoice = userAns && userAns.selected === key;
      const isCorrectKey = q.answer === key;

      if (userAns) {
        btn.disabled = true;
        if (isCorrectKey) {
          btn.classList.add('correct');
        } else if (isUserChoice) {
          btn.classList.add('wrong');
        } else {
          btn.classList.add('dimmed');
        }
      }

      btn.innerHTML = `
        <span class="option-key">${key}</span>
        <span class="option-text">${formatContent(optText)}</span>
        <span class="option-indicator">${isCorrectKey ? '✓' : (isUserChoice ? '✗' : '')}</span>
      `;

      btn.addEventListener('click', () => handleSelectOption(key));
      DOM.optionsContainer.appendChild(btn);
    });

    // Immediate Feedback Card
    if (userAns) {
      DOM.feedbackCard.classList.remove('hidden');
      const isCorrect = userAns.isCorrect;
      
      DOM.feedbackHeader.className = 'feedback-header ' + (isCorrect ? 'status-correct' : 'status-wrong');
      DOM.feedbackStatus.innerHTML = isCorrect
        ? '✓ Excellent! Correct Answer'
        : '✗ Incorrect Answer';

      DOM.feedbackCorrectOpt.textContent = `Option ${q.answer}: "${q.options[q.answer]}"`;
      DOM.feedbackExplanation.innerHTML = formatContent(q.explanation || 'No explanation provided.');
    } else {
      DOM.feedbackCard.classList.add('hidden');
    }

    // Nav Buttons
    DOM.prevBtn.disabled = state.currentIndex === 0;
    DOM.nextBtn.disabled = state.currentIndex === list.length - 1;

    // Highlight current in matrix palette
    updatePaletteActiveItem();
  }

  // Handle Option Selection
  function handleSelectOption(selectedKey) {
    const list = state.filteredQuestions;
    if (list.length === 0) return;
    const q = list[state.currentIndex];

    // Already answered? Prevent double submission
    if (state.userAnswers[q.id]) return;

    const isCorrect = selectedKey === q.answer;
    state.userAnswers[q.id] = {
      selected: selectedKey,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    // Audio cue
    playTone(isCorrect ? 'correct' : 'wrong');

    // Save & re-render view
    saveStorage();
    updateStats();
    renderCurrentQuestion();
    renderPalette();

    // If user answered the last question in the view and all are answered, check completion
    checkSectionCompletion();
  }

  // Check Section Completion
  function checkSectionCompletion() {
    const list = state.filteredQuestions;
    const answeredCount = list.filter(q => state.userAnswers[q.id]).length;

    if (list.length > 0 && answeredCount === list.length && state.currentIndex === list.length - 1) {
      setTimeout(() => {
        showCompletionScreen();
      }, 700);
    }
  }

  // Show Completion Screen
  function showCompletionScreen() {
    const list = state.filteredQuestions;
    const correctCount = list.filter(q => state.userAnswers[q.id] && state.userAnswers[q.id].isCorrect).length;
    const wrongCount = list.length - correctCount;
    const accuracy = list.length > 0 ? Math.round((correctCount / list.length) * 100) : 0;

    DOM.questionCard.classList.add('hidden');
    DOM.completionView.classList.remove('hidden');

    DOM.completionSubtitle.textContent = `You have completed all ${list.length} questions in ${state.currentCategory} (${state.currentTopic === 'ALL' ? 'All Topics' : state.currentTopic})!`;
    DOM.fTotal.textContent = list.length;
    DOM.fCorrect.textContent = correctCount;
    DOM.fWrong.textContent = wrongCount;
    DOM.fAccuracy.textContent = `${accuracy}%`;

    playTone('correct');
  }

  // Render Palette Grid
  function renderPalette() {
    DOM.paletteGrid.innerHTML = '';
    const list = state.filteredQuestions;
    DOM.matrixCount.textContent = `${list.length} Questions`;

    list.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = 'palette-item';
      item.textContent = idx + 1;
      item.setAttribute('data-index', idx);
      item.title = `Q${idx + 1}: ${q.topic}`;

      const ans = state.userAnswers[q.id];
      if (ans) {
        if (ans.isCorrect) item.classList.add('correct');
        else item.classList.add('wrong');
      }

      if (state.bookmarks.has(q.id)) {
        item.classList.add('bookmarked');
      }

      if (idx === state.currentIndex) {
        item.classList.add('current');
      }

      item.addEventListener('click', () => {
        playTone('click');
        state.currentIndex = idx;
        renderCurrentQuestion();
        // on mobile, close drawer after click
        if (window.innerWidth <= 1024) {
          DOM.matrixDrawer.classList.remove('open');
        }
      });

      DOM.paletteGrid.appendChild(item);
    });
  }

  function updatePaletteActiveItem() {
    const items = DOM.paletteGrid.querySelectorAll('.palette-item');
    items.forEach((item, idx) => {
      if (idx === state.currentIndex) {
        item.classList.add('current');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('current');
      }
    });
  }

  // Restart Logic
  let restartActionTarget = 'current_section'; // or 'all'

  function promptRestart(target) {
    restartActionTarget = target;
    if (target === 'current_section') {
      DOM.restartModalMsg.textContent = `Are you sure you want to reset answers and restart ${state.currentCategory}?`;
    } else {
      DOM.restartModalMsg.textContent = 'Are you sure you want to reset all answers and progress across ALL 700 questions?';
    }
    DOM.restartModal.classList.remove('hidden');
  }

  function executeRestart() {
    if (restartActionTarget === 'current_section') {
      const targetCat = state.currentCategory;
      if (targetCat === 'ALL') {
        state.userAnswers = {};
      } else {
        state.allQuestions
          .filter(q => q.category === targetCat)
          .forEach(q => {
            delete state.userAnswers[q.id];
          });
      }
    } else {
      state.userAnswers = {};
    }

    state.currentIndex = 0;
    saveStorage();
    DOM.restartModal.classList.add('hidden');
    DOM.completionView.classList.add('hidden');
    DOM.questionCard.classList.remove('hidden');

    applyFilters();
    playTone('click');
  }

  // Event Listeners
  function setupEventListeners() {
    // Section Pills
    DOM.sectionPills.forEach(pill => {
      pill.addEventListener('click', () => {
        playTone('click');
        DOM.sectionPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        state.currentCategory = pill.getAttribute('data-cat');
        state.currentIndex = 0;
        state.currentTopic = 'ALL';
        updateTopicsDropdown();
        applyFilters();
      });
    });

    // Topic Filter
    DOM.topicFilter.addEventListener('change', (e) => {
      playTone('click');
      state.currentTopic = e.target.value;
      state.currentIndex = 0;
      applyFilters();
    });

    // Mode Pills
    DOM.modePills.forEach(pill => {
      pill.addEventListener('click', () => {
        playTone('click');
        DOM.modePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterMode = pill.getAttribute('data-mode');
        state.currentIndex = 0;
        applyFilters();
      });
    });

    // Search Input
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.clearSearchBtn.classList.toggle('hidden', !state.searchQuery);
      state.currentIndex = 0;
      applyFilters();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.classList.add('hidden');
      applyFilters();
    });

    // Prev / Next Buttons
    DOM.prevBtn.addEventListener('click', () => {
      if (state.currentIndex > 0) {
        playTone('click');
        state.currentIndex--;
        renderCurrentQuestion();
      }
    });

    DOM.nextBtn.addEventListener('click', () => {
      if (state.currentIndex < state.filteredQuestions.length - 1) {
        playTone('click');
        state.currentIndex++;
        renderCurrentQuestion();
      }
    });

    // Bookmark Toggle
    DOM.bookmarkBtn.addEventListener('click', () => {
      const list = state.filteredQuestions;
      if (list.length === 0) return;
      const q = list[state.currentIndex];

      if (state.bookmarks.has(q.id)) {
        state.bookmarks.delete(q.id);
        DOM.bookmarkBtn.classList.remove('active');
      } else {
        state.bookmarks.add(q.id);
        DOM.bookmarkBtn.classList.add('active');
      }
      playTone('click');
      saveStorage();
      updateStats();
      renderPalette();
    });

    // Shuffle Button
    DOM.shuffleBtn.addEventListener('click', () => {
      playTone('click');
      for (let i = state.filteredQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.filteredQuestions[i], state.filteredQuestions[j]] = [state.filteredQuestions[j], state.filteredQuestions[i]];
      }
      state.currentIndex = 0;
      renderCurrentQuestion();
      renderPalette();
    });

    // Restart Triggers
    DOM.restartTopBtn.addEventListener('click', () => promptRestart('current_section'));
    DOM.restartSectionBtn.addEventListener('click', () => promptRestart('current_section'));
    DOM.restartAllBtn.addEventListener('click', () => promptRestart('all'));

    DOM.cancelRestartBtn.addEventListener('click', () => {
      DOM.restartModal.classList.add('hidden');
    });

    DOM.confirmRestartBtn.addEventListener('click', executeRestart);

    // Review Mistakes Button on Completion
    DOM.reviewMistakesBtn.addEventListener('click', () => {
      DOM.modePills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-mode') === 'mistakes');
      });
      state.filterMode = 'mistakes';
      state.currentIndex = 0;
      applyFilters();
    });

    // Continue Next Category Button
    DOM.continueNextCatBtn.addEventListener('click', () => {
      const cats = ['CAT 1', 'CAT 2', 'CAT 3'];
      const nextIdx = (cats.indexOf(state.currentCategory) + 1) % cats.length;
      const nextCat = cats[nextIdx];

      DOM.sectionPills.forEach(p => {
        const isMatch = p.getAttribute('data-cat') === nextCat;
        p.classList.toggle('active', isMatch);
        p.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      state.currentCategory = nextCat;
      state.currentTopic = 'ALL';
      state.filterMode = 'all';
      state.currentIndex = 0;
      DOM.modePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-mode') === 'all'));
      updateTopicsDropdown();
      applyFilters();
    });

    // Theme Toggle
    DOM.themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
      saveStorage();
      playTone('click');
    });

    // Sound Toggle
    DOM.soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      updateSoundUI();
      saveStorage();
      if (state.soundEnabled) playTone('click');
    });

    // Matrix Drawer Toggle (Mobile)
    DOM.gridToggleBtn.addEventListener('click', () => {
      DOM.matrixDrawer.classList.toggle('open');
      playTone('click');
    });

    DOM.closeDrawerBtn.addEventListener('click', () => {
      DOM.matrixDrawer.classList.remove('open');
    });

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in search input
      if (document.activeElement === DOM.searchInput) return;

      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key)) {
        handleSelectOption('A');
      } else if (['2', 'B'].includes(key)) {
        handleSelectOption('B');
      } else if (['3', 'C'].includes(key)) {
        handleSelectOption('C');
      } else if (['4', 'D'].includes(key)) {
        handleSelectOption('D');
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (state.currentIndex < state.filteredQuestions.length - 1) {
          state.currentIndex++;
          renderCurrentQuestion();
        }
      } else if (e.key === 'ArrowLeft') {
        if (state.currentIndex > 0) {
          state.currentIndex--;
          renderCurrentQuestion();
        }
      }
    });
  }

  // Initialization
  function init() {
    if (window.QUIZ_QUESTIONS && Array.isArray(window.QUIZ_QUESTIONS)) {
      state.allQuestions = window.QUIZ_QUESTIONS;
    } else {
      console.error('Quiz questions data not found!');
      DOM.qText.textContent = 'Error: questions.js failed to load. Please verify the questions file is present.';
      return;
    }

    loadStorage();
    setupEventListeners();
    updateTopicsDropdown();
    applyFilters();
    console.log(`Quiz Platform Initialized with ${state.allQuestions.length} verified questions.`);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

