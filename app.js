// Focus Study App
class FocusApp {
  constructor() {
    this.embedUrl = '';
    this.isTheatre = true;
    this.showProgress = true;
    this.completed = 0;
    this.total = 10;
    this.timerMode = 'pomodoro';
    this.isRunning = false;
    this.phase = 'work';
    this.workMin = 25;
    this.breakMin = 5;
    this.timeLeft = 25 * 60;
    this.counterTime = 0;
    this.interval = null;
    
    this.render();
    this.attachEvents();
  }

  extractYouTubeUrl(url) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      const playlistId = urlObj.searchParams.get('list');
      
      if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`;
      } else if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : '';
      }
      return '';
    } catch {
      return '';
    }
  }

  formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  startTimer() {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(() => {
      if (this.timerMode === 'pomodoro') {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          if (this.phase === 'work') {
            this.phase = 'break';
            this.timeLeft = this.breakMin * 60;
          } else {
            this.phase = 'work';
            this.timeLeft = this.workMin * 60;
          }
        }
      } else {
        this.counterTime++;
      }
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  toggleTimer() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
    this.updateTimerDisplay();
  }

  resetTimer() {
    this.isRunning = false;
    this.stopTimer();
    if (this.timerMode === 'pomodoro') {
      this.phase = 'work';
      this.timeLeft = this.workMin * 60;
    } else {
      this.counterTime = 0;
    }
    this.updateTimerDisplay();
  }

  switchMode(mode) {
    this.isRunning = false;
    this.stopTimer();
    this.timerMode = mode;
    if (mode === 'pomodoro') {
      this.phase = 'work';
      this.timeLeft = this.workMin * 60;
    } else {
      this.counterTime = 0;
    }
    this.render();
  }

  updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const phaseLabel = document.getElementById('phase-label');
    const playBtn = document.getElementById('play-btn');
    
    if (display) {
      const time = this.timerMode === 'pomodoro' ? this.timeLeft : this.counterTime;
      display.textContent = this.formatTime(time);
    }
    
    if (phaseLabel && this.timerMode === 'pomodoro') {
      phaseLabel.textContent = this.phase === 'work' ? '🎯 Work' : '☕ Break';
    }
    
    if (playBtn) {
      playBtn.innerHTML = this.isRunning ? '⏸' : '▶';
    }
  }

  attachEvents() {
    const loadBtn = document.getElementById('load-btn');
    const urlInput = document.getElementById('url-input');
    const theatreBtn = document.getElementById('theatre-btn');
    const progressToggle = document.getElementById('progress-toggle');
    const showProgressBtn = document.getElementById('show-progress-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const counterBtn = document.getElementById('counter-btn');
    const playBtn = document.getElementById('play-btn');
    const resetBtn = document.getElementById('reset-btn');
    const completedInput = document.getElementById('completed-input');
    const totalInput = document.getElementById('total-input');
    const workInput = document.getElementById('work-input');
    const breakInput = document.getElementById('break-input');

    loadBtn?.addEventListener('click', () => {
      const url = urlInput?.value || '';
      this.embedUrl = this.extractYouTubeUrl(url);
      this.render();
    });

    urlInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.embedUrl = this.extractYouTubeUrl(urlInput.value);
        this.render();
      }
    });

    theatreBtn?.addEventListener('click', () => {
      this.isTheatre = !this.isTheatre;
      this.render();
    });

    progressToggle?.addEventListener('click', () => {
      this.showProgress = false;
      this.render();
    });

    showProgressBtn?.addEventListener('click', () => {
      this.showProgress = true;
      this.render();
    });

    pomodoroBtn?.addEventListener('click', () => this.switchMode('pomodoro'));
    counterBtn?.addEventListener('click', () => this.switchMode('counter'));
    playBtn?.addEventListener('click', () => this.toggleTimer());
    resetBtn?.addEventListener('click', () => this.resetTimer());

    completedInput?.addEventListener('input', () => {
      this.completed = Math.max(0, parseInt(completedInput.value) || 0);
      this.updateProgress();
    });

    totalInput?.addEventListener('input', () => {
      this.total = Math.max(1, parseInt(totalInput.value) || 1);
      this.updateProgress();
    });

    workInput?.addEventListener('input', () => {
      this.workMin = Math.max(1, parseInt(workInput.value) || 25);
      if (this.phase === 'work' && !this.isRunning) {
        this.timeLeft = this.workMin * 60;
        this.updateTimerDisplay();
      }
    });

    breakInput?.addEventListener('input', () => {
      this.breakMin = Math.max(1, parseInt(breakInput.value) || 5);
      if (this.phase === 'break' && !this.isRunning) {
        this.timeLeft = this.breakMin * 60;
        this.updateTimerDisplay();
      }
    });
  }

  updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const percentage = this.total > 0 ? (this.completed / this.total) * 100 : 0;
    
    if (progressBar) {
      progressBar.style.width = `${Math.min(percentage, 100)}%`;
    }
    if (progressText) {
      progressText.textContent = `${percentage.toFixed(0)}%`;
    }
  }

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    const percentage = this.total > 0 ? (this.completed / this.total) * 100 : 0;
    const time = this.timerMode === 'pomodoro' ? this.timeLeft : this.counterTime;

    app.innerHTML = `
      <!-- Header -->
      <header class="border-b border-border p-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <h1 class="text-2xl font-bold">Focus Study</h1>
          
