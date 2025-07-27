// Web version of Freewrite app - Browser compatible

// DOM Elements
const editor = document.getElementById('editor');
const placeholder = document.getElementById('placeholder');
const geistFontButton = document.getElementById('geist-font-btn');
const jetbrainsFontButton = document.getElementById('jetbrains-font-btn');
const georgiaFontButton = document.getElementById('georgia-font-btn');
const fontSizeButton = document.getElementById('font-size-btn');
const timerButton = document.getElementById('timer-btn');
const themeButton = document.getElementById('theme-btn');
const fullscreenButton = document.getElementById('fullscreen-btn');
const newEntryButton = document.getElementById('new-entry-btn');
const historyButton = document.getElementById('history-btn');
const entriesList = document.getElementById('entries-list');
const fontSizePopup = document.getElementById('font-size-popup');
const sidebar = document.getElementById('sidebar');
const closeSidebarButton = document.getElementById('close-sidebar-btn');

// State variables
let selectedFont = 'georgia';
let fontSize = 20;
let timeRemaining = 900; // 15 minutes in seconds
let timerIsRunning = false;
let timerInterval = null;
let entries = [];
let selectedEntry = null;
let currentTheme = 'light';
let isFullscreen = false;

let placeholderOptions = [
    "Begin writing",
    "Pick a thought and go",
    "Start typing",
    "What's on your mind",
    "Just start",
    "Type your first thought",
    "Start with one sentence",
    "Just say it"
];

// Available fonts
const fonts = {
    geist: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    jetbrains: '"JetBrains Mono", "Consolas", "Monaco", "Courier New", monospace',
    georgia: 'Georgia, "Times New Roman", Times, serif'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    initializeEventListeners();
    initializeTheme();
    
    // Set random placeholder
    placeholder.textContent = placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
    
    // Apply initial font and size
    setFont('georgia');
    setFontSize(20);
    
    // Update placeholder visibility
    updatePlaceholderVisibility();
    
    // Detect system theme
    detectSystemTheme();
});

function initializeEventListeners() {
    // Font buttons
    geistFontButton.addEventListener('click', () => setFont('geist'));
    jetbrainsFontButton.addEventListener('click', () => setFont('jetbrains'));
    georgiaFontButton.addEventListener('click', () => setFont('georgia'));
    
    // Font size
    fontSizeButton.addEventListener('click', toggleFontSizePopup);
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', (e) => {
            setFontSize(parseInt(e.target.dataset.size));
            hideFontSizePopup();
        });
    });
    
    // Timer
    timerButton.addEventListener('click', toggleTimer);
    
    // Theme
    themeButton.addEventListener('click', cycleTheme);
    
    // Fullscreen
    fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // New entry
    newEntryButton.addEventListener('click', createNewEntry);
    
    // History
    historyButton.addEventListener('click', toggleSidebar);
    
    // Sidebar
    closeSidebarButton.addEventListener('click', closeSidebar);
    
    // Editor events
    editor.addEventListener('input', () => {
        updatePlaceholderVisibility();
        saveCurrentEntry();
        renderMarkdown();
        
        // Debounced typewriter scroll for smooth experience
        clearTimeout(window.typewriterTimeout);
        window.typewriterTimeout = setTimeout(typewriterScroll, 100);
    });
    
    editor.addEventListener('keydown', handleKeydown);
    
    // Close popups when clicking outside
    document.addEventListener('click', (e) => {
        if (!fontSizeButton.contains(e.target) && !fontSizePopup.contains(e.target)) {
            hideFontSizePopup();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.code === 'KeyF') {
            e.preventDefault();
            toggleTimer();
        }
    });
    
    // Prevent closing during timer
    window.addEventListener('beforeunload', (e) => {
        if (timerIsRunning) {
            e.preventDefault();
            e.returnValue = 'Timer is running. Are you sure you want to leave?';
        }
    });
}

