
import searchWikipedia from "../services/wikipediaService.js";
import getNews from "../services/newsService.js";
import getResponse from "../services/llmService.js";
import say from "say";
import shell from "shelljs";
// For now, let's create a simple learning system inline until you create the learningService.js file
class SimpleLearningSystem {
    constructor() {
        this.knowledgeBase = new Map();
        this.commandHistory = [];
        this.availableTools = {};
        this.checkAvailableTools();
    }
    
    checkAvailableTools() {
        const tools = ['cheese', 'scrot', 'gnome-screenshot', 'import', 'xwd', 'firefox', 'google-chrome', 'chromium'];
        
        tools.forEach(tool => {
            shell.exec(`which ${tool}`, { silent: true }, (code) => {
                this.availableTools[tool] = (code === 0);
            });
        });
    }
    
    async processCommand(command) {
        // Simple pattern matching for now
        const intent = this.extractIntent(command);
        
        if (intent.action && intent.target) {
            const linuxCommand = this.generateLinuxCommand(intent);
            if (linuxCommand) {
                return {
                    found: true,
                    actions: [linuxCommand],
                    confidence: 0.8,
                    source: 'generated'
                };
            }
        }
        
        return { found: false, confidence: 0 };
    }
    
    extractIntent(command) {
        const cleanCommand = command.toLowerCase();
        let action = null;
        let target = null;
        let params = [];
        
        // Extract action
        if (cleanCommand.includes('open')) action = 'open';
        else if (cleanCommand.includes('create') || cleanCommand.includes('make')) action = 'create';
        else if (cleanCommand.includes('search')) action = 'search';
        else if (cleanCommand.includes('take') || cleanCommand.includes('click') || cleanCommand.includes('capture')) action = 'take';
        else if (cleanCommand.includes('start') || cleanCommand.includes('launch')) action = 'open';
        
        // Extract target
        if (cleanCommand.includes('folder')) target = 'folder';
        else if (cleanCommand.includes('file')) target = 'file';
        else if (cleanCommand.includes('terminal')) target = 'terminal';
        else if (cleanCommand.includes('camera')) target = 'camera';
        else if (cleanCommand.includes('firefox')) target = 'firefox';
        else if (cleanCommand.includes('screenshot') || cleanCommand.includes('picture') || cleanCommand.includes('photo')) target = 'picture';
        
        // Extract parameters
        const words = cleanCommand.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (['named', 'called', 'in', 'of'].includes(words[i]) && words[i + 1]) {
                params.push({ type: words[i], value: words[i + 1] });
            }
        }
        
        return { action, target, params };
    }
    
    generateLinuxCommand(intent) {
        const { action, target, params } = intent;
        
        if (action === 'open') {
            if (target === 'terminal') return 'gnome-terminal || xterm || konsole';
            if (target === 'camera') return 'cheese || guvcview || kamoso';
            if (target === 'firefox') return 'firefox || firefox-esr';
        }
        
        if (action === 'create') {
            if (target === 'folder') {
                const name = params.find(p => p.type === 'named' || p.type === 'called')?.value || 'new_folder';
                const location = params.find(p => p.type === 'in')?.value || '.';
                return `mkdir -p "${location}/${name}"`;
            }
            if (target === 'file') {
                const name = params.find(p => p.type === 'named' || p.type === 'called')?.value || 'new_file.txt';
                return `touch "${name}"`;
            }
        }
        
        if (action === 'take') {
            if (target === 'picture') {
                // Check if it's a selfie/camera picture vs screenshot
                const isSelfie = params.some(p => p.value === 'mine') || intent.originalCommand?.includes('camera');
                if (isSelfie) {
                    return 'cheese || guvcview || kamoso'; // Camera apps
                } else {
                    // Screenshot with fallbacks
                    return 'scrot ~/Pictures/screenshot_$(date +%Y%m%d_%H%M%S).png || import -window root ~/Pictures/screenshot_$(date +%Y%m%d_%H%M%S).png || gnome-screenshot -f ~/Pictures/screenshot_$(date +%Y%m%d_%H%M%S).png';
                }
            }
            if (target === 'camera') return 'cheese || guvcview || kamoso';
        }
        
        return null;
    }
    
    learnFromSuccess(command, actions) {
        this.knowledgeBase.set(command, { actions, timestamp: Date.now() });
        this.commandHistory.push({ command, actions, timestamp: Date.now() });
    }
    
    getStats() {
        return {
            totalCommands: this.knowledgeBase.size,
            totalHistory: this.commandHistory.length
        };
    }
}

