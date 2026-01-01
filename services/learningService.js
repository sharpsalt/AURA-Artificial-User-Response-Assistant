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
    
}

export default LearningSystem;