function handleKeydown(e) {
    // Prevent backspace during timer
    if (timerIsRunning && e.key === 'Backspace') {
        e.preventDefault();
        return;
    }
    
    // Markdown shortcuts
    if (e.ctrlKey) {
        switch (e.key) {
            case 'b':
                e.preventDefault();
                wrapSelection('**');
                break;
            case 'i':
                e.preventDefault();
                wrapSelection('*');
                break;
            case 'u':
                e.preventDefault();
                wrapSelection('<u>', '</u>');
                break;
        }
    }
    
    // Trigger typewriter scroll on navigation and enter
    if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setTimeout(typewriterScroll, 10);
    }
}

function wrapSelection(startTag, endTag = startTag) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        range.deleteContents();
        range.insertNode(document.createTextNode(startTag + selectedText + endTag));
    }
}

function setFont(fontName) {
    selectedFont = fontName;
    editor.style.fontFamily = fonts[fontName];
    
    // Update button states
    document.querySelectorAll('[id$="-font-btn"]').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${fontName}-font-btn`).classList.add('active');
    
    // Update placeholder font for vintage theme
    if (currentTheme === 'vintage') {
        placeholder.style.fontFamily = fonts[fontName];
    }
}

function setFontSize(size) {
    fontSize = size;
    editor.style.fontSize = `${size}px`;
    placeholder.style.fontSize = `${size}px`;
    fontSizeButton.textContent = `${size}px`;
    
    // Update size option states
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.toggle('active', parseInt(option.dataset.size) === size);
    });
}

function toggleFontSizePopup() {
    fontSizePopup.classList.toggle('visible');
}

function hideFontSizePopup() {
    fontSizePopup.classList.remove('visible');
}

function toggleTimer() {
    if (timerIsRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    timerIsRunning = true;
    timeRemaining = 900; // 15 minutes
    timerButton.classList.add('timer-active');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            stopTimer();
            showTimerComplete();
        }
    }, 1000);
    
    updateTimerDisplay();
}

function stopTimer() {
    timerIsRunning = false;
    clearInterval(timerInterval);
    timerButton.classList.remove('timer-active');
    timerButton.textContent = '15:00';
    timeRemaining = 900;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerButton.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showTimerComplete() {
    alert('🎉 15-minute freewriting session complete! Great work!');
}

function cycleTheme() {
    const themes = ['light', 'dark', 'vintage'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
}

function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    
    const themeNames = {
        light: 'Light',
        dark: 'Dark',
        vintage: 'Vintage'
    };
    
    themeButton.textContent = themeNames[theme];
    
    // Save theme preference
    localStorage.setItem('freewrite-theme', theme);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('freewrite-theme') || 'light';
    setTheme(savedTheme);
}

function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (!localStorage.getItem('freewrite-theme')) {
            setTheme('dark');
        }
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('freewrite-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen not supported or denied');
        });
    } else {
        document.exitFullscreen();
    }
}

function updateFullscreenButton() {
    fullscreenButton.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenButton);

function createNewEntry() {
    if (editor.textContent.trim()) {
        saveCurrentEntry();
    }
    
    editor.textContent = '';
    editor.scrollTop = 0; // Reset scroll position
    updatePlaceholderVisibility();
    editor.focus();
    selectedEntry = null;
    
    // Set new random placeholder
    placeholder.textContent = placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
}

function toggleSidebar() {
    sidebar.classList.toggle('visible');
    sidebar.classList.toggle('hidden');
    renderEntries();
}

function closeSidebar() {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('visible');
}

function saveCurrentEntry() {
    const content = editor.textContent.trim();
    if (!content) return;
    
    const now = new Date();
    const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
    const title = content.split('\n')[0].substring(0, 50) + (content.split('\n')[0].length > 50 ? '...' : '');
    
    if (selectedEntry) {
        // Update existing entry
        const entry = entries.find(e => e.id === selectedEntry);
        if (entry) {
            entry.content = content;
            entry.title = title;
            entry.preview = preview;
            entry.modifiedAt = now;
        }
    } else {
        // Create new entry
        const entry = {
            id: Date.now().toString(),
            title: title || 'Untitled',
            content: content,
            preview: preview,
            createdAt: now,
            modifiedAt: now
        };
        entries.unshift(entry);
        selectedEntry = entry.id;
    }
    
    saveEntries();
}

function loadEntries() {
    const saved = localStorage.getItem('freewrite-entries');
    if (saved) {
        entries = JSON.parse(saved).map(entry => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
            modifiedAt: new Date(entry.modifiedAt)
        }));
    }
}

function saveEntries() {
    localStorage.setItem('freewrite-entries', JSON.stringify(entries));
}

function renderEntries() {
    entriesList.innerHTML = '';
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--entry-preview-color);">No entries yet. Start writing!</div>';
        return;
    }
    
    entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-item';
        if (entry.id === selectedEntry) {
            entryElement.classList.add('selected');
        }
        
        entryElement.innerHTML = `
            <div class="entry-title">${entry.title}</div>
            <div class="entry-preview">${entry.preview}</div>
            <div class="entry-date">${formatDate(entry.modifiedAt)}</div>
        `;
        
        entryElement.addEventListener('click', () => loadEntry(entry.id));
        entriesList.appendChild(entryElement);
    });
}

function loadEntry(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
        editor.textContent = entry.content;
        editor.scrollTop = 0; // Reset scroll position
        selectedEntry = entryId;
        updatePlaceholderVisibility();
        closeSidebar();
        editor.focus();
        
        // Apply typewriter position after content loads
        setTimeout(typewriterScroll, 50);
    }
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return 'Today';
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function updatePlaceholderVisibility() {
    const hasContent = editor.textContent.trim().length > 0;
    placeholder.classList.toggle('hidden', hasContent);
}

function typewriterScroll() {
    // Get cursor position
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    try {
        const range = selection.getRangeAt(0);
        
        // Create a temporary element to measure cursor position
        const span = document.createElement('span');
        span.style.position = 'absolute';
        span.style.visibility = 'hidden';
        span.textContent = '|';
        
        // Insert at cursor position
        const clonedRange = range.cloneRange();
        clonedRange.insertNode(span);
        
        // Get the actual pixel position of the cursor
        const spanRect = span.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();
        
        // Calculate target position (40% from top of editor)
        const targetY = editorRect.top + (editorRect.height * 0.4);
        const currentY = spanRect.top;
        
        // Calculate how much to scroll
        const scrollOffset = currentY - targetY;
        
        // Scroll to keep cursor at target position
        editor.scrollTop += scrollOffset;
        
        // Clean up
        span.remove();
        
    } catch (e) {
        // If anything goes wrong, fall back to simple line-based calculation
        const lines = editor.textContent.split('\n');
        const currentLineNumber = Math.max(0, lines.length - 1);
        const lineHeight = fontSize * 1.8;
        const editorHeight = editor.getBoundingClientRect().height;
        const targetY = editorHeight * 0.4;
        
        // Scroll so current line is at 40% from top
        const currentLineY = currentLineNumber * lineHeight;
        editor.scrollTop = currentLineY - targetY;
    }
}

function renderMarkdown() {
    // Simple markdown rendering for bold, italic, headers
    const content = editor.innerHTML;
    
    // Skip if we're in the middle of editing
    if (document.activeElement === editor) return;
    
    let rendered = content
        // Bold **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic *text*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers # ## ###
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    if (rendered !== content) {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        editor.innerHTML = rendered;
        
        // Restore cursor position if possible
        if (range) {
            try {
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                // Ignore cursor restoration errors
            }
        }
    }
}

// Auto-save every 10 seconds
setInterval(() => {
    if (editor.textContent.trim()) {
        saveCurrentEntry();
    }
}, 10000); 