          <div class="flex items-center gap-2 flex-1 max-w-2xl min-w-[300px]">
            <input
              id="url-input"
              type="text"
              placeholder="Paste YouTube video or playlist URL..."
              class="flex-1 h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button id="load-btn" class="h-10 px-4 rounded-md bg-primary text-background font-medium hover:opacity-90 transition-opacity">
              Load
            </button>
          </div>

          <button id="theatre-btn" class="h-10 w-10 rounded-md border border-border hover:bg-secondary transition-colors" title="Toggle Theatre Mode">
            ${this.isTheatre ? '⊟' : '⊡'}
          </button>
        </div>
      </header>

      <!-- Video Player -->
      <div class="w-full bg-black transition-all duration-300" style="height: ${this.isTheatre ? '70vh' : '50vh'}">
        ${this.embedUrl ? `
          <iframe
            src="${this.embedUrl}"
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        ` : `
          <div class="w-full h-full flex items-center justify-center text-muted">
            <p>Paste a YouTube URL above to start focusing</p>
          </div>
        `}
      </div>

      <!-- Timer Section -->
      <div class="border-b border-border p-4 bg-card">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <!-- Mode Selector -->
            <div class="flex gap-2">
              <button id="pomodoro-btn" class="h-9 px-3 rounded-md text-sm font-medium transition-colors ${this.timerMode === 'pomodoro' ? 'bg-primary text-background' : 'border border-border hover:bg-secondary'}">
                Pomodoro
              </button>
              <button id="counter-btn" class="h-9 px-3 rounded-md text-sm font-medium transition-colors ${this.timerMode === 'counter' ? 'bg-primary text-background' : 'border border-border hover:bg-secondary'}">
                Counter
              </button>
            </div>

            <!-- Timer Display -->
            <div class="flex items-center gap-4 flex-wrap">
              ${this.timerMode === 'pomodoro' ? `
                <span id="phase-label" class="text-sm text-muted">${this.phase === 'work' ? '🎯 Work' : '☕ Break'}</span>
                <div class="flex gap-2 items-center flex-wrap">
                  <input id="work-input" type="number" value="${this.workMin}" min="1" class="w-16 h-8 text-xs rounded border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary" ${this.isRunning ? 'disabled' : ''} />
                  <span class="text-xs text-muted">min work</span>
                  <input id="break-input" type="number" value="${this.breakMin}" min="1" class="w-16 h-8 text-xs rounded border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary" ${this.isRunning ? 'disabled' : ''} />
                  <span class="text-xs text-muted">min break</span>
                </div>
              ` : ''}
              
              <div id="timer-display" class="text-3xl font-mono font-bold">
                ${this.formatTime(time)}
              </div>

              <div class="flex gap-2">
                <button id="play-btn" class="h-10 w-10 rounded-md border border-border hover:bg-secondary transition-colors">
                  ${this.isRunning ? '⏸' : '▶'}
                </button>
                <button id="reset-btn" class="h-10 w-10 rounded-md border border-border hover:bg-secondary transition-colors">
                  ↻
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Section -->
      ${this.showProgress ? `
        <div class="border-b border-border p-4 bg-card">
          <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-semibold">Course Progress</h2>
              <button id="progress-toggle" class="h-10 w-10 rounded-md hover:bg-secondary transition-colors">
                ▲
              </button>
            </div>
            
            <div class="flex items-center gap-4 flex-wrap">
              <div class="flex gap-2 items-center">
                <input id="completed-input" type="number" value="${this.completed}" min="0" class="w-20 h-10 rounded border border-border bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                <span class="text-muted">/</span>
                <input id="total-input" type="number" value="${this.total}" min="1" class="w-20 h-10 rounded border border-border bg-background px-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                <span class="text-sm text-muted">videos completed</span>
              </div>
              
              <div class="flex-1 min-w-[200px]">
                <div class="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div id="progress-bar" class="bg-primary h-full transition-all duration-300" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
              </div>
              
              <span id="progress-text" class="text-sm font-medium">
                ${percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      ` : `
        <div class="border-b border-border p-2 bg-card">
          <div class="max-w-7xl mx-auto flex justify-center">
            <button id="show-progress-btn" class="h-9 px-3 rounded-md hover:bg-secondary transition-colors text-sm flex items-center gap-2">
              ▼ Show Progress
            </button>
          </div>
        </div>
      `}

      <!-- Info -->
      <div class="p-8">
        <div class="max-w-7xl mx-auto">
          <div class="rounded-lg border border-border bg-card p-6">
            <h3 class="text-lg font-semibold mb-3">How to Use</h3>
            <ul class="space-y-2 text-sm text-muted">
              <li>• Paste any YouTube video or playlist URL</li>
              <li>• Toggle theatre mode for adjustable video size</li>
              <li>• Choose Pomodoro (work/break cycles) or Counter timer</li>
              <li>• Track course progress with adjustable progress bar</li>
              <li>• Hide/show progress section with arrow icon</li>
              <li>• Stay focused and productive! 🎯</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }
}

// Initialize app
new FocusApp();