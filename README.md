# Adv. Robot 🤖

An advanced cybersecurity platform inspired by Mr. Robot, combining sophisticated AI security testing with real-time legal guidance. This application provides two powerful modules: **Jailbreak Protocol Testing** for LLM security assessment and **Cyber Law AI Assistant** for jurisdiction-specific legal guidance.

![Version](https://img.shields.io/badge/version-0.2.1-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)

## 🌟 Features

### 🔓 Jailbreak Protocol Testing
- **13-Level Progressive System**: Comprehensive testing framework with increasing difficulty
- **Multiple Protocol Types**: Nexus, Chimera APEX, and Advanced Robot protocols
- **Visual Progress Tracking**: Animated robot progression with real-time feedback
- **Secure Testing Environment**: Copy prompts to test in your own LLM environment
- **Progress Persistence**: Local storage saves your testing progress
- **Mobile-Optimized**: Responsive design for testing on any device

### ⚖️ Cyber Law AI Assistant (LexMachina)
- **Multi-Jurisdiction Support**: India, UAE, and United Kingdom legal frameworks
- **Real-Time Web Search**: Enhanced with Google Search integration
- **Intelligent Suggestions**: Context-aware prompt suggestions
- **Markdown Support**: Rich text formatting for legal documents
- **Source Attribution**: Automatic citation of web sources
- **Streaming Responses**: Real-time AI response generation

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Gemini API Key** (for Cyber Law Assistant)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adv-robot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   - Copy `.env.local.example` to `.env.local`
   - Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

### AI Integration
- **Google Gemini AI** - Advanced language model
- **@google/genai** - Official Gemini SDK
- **Streaming API** - Real-time response generation

### Styling & UX
- **Custom Hacker Theme** - Mr. Robot inspired design
- **Responsive Design** - Mobile-first approach
- **CSS Animations** - Smooth transitions and feedback
- **Custom Scrollbars** - Themed UI elements

## 📱 Usage Guide

### Jailbreak Protocol Testing

1. **Select a Level**: Start with Level 1 or continue from your saved progress
2. **Copy the Prompt**: Use the "COPY PROMPT" button to get the test prompt
3. **Test Externally**: Paste the prompt into your preferred LLM (ChatGPT, Claude, etc.)
4. **Report Success**: Check the box if the LLM was successfully jailbroken
5. **Progress**: Watch the robot animation and advance to the next level

**Security Note**: All testing is done externally - your API keys and data remain secure.

### Cyber Law AI Assistant

1. **Select Jurisdiction**: Choose between India, UAE, or UK legal frameworks
2. **Ask Questions**: Type legal queries related to cyber law, data protection, etc.
3. **Get Answers**: Receive detailed, jurisdiction-specific legal guidance
4. **Review Sources**: Check cited sources for additional research
5. **Continue Conversation**: Build on previous questions for deeper insights

**Legal Disclaimer**: Information provided is educational and not substitute for professional legal advice.

## 🎨 Design Philosophy

### Hacker Aesthetic
- **Dark Theme**: Easy on the eyes for extended use
- **Neon Accents**: Green, cyan, and red highlights
- **Monospace Fonts**: Terminal-inspired typography
- **Glitch Effects**: Subtle animations for feedback

### User Experience
- **Progressive Disclosure**: Information revealed as needed
- **Visual Feedback**: Clear status indicators and animations
- **Mobile-First**: Optimized for all screen sizes
- **Accessibility**: ARIA labels and keyboard navigation

## 🔧 Configuration

### Environment Variables
```env
# Required for Cyber Law Assistant
GEMINI_API_KEY=your_gemini_api_key

# Optional: Custom API endpoint
API_ENDPOINT=https://custom-endpoint.com
```

### Customization
- **Colors**: Modify `tailwind.config` in `index.html`
- **Fonts**: Update Google Fonts imports
- **Animations**: Adjust CSS keyframes in `index.html`
- **Prompts**: Edit constants in `constants.ts`

## 📂 Project Structure

```
adv-robot/
├── src/
│   ├── components/          # Reusable UI components
│   ├── features/
│   │   ├── jailbreak/      # Jailbreak testing module
│   │   └── cyberlaw/       # Legal assistant module
│   ├── services/           # API integrations
│   ├── types.ts            # TypeScript definitions
│   ├── constants.ts        # App configuration
│   └── App.tsx             # Main application
├── public/                 # Static assets
├── .env.local             # Environment variables
└── package.json           # Dependencies
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in dashboard

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add proper error handling
- Include accessibility features
- Test on multiple devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mr. Robot TV Series** - Design inspiration
- **Google Gemini** - AI capabilities
- **React Community** - Framework and ecosystem
- **Tailwind CSS** - Styling framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@advrobot.com

## 🔮 Roadmap

- [ ] Additional jailbreak protocols
- [ ] More legal jurisdictions
- [ ] Voice input/output
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] API for external integrations

---

**⚠️ Disclaimer**: This tool is for educational and research purposes. Users are responsible for ethical use and compliance with applicable laws and terms of service.

**🔒 Security**: No user data is stored on our servers. All AI interactions are processed through official APIs with proper security measures.

---

*Built with ❤️ by the UB Intelligence Team*