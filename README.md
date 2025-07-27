# 🖋️ Freewrite for Windows

Hi! This is **Freewrite** - a simple, open-source Windows app to [freewrite](https://writingprocess.mit.edu/process/step-1-generate-ideas/instructions/freewriting/).

> **Original App**: Created for macOS by [Farza](https://github.com/buildspace/freewrite)  
> **Windows Version**: Modified and enhanced by [Hardik Dewra](https://github.com/HardikDewra)

![img](https://i.imgur.com/2ucbtff.gif)

This Windows version includes exciting new features like **automatic theme detection**, a gorgeous **vintage typewriter theme**, and **enhanced typography options** for the perfect writing experience!

---

## ✨ **What's New in This Version**

### 🎨 **Enhanced Themes**
- **Automatic Windows Theme Detection** - Seamlessly switches between light/dark based on your system
- **Vintage Typewriter Theme** - Deep chocolatey brown theme with Hemingway vibes for that old-school writing experience
- **Three Beautiful Themes**: Light, Dark, and Vintage

### 🔤 **Premium Typography** 
- **Curated Font Selection**: Geist, JetBrains Mono, and Georgia
- **Perfect Font Sizes**: 16px, 20px, and 24px options
- **Georgia Default**: Beautiful serif font for enhanced readability

### ⌨️ **Enhanced Writing Experience**
- **Typewriter Scrolling** - Current line stays at 40% from top (no more neck strain!)
- **Distraction-Free Interface** - Hidden scrollbars and clean design
- **Markdown Shortcuts** - Quick formatting with Ctrl+B, Ctrl+I, Ctrl+U
- **Fullscreen by Default** - Immediate immersion

### 🚀 **Improved Performance**
- **Modern Electron Architecture** - Faster, more responsive
- **ContentEditable Editor** - Better text handling and formatting
- **Optimized Font Loading** - Google Fonts integration for crisp typography

---

## 🚀 **Quick Start**

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v14 or newer)
- npm (comes with Node.js)

### **Installation**

1. **Clone this repository**
   ```bash
   git clone https://github.com/HardikDewra/freewrite-windows.git
   cd freewrite-windows
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npm start
   ```

### **Building for Distribution**
```bash
npm run build
```
Find the executable in the `dist` folder.

---

## 🎯 **How to Use**

**Freewriting is beautifully simple:**

1. **Choose Your Vibe** 🎨
   - Pick your theme (Light/Dark/Vintage)
   - Select your font (Geist/JetBrains Mono/Georgia)
   - Choose your size (16px/20px/24px)

2. **Set Your Timer** ⏱️
   - Press `Ctrl + Alt + F` to start the 15-minute timer
   - Or click the timer button

3. **Write Freely** ✍️
   - No backspaces allowed
   - Don't stop writing
   - Let your thoughts flow
   - Stay in the zone with typewriter scrolling

4. **Finish Strong** 🎉
   - Timer fades back in when done
   - Your writing is automatically saved

---

## ⌨️ **Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| `Ctrl + Alt + F` | Start 15-minute timer |
| `Ctrl + B` | **Bold** text |
| `Ctrl + I` | *Italic* text |
| `Ctrl + U` | <u>Underline</u> text |
| `F11` | Toggle fullscreen |

---

## 🎨 **Themes**

### **🌅 Light Theme**
Clean, bright interface perfect for daytime writing.

### **🌙 Dark Theme**  
Easy on the eyes for late-night writing sessions.

### **📜 Vintage Theme**
Deep chocolatey brown with warm amber text - like writing on an old typewriter in a cozy study. Perfect for channeling your inner Hemingway!

---

## 💡 **Why Freewrite?**

Freewriting is a powerful writing strategy developed in 1973. It's pure **stream of consciousness** writing that helps you:

- **Break through writer's block**
- **Discover new ideas**
- **Improve writing fluency**
- **Access your subconscious thoughts**
- **Reduce writing anxiety**

### **The Rules** 📝
- ❌ **No backspaces** - Keep moving forward
- ❌ **No editing** - Grammar doesn't matter
- ✅ **Keep writing** - Even if you're stuck, write "I'm stuck"
- ✅ **Follow your thoughts** - Let your mind wander
- ✅ **No judgment** - Trust the process

---

## 🛠️ **Technical Features**

- **Electron Framework** - Cross-platform desktop app
- **Modern JavaScript** - ES6+ with async/await
- **CSS Custom Properties** - Dynamic theming system
- **IPC Communication** - Seamless main/renderer process communication
- **System Integration** - Native Windows theme detection
- **Google Fonts** - Premium typography loading

---

## 📄 **License**

MIT License - Feel free to fork, modify, and distribute!

---

## 🙏 **Credits**

- **Original Creator**: [Farza](https://github.com/buildspace/freewrite) - Thank you for the brilliant concept!
- **Windows Port & Enhancements**: [Hardik Dewra](https://github.com/HardikDewra)
- **Fonts**: Geist by Vercel, JetBrains Mono by JetBrains
- **Inspiration**: All the amazing writers who believe in the power of freewriting

---

**Happy Writing! 🖋️✨**

