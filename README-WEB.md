# 🖋️ Freewrite for Web

A beautiful, distraction-free writing app that runs in your browser. Perfect for freewriting sessions to unlock creativity and break through writer's block.

🌐 **[Live Demo](https://yourusername.github.io/freewrite-windows)** 

## ✨ Features

### 🎨 **Beautiful Themes**
- **Light Theme** - Clean, bright interface for daytime writing
- **Dark Theme** - Easy on the eyes for late-night sessions  
- **Vintage Theme** - Gorgeous chocolatey brown typewriter theme with Hemingway vibes

### 🔤 **Premium Typography**
- **Geist** - Modern, clean sans-serif font
- **JetBrains Mono** - Developer-friendly monospace font
- **Georgia** - Beautiful serif font perfect for creative writing

### ⏱️ **15-Minute Timer**
- Press `Ctrl + Alt + F` to start a focused freewriting session
- No backspaces allowed during timer - pure stream of consciousness
- Timer pulses to keep you in flow state

### ✍️ **Writing Features**
- **Typewriter Scrolling** - Current line stays centered as you type
- **Entry History** - All your writings automatically saved
- **Markdown Support** - Basic formatting with `Ctrl+B`, `Ctrl+I`, `Ctrl+U`
- **Fullscreen Mode** - Complete immersion
- **Auto-save** - Never lose your thoughts

### 📱 **Responsive Design**
- Works perfectly on desktop, tablet, and mobile
- Touch-friendly interface for mobile writing

## 🚀 **Quick Start - Deploy to GitHub Pages**

### **Step 1: Fork or Create Repository**

```bash
# Option A: Create new repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/freewrite-web.git
git push -u origin main

# Option B: Or just upload these files to a new GitHub repository
```

### **Step 2: Enable GitHub Pages**

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### **Step 3: Access Your App**

Your app will be available at: `https://yourusername.github.io/repository-name`

It may take a few minutes for the first deployment.

## 🎯 **How to Use**

### **What is Freewriting?**
Freewriting is a powerful writing technique where you write continuously for a set period without stopping to edit, correct, or think. It's pure stream of consciousness that helps you:

- Break through writer's block
- Access deeper thoughts and ideas
- Improve writing fluency
- Process emotions and experiences
- Generate creative content

### **The Rules**
- ❌ **No backspaces** during timed sessions
- ❌ **No editing** while writing  
- ✅ **Keep writing** even if you're stuck
- ✅ **Follow your thoughts** wherever they lead
- ✅ **No judgment** - just let it flow

### **Getting Started**
1. **Choose your vibe** - Pick your theme and font
2. **Start the timer** - `Ctrl + Alt + F` or click the timer
3. **Write freely** - Let your thoughts pour out
4. **Stay in flow** - Don't stop until the timer ends

## ⌨️ **Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| `Ctrl + Alt + F` | Start/stop 15-minute timer |
| `Ctrl + B` | **Bold** text |
| `Ctrl + I` | *Italic* text |
| `Ctrl + U` | <u>Underline</u> text |
| `F11` | Toggle fullscreen |

## 🔧 **Files Structure**

```
freewrite-web/
├── index.html          # Main HTML file
├── web-styles.css      # All styling and themes
├── web-app.js          # Complete app functionality
└── README-WEB.md       # This file
```

## 🎨 **Customization**

### **Adding New Themes**
Edit `web-styles.css` and add a new theme:

```css
[data-theme="mytheme"] {
  --bg-color: #your-bg;
  --text-color: #your-text;
  /* ... other variables */
}
```

### **Adding New Fonts**
1. Add font import to `index.html`
2. Add font definition to `fonts` object in `web-app.js`
3. Add font button to `index.html`

## 💾 **Data Storage**

- All entries saved to browser's localStorage
- Works offline after first load
- Data persists between sessions
- Export feature coming soon!

## 🌐 **Browser Support**

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🙏 **Credits**

- **Original Concept**: [Farza](https://github.com/farzaa/freewrite) - Thank you for the brilliant idea!
- **Enhanced by**: Various contributors
- **Web Version**: Adapted for universal browser access
- **Fonts**: Geist by Vercel, JetBrains Mono by JetBrains, Georgia system font

## 📄 **License**

MIT License - Feel free to fork, modify, and share!

---

**Happy Writing! 🖋️✨**

*Start your freewriting journey and discover what your mind has been waiting to tell you.* 