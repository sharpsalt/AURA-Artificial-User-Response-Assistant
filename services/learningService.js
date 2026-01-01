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

    
}

export default LearningSystem;