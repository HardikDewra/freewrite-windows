const { ipcRenderer } = require('electron');

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
const chatButton = document.getElementById('chat-btn');
const historyButton = document.getElementById('history-btn');
const entriesList = document.getElementById('entries-list');
const fontSizePopup = document.getElementById('font-size-popup');
const sidebar = document.getElementById('sidebar');
const closeSidebarButton = document.getElementById('close-sidebar-btn');

// Create audio object for button click sound
const buttonSound = new Audio('https://pomofocus.io/audios/general/button.wav');

// State variables
let selectedFont = 'georgia';
let fontSize = 20;
let timeRemaining = 900; // 15 minutes in seconds
let timerIsRunning = false;
let timerInterval = null;
let entries = [];
let selectedEntry = null;
let showingChatMenu = false;
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

// AI Chat prompts
const aiChatPrompt = `below is my journal entry. wyt? talk through it with me like a friend. don't therpaize me and give me a whole breakdown, don't repeat my thoughts with headings. really take all of this, and tell me back stuff truly as if you're an old homie.

Keep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.

do not just go through every single thing i say, and say it back to me. you need to proccess everythikng is say, make connections i don't see it, and deliver it all back to me as a story that makes me feel what you think i wanna feel. thats what the best therapists do.

ideally, you're style/tone should sound like the user themselves. it's as if the user is hearing their own tone but it should still feel different, because you have different things to say and don't just repeat back they say.

else, start by saying, "hey, thanks for showing me this. my thoughts:"
    
my entry:`;

const claudePrompt = `Take a look at my journal entry below. I'd like you to analyze it and respond with deep insight that feels personal, not clinical.
Imagine you're not just a friend, but a mentor who truly gets both my tech background and my psychological patterns. I want you to uncover the deeper meaning and emotional undercurrents behind my scattered thoughts.
Keep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.
Use vivid metaphors and powerful imagery to help me see what I'm really building. Organize your thoughts with meaningful headings that create a narrative journey through my ideas.
Don't just validate my thoughts - reframe them in a way that shows me what I'm really seeking beneath the surface. Go beyond the product concepts to the emotional core of what I'm trying to solve.
Be willing to be profound and philosophical without sounding like you're giving therapy. I want someone who can see the patterns I can't see myself and articulate them in a way that feels like an epiphany.
Start with 'hey, thanks for showing me this. my thoughts:' and then use markdown headings to structure your response.

Here's my journal entry:`;

// Available fonts
const fonts = {
    geist: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    jetbrains: '"JetBrains Mono", "Consolas", "Monaco", "Courier New", monospace',
    georgia: 'Georgia, "Times New Roman", Times, serif'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    initializeEventListeners();
    initializeTheme();
    
    // Set random placeholder
    placeholder.textContent = placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
    
    // Apply initial font and size
    setFont('georgia'); // Set to Georgia as default
    setFontSize(20);
    
    // Hide placeholder since we have initial text
    updatePlaceholderVisibility();
    
    // Initialize markdown rendering
    setTimeout(() => {
        renderMarkdown();
    }, 100);
    
    // Get initial fullscreen state
    ipcRenderer.send('get-fullscreen-state');
    
    // Get system theme
    ipcRenderer.send('get-system-theme');
});

// Listen for fullscreen state response
ipcRenderer.on('fullscreen-state', (event, isFullScreen) => {
    if (isFullScreen) {
        document.body.classList.add('fullscreen');
        fullscreenButton.textContent = 'Exit Fullscreen';
    } else {
        document.body.classList.remove('fullscreen');
        fullscreenButton.textContent = 'Fullscreen';
    }
});

