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
    
}

export default LearningSystem;