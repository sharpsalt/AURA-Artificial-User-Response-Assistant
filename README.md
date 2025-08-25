### AURA-Arificial User Response Assistant
> **J**ust **A** **R**ather **V**ery **I**ntelligent **S**ystem

An advanced AI-powered virtual assistant with voice recognition, learning capabilities, and system automation features. Inspired by Tony Stark's JARVIS from Iron Man.

## Features

###  Core Capabilities
- **Voice Activation**: Wake word detection ("JARVIS") with continuous listening
- **Natural Language Processing**: Understands complex commands and intents
- **Learning System**: Remembers and improves from your command patterns
- **Cross-Platform Support**: Works on Linux, macOS, and Windows
- **Safety First**: Confirmation prompts for potentially dangerous operations

###  AI Integration
- **Groq LLM Integration**: Fallback to advanced language models for complex queries
- **Intent Recognition**: Advanced pattern matching and command understanding
- **Contextual Responses**: Personalized suggestions based on usage patterns
- **Command Aliases**: Learns variations of your commands over time

###  System Operations
- **File Management**: Create folders, files, and navigate the filesystem
- **Application Control**: Launch browsers, terminals, cameras, and more
- **Screenshot Capture**: Multiple screenshot tools with automatic fallbacks
- **System Monitoring**: Check system status, uptime, and resources

###  Web Automation
- **Gmail Integration**: Compose and draft emails automatically
- **ChatGPT Automation**: Send prompts to ChatGPT directly
- **YouTube Search**: Search and open YouTube content
- **Google Search**: Perform web searches automatically
- **GitHub Navigation**: Open repositories and navigate GitHub

###  Information Services
- **News Updates**: Fetch latest headlines from multiple sources
- **Wikipedia Search**: Quick information lookup with voice feedback
- **Weather Information**: Get current weather conditions
- **Real-time Data**: Access to current information via web search