// Initialize event listeners
function initializeEventListeners() {
    // Editor events
    editor.addEventListener('input', () => {
        updatePlaceholderVisibility();
        saveCurrentEntry();
        handleAutoScroll();
        // No markdown formatting for now - just basic typing
    });
    
    // No more scroll sync needed!
    
    editor.addEventListener('focus', () => {
        updatePlaceholderVisibility();
    });
    
    editor.addEventListener('blur', () => {
        saveCurrentEntry(); // Save when editor loses focus
    });
    
    // Handle keyboard events for auto-scroll and shortcuts
    editor.addEventListener('keydown', (e) => {
        // Handle keyboard shortcuts
        if (e.ctrlKey && e.altKey && e.key === 'f') {
            e.preventDefault();
            toggleTimer();
            return;
        }
        
        // Handle markdown formatting shortcuts
        if (e.ctrlKey && !e.altKey) {
            switch(e.key) {
                case 'b':
                    e.preventDefault();
                    insertMarkdownFormat('**', '**', 'bold text');
                    return;
                case 'i':
                    e.preventDefault();
                    insertMarkdownFormat('*', '*', 'italic text');
                    return;
                case 'u':
                    e.preventDefault();
                    insertMarkdownFormat('<u>', '</u>', 'underlined text');
                    return;
            }
        }
        
        // Trigger typewriter scroll on navigation keys and typing
        const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
        if (navigationKeys.includes(e.key) || e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter') {
            setTimeout(() => {
                handleAutoScroll();
            }, 10);
        }
    });
    
    // Font size button
    fontSizeButton.addEventListener('click', (e) => {
        togglePopup(fontSizePopup);
    });
    
    // Font buttons
    geistFontButton.addEventListener('click', () => setFont('geist'));
    jetbrainsFontButton.addEventListener('click', () => setFont('jetbrains'));
    georgiaFontButton.addEventListener('click', () => setFont('georgia'));
    
    // Font size options
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', () => {
            const size = parseInt(option.getAttribute('data-size'));
            setFontSize(size);
            fontSizePopup.classList.remove('show');
        });
    });
    
    // Timer button
    timerButton.addEventListener('click', toggleTimer);
    
    // Fullscreen button
    fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // New entry button
    newEntryButton.addEventListener('click', createNewEntry);
    
    // History button
    historyButton.addEventListener('click', toggleSidebar);
    
    // Close sidebar button
    closeSidebarButton.addEventListener('click', toggleSidebar);
    
    // Chat button
    chatButton.addEventListener('click', () => {
        // Toggle chat menu popup
        toggleChatMenu();
    });
    
    // Click outside popups to close
    document.addEventListener('click', (e) => {
        if (!fontSizeButton.contains(e.target) && !fontSizePopup.contains(e.target)) {
            fontSizePopup.classList.remove('show');
        }
    });
    
    // Add global keyboard handlers
    document.addEventListener('keydown', (e) => {
        // Don't handle shortcuts when typing in editor, except specific ones
        if (document.activeElement === editor) {
            return; // Let editor handle its own shortcuts
        }
        
        if (e.key === 'Escape') {
            // Close any open popups first
            const chatPopup = document.querySelector('.chat-popup');
            if (chatPopup) {
                document.body.removeChild(chatPopup);
                return;
            }
            
            if (fontSizePopup.classList.contains('show')) {
                fontSizePopup.classList.remove('show');
                return;
            }
            
            if (!sidebar.classList.contains('hidden')) {
                sidebar.classList.add('hidden');
                return;
            }
            
            // Let the main process handle exiting fullscreen or closing the app
            ipcRenderer.send('handle-escape');
        }
    });
    
    // Theme button
    themeButton.addEventListener('click', toggleTheme);
    
    // Add window unload handler to save before closing
    window.addEventListener('beforeunload', () => {
        saveCurrentEntry();
    });
    
    // Save periodically (every 30 seconds)
    setInterval(saveCurrentEntry, 30000);
}

// Update placeholder visibility
function updatePlaceholderVisibility() {
    if (editor.textContent.trim() === '') {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';
    }
}

// Toggle popup display
function togglePopup(popup) {
    popup.classList.toggle('show');
}

// Set font
function setFont(fontType) {
    // Deselect previous font
    geistFontButton.style.fontWeight = 'normal';
    jetbrainsFontButton.style.fontWeight = 'normal';
    georgiaFontButton.style.fontWeight = 'normal';
    
    if (fontType === 'geist') {
        selectedFont = fonts.geist;
        geistFontButton.style.fontWeight = 'bold';
    } else if (fontType === 'jetbrains') {
        selectedFont = fonts.jetbrains;
        jetbrainsFontButton.style.fontWeight = 'bold';
    } else if (fontType === 'georgia') {
        selectedFont = fonts.georgia;
        georgiaFontButton.style.fontWeight = 'bold';
    }
    
    editor.style.fontFamily = selectedFont;
    placeholder.style.fontFamily = selectedFont;
}

// Set font size
function setFontSize(size) {
    fontSize = size;
    fontSizeButton.textContent = `${size}px`;
    editor.style.fontSize = `${size}px`;
    editor.style.lineHeight = '1.6';
    placeholder.style.fontSize = `${size}px`;
}

