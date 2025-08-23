import shell from "shelljs";

const systemService = {
    shutdownComputer: async () => {
        try {
            console.log("Executing system shutdown...");
            shell.exec("shutdown now", { async: true });
        } catch (error) {
            console.error("Error shutting down:", error);
            throw error;
        }
    },
    updateSystem: async () => {
        try {
            console.log("Executing system update...");
            shell.exec("sudo apt update && sudo apt upgrade -y", { async: true });
        } catch (error) {
            console.error("Error updating system:", error);
            throw error;
        }
    },
     openCamera: async () => {
        try {
            console.log("Opening camera...");
            const platform = process.platform;
            if (platform === 'darwin') { // macOS
                shell.exec('open -a "Photo Booth"', { async: true });
            } else if (platform === 'win32') { // Windows
                shell.exec('start microsoft.windows.camera:', { async: true });
            } else { // Linux (assumes `cheese` is installed)
                shell.exec('cheese', { async: true });
            }
        } catch (error) {
            console.error("Error opening camera:", error);
            throw error;
        }
    },
    /**
     * Clones a Git repository from a given URL.
     * @param {string} repoUrl The URL of the repository to clone.
     */
    cloneRepo: async (repoUrl) => {
        try {
            console.log(`Cloning repository: ${repoUrl}`);
            shell.exec(`git clone ${repoUrl}`, { async: true });
        } catch (error) {
            console.error("Error cloning repository:", error);
            throw error;
        }
    }
};
export default systemService;