##  Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome/Edge recommended for speech recognition)
- Microphone access for voice commands

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sharpsalt/AURA-Artificial-User-Response-Assistant-.git
cd jarvis-assistant
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` file and add your API keys:
```env
PORT=8080
GROQ_API_KEY=your_groq_api_key_here
NEWS_API=your_news_api_key_here
```

4. **Setup directories**
```bash
npm run setup
```

5. **Start the server**
```bash
npm start
# or for development
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:8080`

##  Usage

### Voice Commands
1. **Activation**: Say "JARVIS" to activate voice recognition
2. **Commands**: Speak your command clearly
3. **Confirmation**: Respond with "yes" or "no" for dangerous operations

### Example Commands

#### File Operations
- "Create a folder named Documents"
- "Make a file called notes.txt"
- "Open file manager"

#### Application Control
- "Open Firefox"
- "Start terminal"
- "Launch camera"
- "Take a screenshot"

#### Information Requests
- "Get the latest news"
- "Search for artificial intelligence on Wikipedia"
- "What's the system status?"

#### Web Automation
- "Open Gmail and compose email"
- "Search YouTube for machine learning"
- "Open ChatGPT"

#### System Operations
- "Shutdown computer" (requires confirmation)
- "Update system" (requires confirmation)
- "Restart computer" (requires confirmation)

### Quick Commands
Use the quick command buttons on the interface for common tasks:
- **Help**: Show available commands
- **News**: Get latest headlines  
- **System Info**: Display system status
- **Screenshot**: Capture screen

### Keyboard Shortcuts
- `Ctrl + Space`: Force activate voice recognition
- `Escape`: Stop voice recognition

##  Learning System

JARVIS learns from your interactions and improves over time:

### Adaptive Features
- **Command Patterns**: Remembers successful command structures
- **User Preferences**: Tracks your preferred applications and tools
- **Context Awareness**: Understands time-based usage patterns
- **Similarity Matching**: Finds related commands when exact matches fail

### Knowledge Persistence
- Commands are stored in `learning.json`
- Success rates tracked for continuous improvement
- Command aliases automatically generated
- Usage statistics and preferences saved

### Personalization
- **Time-based Suggestions**: Different suggestions for morning/afternoon/evening
- **Frequently Used Commands**: Quick access to your most common tasks
- **Application Preferences**: Remembers your preferred tools (browser, terminal, etc.)

##  Configuration

### Environment Variables
```env
PORT=8080                    # Server port
GROQ_API_KEY=your_key       # Groq API for LLM fallback
NEWS_API=your_key           # NewsAPI for headlines
```

### API Keys Setup

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Create an account and generate an API key
3. Add to your `.env` file

#### News API Key
1. Visit [NewsAPI](https://newsapi.org/)
2. Register for a free account
3. Get your API key and add to `.env`

### System Tools
JARVIS automatically detects available system tools:
- **Screenshots**: gnome-screenshot, scrot, import, spectacle
- **Browsers**: firefox, chrome, chromium, edge
- **Terminals**: gnome-terminal, xterm, konsole, terminator
- **Cameras**: cheese, guvcview, kamoso

## 🛡️ Security Features

### Safe Command Execution
- **Confirmation Required**: Dangerous operations require user confirmation
- **Command Validation**: Input sanitization and validation
- **Restricted Operations**: Limited access to critical system functions
- **Fallback Safety**: Multiple confirmation levels for risky commands

### Privacy Protection
- **Local Processing**: Voice recognition happens in your browser
- **No Data Logging**: Commands are not sent to external services unnecessarily
- **Secure Storage**: Learning data stored locally
- **Optional Cloud**: API calls only when needed

## 📊 API Endpoints

### Core Endpoints
- `POST /jarvis/virtualAssistant` - Process voice commands
- `GET /jarvis/greeting` - Get initial greeting and capabilities
- `GET /jarvis/stats` - View learning statistics
- `GET /jarvis/health` - Check system health

### Response Format
```json
{
  "message": "Response message",
  "confidence": 0.95,
  "requiresConfirmation": false,
  "systemInfo": {...},
  "capabilities": [...]
}
```

## 🔍 Troubleshooting

### Common Issues

#### Voice Recognition Not Working
- Ensure microphone permissions are granted
- Use Chrome or Edge browser
- Check microphone settings in browser
- Restart the application

#### Commands Not Executing
- Check server logs for errors
- Verify system tools are installed
- Ensure proper permissions for system operations
- Check API keys in environment variables

#### Browser Automation Failing
- Install Chromium/Chrome for Puppeteer
- Check internet connection
- Verify website accessibility
- Review console logs for errors

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=jarvis:* npm start
```

### Log Files
Check application logs in:
- Console output for real-time debugging
- `learning.json` for command patterns
- Browser dev tools for frontend issues

##  Advanced Features

### Custom Commands
Add custom command patterns in `learningService.js`:
```javascript
{ 
  pattern: /your custom pattern/i, 
  action: 'custom_action', 
  target: 'custom_target' 
}
```

### Plugin System
Extend functionality by adding services:
1. Create service file in `services/`
2. Import in `assistantController.js`
3. Add command patterns to learning system

### Integration APIs
Connect with external services:
- **Smart Home**: Control IoT devices
- **Calendar**: Schedule management
- **Music**: Spotify/Apple Music control
- **Social Media**: Post updates

##  Performance

### System Requirements
- **RAM**: Minimum 4GB, recommended 8GB
- **CPU**: Any modern processor
- **Storage**: 1GB free space
- **Network**: Internet connection for web features

### Optimization
- Learning data is automatically cleaned
- Browser sessions are managed efficiently
- Memory usage optimized for long-running sessions
- Command caching for faster responses


### Code Style
- Use ESLint configuration
- Follow existing code patterns
- Add comments for complex logic
- Write tests for new features


##  Acknowledgments

- Inspired by Marvel's JARVIS AI system
- Built with modern web technologies
- Community contributions and feedback
- Open source libraries and tools

##  Support
- **Email**: bt23cse219@iiitn.ac.in

---

*"Sometimes you gotta run before you can walk." - Tony Stark*