// Toggle timer
function toggleTimer() {
    // Play button sound
    buttonSound.play().catch(err => console.log('Error playing sound:', err));
    
    if (timerIsRunning) {
        // Stop timer
        clearInterval(timerInterval);
        timerIsRunning = false;
        document.body.classList.remove('timer-running');
        timerButton.textContent = formatTime(timeRemaining);
    } else {
        // Start timer
        timerIsRunning = true;
        document.body.classList.add('timer-running');
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            timerButton.textContent = formatTime(timeRemaining);
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerIsRunning = false;
                document.body.classList.remove('timer-running');
                document.body.classList.add('timer-complete');
                
                // Reset timer after 5 seconds
                setTimeout(() => {
                    timeRemaining = 900;
                    timerButton.textContent = '15:00';
                    document.body.classList.remove('timer-complete');
                }, 5000);
            }
        }, 1000);
    }
}

// Format time for display
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Toggle fullscreen
function toggleFullscreen() {
    ipcRenderer.send('toggle-fullscreen');
    
    document.body.classList.toggle('fullscreen');
    if (document.body.classList.contains('fullscreen')) {
        fullscreenButton.textContent = 'Exit Fullscreen';
    } else {
        fullscreenButton.textContent = 'Fullscreen';
    }
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('hidden');
}

// Load entries from main process
function loadEntries() {
    ipcRenderer.send('load-entries');
    
    ipcRenderer.on('entries-loaded', (event, data) => {
        entries = data.entries || [];
        renderEntries();
        
        // If there are entries, load the first one
        if (entries.length > 0) {
            loadEntry(entries[0]);
        } else {
            // Create a new entry if there are none
            createNewEntry();
        }
    });
}

// Render entries in the sidebar
function renderEntries() {
    entriesList.innerHTML = '';
    
    entries.forEach(entry => {
        const entryItem = document.createElement('div');
        entryItem.className = 'entry-item';
        if (selectedEntry && entry.id === selectedEntry.id) {
            entryItem.classList.add('selected');
        }
        
        entryItem.innerHTML = `
            <div class="entry-date">${entry.date}</div>
            <div class="entry-preview">${entry.previewText || 'Empty entry'}</div>
            <div class="entry-delete">×</div>
        `;
        
        entryItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('entry-delete')) {
                loadEntry(entry);
                sidebar.classList.add('hidden');
            }
        });
        
        // Delete button
        const deleteButton = entryItem.querySelector('.entry-delete');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Implement delete functionality
            if (confirm('Are you sure you want to delete this entry?')) {
                // Delete entry logic
                entries = entries.filter(e => e.id !== entry.id);
                renderEntries();
                
                if (selectedEntry && selectedEntry.id === entry.id) {
                    if (entries.length > 0) {
                        loadEntry(entries[0]);
                    } else {
                        createNewEntry();
                    }
                }
            }
        });
        
        entriesList.appendChild(entryItem);
    });
}

// Load an entry into the editor
function loadEntry(entry) {
    // Save current entry before loading new one
    if (selectedEntry && selectedEntry.id !== entry.id) {
        saveCurrentEntry();
    }
    
    selectedEntry = entry;
    
    // Load content
    if (entry.content) {
        editor.textContent = entry.content;
    } else {
        ipcRenderer.send('load-entry', { filename: entry.filename });
    }
    
    // Update UI
    updatePlaceholderVisibility();
    renderMarkdown();
    renderEntries();
}

// Receive loaded entry from main process
ipcRenderer.on('entry-loaded', (event, data) => {
    if (data.success) {
        editor.textContent = data.content;
        updatePlaceholderVisibility();
        renderMarkdown();
    }
});

// Create a new entry
function createNewEntry() {
    // Generate ID
    const id = generateUUID();
    
    // Generate filename with date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const dateString = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    const filename = `[${id}]-[${dateString}].md`;
    
    // Create entry object
    const entry = {
        id: id,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        filename: filename,
        previewText: '',
        content: '\n\n' // Start with two newlines
    };
    
    // Add to entries list
    entries.unshift(entry);
    
    // Load the new entry
    loadEntry(entry);
    
    // If this is the first entry, load the welcome message from default.md
    if (entries.length === 1) {
        // Request the welcome message from main process
        ipcRenderer.send('load-welcome-message');
            } else {
            // Clear editor
            editor.textContent = '\n\n';
        }
    
    updatePlaceholderVisibility();
    
    // Set focus to editor
    editor.focus();
}

