import fs from 'fs/promises';
import path from 'path';

const unlighthousePath = path.join(process.cwd(), '.unlighthouse');
const reportsDir = path.join(unlighthousePath, 'reports');

async function findLighthouseJsons(dir) {
    let results = [];
    const list = await fs.readdir(dir);

    for (let file of list) {
        file = path.join(dir, file);
        const stat = await fs.stat(file);

        if (stat && stat.isDirectory() && !file.includes('__screenshot')) {
            results = results.concat(await findLighthouseJsons(file));
        } else if (file.endsWith('lighthouse.json')) {
            results.push(file);
        }
    }
    return results;
}

async function debugFailures() {
    try {
        const jsonFiles = await findLighthouseJsons(reportsDir);
        let output = "";

        for (const file of jsonFiles) {
            const content = await fs.readFile(file, 'utf-8');
            const data = JSON.parse(content);
            const url = data.finalUrl || data.requestedUrl || file;

            output += `\n=== DETAILS FOR: ${url} ===\n`;

            const contrast = data.audits['color-contrast'];
            if (contrast && contrast.score < 1 && contrast.details && contrast.details.items) {
                output += "\n[!] Color Contrast Issues:\n";
                contrast.details.items.forEach(item => {
                    output += `  - Selector: ${item.node.selector}\n`;
                    output += `    Label: ${item.node.nodeLabel}\n`;
                    output += `    Snippet: ${item.node.snippet}\n`;
                    output += `    Explanation: ${item.explanation}\n`;
                });
            }

            const consoleErrors = data.audits['errors-in-console'];
            if (consoleErrors && consoleErrors.score < 1 && consoleErrors.details && consoleErrors.details.items) {
                output += "\n[!] Console Errors:\n";
                consoleErrors.details.items.forEach(item => {
                    output += `  - Message: ${item.description}\n`;
                });
            }
        }
        await fs.writeFile('debug-lighthouse.txt', output);
        console.log("Debug info written to debug-lighthouse.txt");
    } catch (err) {
        console.error("Error debugging failures:", err);
    }
}

debugFailures();