// const learningSystem = new SimpleLearningSystem();

// Initialize learning system
const learningSystem = new SimpleLearningSystem();
let lastCommand = null;
let pendingExecution = null;

/**
 * Execute Linux commands safely
 */
async function executeLinuxCommand(command) {
    return new Promise((resolve) => {
        console.log(`Executing: ${command}`);
        shell.exec(command, { async: true }, (code, stdout, stderr) => {
            resolve({
                success: code === 0,
                output: stdout,
                error: stderr,
                code
            });
        });
    });
}

/**
 * Enhanced virtual assistant with AI learning
 */
export async function virtualAssistant(req, res) {
    try {
        let { text } = req.body;
        const originalText = text;
        text = text.toLowerCase().trim();
        console.log(`Received command: ${text}`);

        // Handle confirmations
        if (pendingExecution && (text.includes('yes') || text.includes('sure') || text.includes('proceed'))) {
            say.speak("Executing command.");
            await executeConfirmedCommand(res);
            return;
        }
        
        if (pendingExecution && (text.includes('no') || text.includes('cancel'))) {
            say.speak("Command cancelled.");
            res.status(200).json({ message: "Command cancelled." });
            pendingExecution = null;
            return;
        }

        // Clean the command for processing
        const cleanCommand = text.replace(/\b(please|now|can you|kindly|jarvis|hey jarvis|sure)\b/gi, '').trim();
        
        // Handle basic greetings first
        if (/^(hey jarvis|hello|hi|good morning|good evening)$/i.test(cleanCommand)) {
            const message = "Hello, I am JARVIS. How can I help you?";
            say.speak(message);
            res.status(200).json({ message });
            return;
        }

        // Handle news requests
        if (/^(news|get news|tell me news|what's the news)$/i.test(cleanCommand)) {
            try {
                const newsData = await getNews();
                if (newsData && newsData.length > 0) {
                    const message = newsData[0].title;
                    say.speak(message);
                    res.status(200).json({ message });
                    
                    // Learn from successful news command
                    learningSystem.learnFromSuccess(originalText, ['fetch_news']);
                } else {
                    throw new Error("No news data");
                }
            } catch (error) {
                const errorMsg = "Sorry, I could not fetch the news at this moment.";
                say.speak(errorMsg);
                res.status(400).json({ error: errorMsg });
            }
            return;
        }

        // Handle Wikipedia searches
        const wikiMatch = cleanCommand.match(/search (.+?) on wikipedia/);
        if (wikiMatch) {
            try {
                const query = wikiMatch[1];
                const wikipediaData = await searchWikipedia(query);
                if (wikipediaData && wikipediaData.content) {
                    say.speak(wikipediaData.content);
                    res.status(200).json({ message: wikipediaData.content });
                    
                    // Learn from successful Wikipedia search
                    learningSystem.learnFromSuccess(originalText, [`search_wikipedia:${query}`]);
                } else {
                    throw new Error("No Wikipedia data");
                }
            } catch (error) {
                const errorMsg = "Sorry, I could not find any results on Wikipedia.";
                say.speak(errorMsg);
                res.status(400).json({ error: errorMsg });
            }
            return;
        }

        // Use learning system for all other commands
        const learningResult = await learningSystem.processCommand(cleanCommand);
        
        if (learningResult.found) {
            console.log(`Learning system found solution with confidence: ${learningResult.confidence}`);
            
            if (learningResult.source === 'similar_match') {
                say.speak(`I think you want something similar to "${learningResult.originalCommand}". Let me try that.`);
            } else if (learningResult.source === 'generated') {
                say.speak("I'll try to execute that based on what I understand.");
            }

            // Check if commands need confirmation (dangerous operations)
            const needsConfirmation = learningResult.actions.some(action => 
                action.includes('rm ') || 
                action.includes('shutdown') || 
                action.includes('reboot') ||
                action.includes('sudo') ||
                action.includes('chmod 777') ||
                action.includes('dd if=')
            );

            if (needsConfirmation) {
                pendingExecution = {
                    actions: learningResult.actions,
                    originalCommand: originalText,
                    confidence: learningResult.confidence
                };
                
                const message = `This command might be risky: ${learningResult.actions.join(', ')}. Do you want me to proceed? Say 'yes' or 'no'.`;
                say.speak(message);
                res.status(200).json({ message, requiresConfirmation: true });
                return;
            } else {
                // Execute immediately for safe commands
                await executeActions(learningResult.actions, originalText, learningResult.confidence, res);
            }
        } else {
            // Fallback to LLM with learning
            console.log("Learning system couldn't handle command, using LLM");
            
            // Enhanced LLM prompt for Linux command generation
            const enhancedPrompt = `
User said: "${originalText}"
This is a Linux system. If this is a system command request, respond with:
COMMAND: [linux command to execute]
EXPLANATION: [brief explanation]

If it's not a system command, respond normally as JARVIS assistant.

Examples:
- "open firefox" → COMMAND: firefox
- "create folder named test" → COMMAND: mkdir test
- "take screenshot" → COMMAND: gnome-screenshot -f ~/screenshot_$(date +%Y%m%d_%H%M%S).png
`;

            try {
                const llmResponse = await getResponse(enhancedPrompt);
                console.log(`LLM response: ${llmResponse}`);
                
                // Check if LLM provided a command
                const commandMatch = llmResponse.match(/COMMAND:\s*([^\n,]+)/);
                if (commandMatch) {
                    const command = commandMatch[1].trim();
                    const explanation = llmResponse.match(/EXPLANATION:\s*([^\n]+)/)?.[1] || "Executing command";
                    
                    // Ask for confirmation for LLM-generated commands
                    pendingExecution = {
                        actions: [command],
                        originalCommand: originalText,
                        confidence: 0.7,
                        isLLMGenerated: true,
                        explanation: explanation
                    };
                    
                    const message = `I think you want me to run: "${command}". ${explanation}. Should I proceed? Say 'yes' or 'no'.`;
                    say.speak(message);
                    res.status(200).json({ message, requiresConfirmation: true });
                } else {
                    // Regular conversation response
                    await say.speak(llmResponse);
                    res.status(200).json({ message: llmResponse });
                }
            } catch (error) {
                console.error("LLM error:", error);
                const errorMsg = "I'm not sure how to help with that. Can you try rephrasing?";
                say.speak(errorMsg);
                res.status(400).json({ error: errorMsg });
            }
        }

    } catch (error) {
        console.error("Error in virtualAssistant:", error);
        say.speak("An error occurred. Please try again.");
        res.status(500).json({ error: "An unexpected error occurred." });
    }
}

/**
 * Execute confirmed command
 */
async function executeConfirmedCommand(res) {
    if (!pendingExecution) {
        res.status(400).json({ error: "No pending command to execute." });
        return;
    }

    await executeActions(
        pendingExecution.actions, 
        pendingExecution.originalCommand, 
        pendingExecution.confidence, 
        res
    );
    
    pendingExecution = null;
}

/**
 * Execute a list of actions
 */
async function executeActions(actions, originalCommand, confidence, res) {
    try {
        const results = [];
        
        for (const action of actions) {
            console.log(`Executing action: ${action}`);
            
            if (action.startsWith('fetch_news')) {
                // Handle news fetching
                const newsData = await getNews();
                results.push(`News: ${newsData[0]?.title || 'No news available'}`);
            } else if (action.startsWith('search_wikipedia:')) {
                // Handle Wikipedia search
                const query = action.split(':')[1];
                const wikiData = await searchWikipedia(query);
                results.push(wikiData.content || 'No Wikipedia results');
            } else {
                // Execute as Linux command
                const result = await executeLinuxCommand(action);
                if (result.success) {
                    results.push(result.output || 'Command executed successfully');
                } else {
                    results.push(`Error: ${result.error}`);
                }
            }
        }

        // Learn from successful execution
        if (results.every(r => !r.startsWith('Error:'))) {
            learningSystem.learnFromSuccess(originalCommand, actions);
            console.log(`Learned new pattern for: "${originalCommand}"`);
        }

        const message = results.join('\n') || 'Commands executed successfully';
        say.speak(message.length > 100 ? 'Commands executed successfully' : message);
        res.status(200).json({ 
            message, 
            confidence,
            actionsExecuted: actions.length
        });

    } catch (error) {
        console.error("Error executing actions:", error);
        const errorMsg = "Sorry, I couldn't execute that command.";
        say.speak(errorMsg);
        res.status(500).json({ error: errorMsg });
    }
}

/**
 * Get learning statistics endpoint
 */
export async function getLearningStats(req, res) {
    try {
        const stats = learningSystem.getStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: "Could not get learning stats" });
    }
}