// Receive welcome message from main process
ipcRenderer.on('welcome-message-loaded', (event, data) => {
    if (data.success) {
        editor.textContent = '\n\n' + data.content;
        updatePlaceholderVisibility();
        renderMarkdown();
        
        // Save the entry with welcome message
        saveCurrentEntry();
    }
});

// Save current entry
function saveCurrentEntry() {
    if (!selectedEntry) return;
    
    console.log('Saving entry:', selectedEntry.filename); // Debug log
    
    // Update preview text
    const content = editor.textContent || editor.innerText || '';
    const preview = content.replace(/\n/g, ' ').trim();
    const truncated = preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
    
    selectedEntry.previewText = truncated;
    selectedEntry.content = content; // Cache the content
    
    // Save to file
    ipcRenderer.send('save-entry', {
        content: content,
        filename: selectedEntry.filename
    });
    
    // Update UI
    renderEntries();
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Show custom alert
function showCustomAlert(message, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    
    alertBox.innerHTML = `
        <div class="custom-alert-message">${message}</div>
        <button class="custom-alert-button">OK</button>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);
    
    const okButton = alertBox.querySelector('.custom-alert-button');
    
    const closeAlert = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(alertBox);
        if (callback) callback();
    };
    
    okButton.addEventListener('click', closeAlert);
    okButton.focus();
    
    // Also close on Enter or Escape
    alertBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            closeAlert();
        }
    });
}

// Toggle chat menu
function toggleChatMenu() {
    console.log('Chat menu toggled');
    
    // Check if popup already exists and remove it if it does
    const existingPopup = document.querySelector('.chat-popup');
    if (existingPopup) {
        console.log('Removing existing popup');
        document.body.removeChild(existingPopup);
        console.log('Setting focus to editor after removing popup');
        editor.focus();
        return; // Exit function to toggle off
    }
    
    // Check if entry is suitable for chat
    const entryText = editor.value.trim();
    
    if (entryText.startsWith("Welcome to Freewrite for Windows!") || 
        entryText.startsWith("welcome to freewrite for windows!")) {
        showCustomAlert("Ready to start your freewriting journey? Clear this text and begin writing your thoughts.", () => {
            console.log('Setting focus after welcome message');
            editor.focus();
            // Force cursor to end
            const len = editor.value.length;
            editor.setSelectionRange(len, len);
        });
        return;
    }
    
    if (entryText.length < 350) {
        showCustomAlert("Please free write for at minimum 5 minutes first. Then click this. Trust.", () => {
            console.log('Setting focus after length alert');
            editor.focus();
            // Force cursor to end
            const len = editor.value.length;
            editor.setSelectionRange(len, len);
        });
        return;
    }
    
    // Create and show popup
    const popup = document.createElement('div');
    popup.className = 'chat-popup';
    popup.setAttribute('tabindex', '-1'); // Prevent popup from being focusable
    popup.innerHTML = `
        <div class="chat-popup-content">
            <button id="chatgpt-btn" class="chat-option" tabindex="0">ChatGPT</button>
            <div class="chat-divider"></div>
            <button id="claude-btn" class="chat-option" tabindex="0">Claude</button>
        </div>
    `;
    
    // Position popup above the chat button
    const rect = chatButton.getBoundingClientRect();
    popup.style.position = 'absolute';
    
    // Add to DOM first so we can measure it
    document.body.appendChild(popup);
    console.log('Popup added to DOM');
    
    // Always position popup above the button
    popup.style.top = `${rect.top - popup.offsetHeight - 10}px`;
    popup.style.left = `${rect.left}px`;
    
    // Add event listeners
    document.getElementById('chatgpt-btn').addEventListener('click', (e) => {
        console.log('ChatGPT button clicked');
        e.preventDefault();
        e.stopPropagation();
        document.body.removeChild(popup);
        editor.focus();
        openChatGPT();
    });
    
    document.getElementById('claude-btn').addEventListener('click', (e) => {
        console.log('Claude button clicked');
        e.preventDefault();
        e.stopPropagation();
        document.body.removeChild(popup);
        editor.focus();
        openClaude();
    });
    
    // Close when clicking outside
    const closePopup = (e) => {
        if (!popup.contains(e.target) && e.target !== chatButton) {
            console.log('Closing popup from outside click');
            e.preventDefault();
            e.stopPropagation();
            document.body.removeChild(popup);
            document.removeEventListener('click', closePopup);
            
            requestAnimationFrame(() => {
                console.log('Attempting to restore focus after popup close');
                editor.focus();
                // Force the cursor to the end
                const len = editor.value.length;
                editor.setSelectionRange(len, len);
            });
        }
    };
    
    // Delay adding the event listener to prevent immediate closure
    setTimeout(() => {
        document.addEventListener('click', closePopup);
    }, 100);
    
    // Ensure editor maintains focus
    console.log('Setting initial focus to editor');
    editor.focus();
}

// Open ChatGPT with the journal entry
function openChatGPT() {
    const trimmedText = editor.value.trim();
    const fullText = aiChatPrompt + "\n\n" + trimmedText;
    
    // Use Electron's shell to open the URL
    ipcRenderer.send('open-external-url', {
        url: 'https://chat.openai.com/?m=' + encodeURIComponent(fullText)
    });
}

// Open Claude with the journal entry
function openClaude() {
    const trimmedText = editor.value.trim();
    const fullText = claudePrompt + "\n\n" + trimmedText;
    
    // Use Electron's shell to open the URL
    ipcRenderer.send('open-external-url', {
        url: 'https://claude.ai/new?q=' + encodeURIComponent(fullText)
    });
}

// Theme functions
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }
    // If no saved theme, wait for system theme detection
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme;
    
    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else if (currentTheme === 'dark') {
        newTheme = 'vintage';
    } else {
        newTheme = 'light';
    }
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    if (theme === 'dark') {
        themeButton.textContent = 'Vintage Mode';
    } else if (theme === 'vintage') {
        themeButton.textContent = 'Light Mode';
    } else {
        themeButton.textContent = 'Dark Mode';
    }
}

// Listen for system theme detection
ipcRenderer.on('system-theme-detected', (event, data) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        // No saved preference, use system theme
        const systemTheme = data.shouldUseDarkColors ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        updateThemeButton(systemTheme);
    }
});

// Listen for system theme changes
ipcRenderer.on('system-theme-changed', (event, data) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        // No saved preference, follow system theme
        const systemTheme = data.shouldUseDarkColors ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        updateThemeButton(systemTheme);
    }
});

// Typewriter scroll functionality for contentEditable
function handleAutoScroll() {
    if (document.activeElement !== editor) {
        return;
    }
    
    const editorHeight = editor.clientHeight;
    const targetPosition = editorHeight * 0.4;
    
    // Get current cursor position using selection API
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    
    // Calculate cursor position relative to editor
    const cursorTop = rect.top - editorRect.top + editor.scrollTop;
    const currentCursorPosition = cursorTop - editor.scrollTop;
    
         // If cursor is getting too far from target position, scroll
     if (Math.abs(currentCursorPosition - targetPosition) > 20) {
         const idealScrollTop = cursorTop - targetPosition;
         editor.scrollTop = Math.max(0, idealScrollTop);
     }
}

// Markdown formatting function for contentEditable
function insertMarkdownFormat(startTag, endTag, placeholderText) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    let replacement;
    if (selectedText) {
        replacement = startTag + selectedText + endTag;
    } else {
        replacement = startTag + placeholderText + endTag;
    }
    
    // Delete current selection and insert new text
    range.deleteContents();
    const textNode = document.createTextNode(replacement);
    range.insertNode(textNode);
    
    // Set cursor position
    const newRange = document.createRange();
    if (selectedText) {
        newRange.setStart(textNode, replacement.length);
        newRange.setEnd(textNode, replacement.length);
    } else {
        newRange.setStart(textNode, startTag.length);
        newRange.setEnd(textNode, startTag.length + placeholderText.length);
    }
    
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    editor.focus();
    saveCurrentEntry();
    renderMarkdown();
    updatePlaceholderVisibility();
}

// Simple function - no markdown formatting for now, just basic editor
function renderMarkdown() {
    // Do nothing - just let the contentEditable work normally
    // We'll add markdown back later in a better way
}

// No need for scroll sync anymore - only one element!

// Also add focus tracking to the editor globally
editor.addEventListener('focus', () => {
    console.log('Editor focused (global)');
});

editor.addEventListener('blur', () => {
    console.log('Editor lost focus (global)');
    console.log('Active element:', document.activeElement);
}); 