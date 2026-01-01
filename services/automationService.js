import puppeteer from 'puppeteer';

const automationService = {
    /**
     * Opens Gmail and drafts an email.
     * @param {string} recipient The email address of the recipient.
     * @param {string} subject The subject line of the email.
     */
    openGmailAndWriteMail: async (recipient, subject) => {
        const browser = await puppeteer.launch({ headless: false }); // `headless: false` shows the browser UI
        const page = await browser.newPage();
        try {
            await page.goto('https://mail.google.com/mail/u/0/#inbox');
            await page.waitForSelector('div[role="button"][gh="cm"]', { visible: true });
            await page.click('div[role="button"][gh="cm"]');
            await page.waitForSelector('textarea[name="to"]', { visible: true });
            await page.type('textarea[name="to"]', recipient);
            await page.waitForSelector('input[name="subjectbox"]', { visible: true });
            await page.type('input[name="subjectbox"]', subject);
            console.log(`Drafted email to ${recipient} with subject "${subject}"`);
        } catch (error) {
            console.error("Error automating Gmail:", error);
            // Close the browser on error
            await browser.close();
            throw error;
        }
    },
    /**
     * Opens ChatGPT and writes a prompt.
     * @param {string} prompt The text prompt to type into Generative Pretrained Transform.
     */
};

export default automationService;