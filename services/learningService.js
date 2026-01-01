// services/learningService.js
import fs from 'fs';
import path from 'path';

class LearningSystem {
    constructor() {
        this.knowledgeBase = new Map();
        this.commandHistory = [];
        this.intentPatterns = new Map();
        this.loadKnowledge();
    }
    loadKnowledge() {
        try {
            if (fs.existsSync('./learning.json')) {
                const data = JSON.parse(fs.readFileSync('./learning.json', 'utf8'));
                this.knowledgeBase = new Map(data.knowledgeBase || []);
                this.commandHistory = data.commandHistory || [];
                this.intentPatterns = new Map(data.intentPatterns || []);
            }
        } catch (error) {
            console.log('No existing knowledge base found, starting fresh');
        }
    }
    saveKnowledge() {
        const data = {
            knowledgeBase: Array.from(this.knowledgeBase.entries()),
            commandHistory: this.commandHistory,
            intentPatterns: Array.from(this.intentPatterns.entries())
        };
        fs.writeFileSync('./learning.json', JSON.stringify(data, null, 2));
    }
    extractIntent(command) {
        const cleanCommand = command.toLowerCase().trim();
        
        // Extract action verbs
        const actionWords = ['open', 'close', 'start', 'stop', 'create', 'delete', 'search', 'find', 'call', 'message', 'send', 'play', 'pause', 'take', 'click', 'make', 'run', 'execute', 'install', 'update'];
        const targetWords = ['file', 'folder', 'application', 'app', 'website', 'browser', 'terminal', 'camera', 'picture', 'photo', 'screenshot'];
        
        let action = null;
        let target = null;
        let params = [];
        for (const word of actionWords) {
            if (cleanCommand.includes(word)) {
                action = word;
                break;
            }
        }
        for (const word of targetWords) {
            if (cleanCommand.includes(word)) {
                target = word;
                break;
            }
        }
        const words = cleanCommand.split(' ');
        for (let i = 0; i < words.length; i++) {
            // Look for "named", "called", "to", "in", "with", "on"
            if (['named', 'called', 'to', 'in', 'with', 'on'].includes(words[i]) && words[i + 1]) {
                params.push({
                    type: words[i],
                    value: words[i + 1]
                });
            }
        }
        return {
            action,
            target,
            params,
            originalCommand: command,
            confidence: this.calculateConfidence(action, target, params)
        };
    }
    calculateConfidence(action, target, params) {
        let confidence = 0;
        if (action) confidence += 0.4;
        if (target) confidence += 0.3;
        if (params.length > 0) confidence += 0.3;
        return confidence;
    }
    learnFromSuccess(command, executedActions) {
        const intent = this.extractIntent(command);
        const pattern = {
            intent,
            actions: executedActions,
            timestamp: Date.now(),
            success: true
        };

        this.knowledgeBase.set(command, pattern);
        this.commandHistory.push(pattern);
        const intentKey = `${intent.action}_${intent.target}`;
        if (!this.intentPatterns.has(intentKey)) {
            this.intentPatterns.set(intentKey, []);
        }
        this.intentPatterns.get(intentKey).push(pattern);
        
        this.saveKnowledge();
    }
    findSimilarCommands(command) {
        const currentIntent = this.extractIntent(command);
        const similarCommands = [];

        for (const [storedCommand, pattern] of this.knowledgeBase) {
            const similarity = this.calculateSimilarity(currentIntent, pattern.intent);
            if (similarity > 0.6) {
                similarCommands.push({
                    command: storedCommand,
                    pattern,
                    similarity
                });
            }
        }

        return similarCommands.sort((a, b) => b.similarity - a.similarity);
    }

    calculateSimilarity(intent1, intent2) {
        let similarity = 0;
        
        if (intent1.action === intent2.action) similarity += 0.5;
        if (intent1.target === intent2.target) similarity += 0.3;
        const params1 = intent1.params.map(p => p.type);
        const params2 = intent2.params.map(p => p.type);
        const commonParams = params1.filter(p => params2.includes(p));
        similarity += (commonParams.length / Math.max(params1.length, params2.length)) * 0.2;

        return similarity;
    }
    generateLinuxCommand(intent) {
        const { action, target, params } = intent;
        let commands = [];
        if (action === 'open') {
            if (target === 'terminal') {
                commands.push('gnome-terminal');
            } else if (target === 'camera') {
                commands.push('cheese');
            } else {
                const appName = params.find(p => p.type === 'named' || p.type === 'called')?.value;
                if (appName) {
                    commands.push(`${appName}`);
                }
            }
        } else if (action === 'create' || action === 'make') {
            if (target === 'folder') {
                const folderName = params.find(p => p.type === 'named' || p.type === 'called')?.value || 'new_folder';
                const location = params.find(p => p.type === 'in')?.value || '.';
                commands.push(`mkdir -p "${location}/${folderName}"`);
            } else if (target === 'file') {
                const fileName = params.find(p => p.type === 'named' || p.type === 'called')?.value || 'new_file.txt';
                const location = params.find(p => p.type === 'in')?.value || '.';
                commands.push(`touch "${location}/${fileName}"`);
            }
        } else if (action === 'search') {
            const searchTerm = params.find(p => p.type === 'for')?.value;
            const platform = params.find(p => p.type === 'on')?.value || 'google';
            
            if (platform.includes('firefox') || platform === 'firefox') {
                commands.push(`firefox "https://www.google.com/search?q=${encodeURIComponent(searchTerm)}"`);
            } else {
                commands.push(`xdg-open "https://www.google.com/search?q=${encodeURIComponent(searchTerm)}"`);
            }
        } else if (action === 'take') {
            if (target === 'picture' || target === 'photo' || target === 'screenshot') {
                commands.push('gnome-screenshot -f ~/screenshot_$(date +%Y%m%d_%H%M%S).png');
            }
        }

        return commands;
    }

    async processCommand(command) {
        if (this.knowledgeBase.has(command)) {
            const pattern = this.knowledgeBase.get(command);
            return {
                found: true,
                actions: pattern.actions,
                confidence: 1.0,
                source: 'exact_match'
            };
        }

        const similarCommands = this.findSimilarCommands(command);
        if (similarCommands.length > 0) {
            const bestMatch = similarCommands[0];
            return {
                found: true,
                actions: bestMatch.pattern.actions,
                confidence: bestMatch.similarity,
                source: 'similar_match',
                originalCommand: bestMatch.command
            };
        }

        const intent = this.extractIntent(command);
        if (intent.confidence > 0.5) {
            const generatedCommands = this.generateLinuxCommand(intent);
            if (generatedCommands.length > 0) {
                return {
                    found: true,
                    actions: generatedCommands,
                    confidence: intent.confidence,
                    source: 'generated',
                    intent
                };
            }
        }

        return {
            found: false,
            confidence: 0,
            intent
        };
    }
    getStats() {
        return {
            totalCommands: this.knowledgeBase.size,
            totalHistory: this.commandHistory.length,
            intentPatterns: this.intentPatterns.size
        };
    }
    
}

export default LearningSystem;