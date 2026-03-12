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

async function extractAudits() {
    try {
        const jsonFiles = await findLighthouseJsons(reportsDir);
        const issues = {};

        for (const file of jsonFiles) {
            const content = await fs.readFile(file, 'utf-8');
            const data = JSON.parse(content);
            const url = data.finalUrl || data.requestedUrl || file;

            if (!data.audits) continue;

            for (const [id, audit] of Object.entries(data.audits)) {
                // We only care about failed audits that actually have a score weight
                if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'manual' && audit.scoreDisplayMode !== 'informative' && audit.scoreDisplayMode !== 'notApplicable') {

                    if (!issues[id]) {
                        issues[id] = {
                            title: audit.title,
                            description: audit.description,
                            pages: []
                        };
                    }

                    issues[id].pages.push({
                        url,
                        score: audit.score,
                        displayValue: audit.displayValue || ''
                    });
                }
            }
        }

        // Print Results
        console.log("=== FAILING LIGHTHOUSE AUDITS ===\n");
        let hasIssues = false;
        for (const [id, details] of Object.entries(issues)) {
            if (details.pages.length > 0) {
                hasIssues = true;
                console.log(`[ ] ${details.title} (${id})`);
                console.log(`    Found on ${details.pages.length} pages.`);
                // Show first 3 examples
                details.pages.slice(0, 3).forEach(p => {
                    console.log(`    - ${p.url} (Score: ${p.score}) ${p.displayValue}`);
                });
                if (details.pages.length > 3) {
                    console.log(`    - ... and ${details.pages.length - 3} more pages`);
                }
                console.log("");
            }
        }

        if (!hasIssues) {
            console.log("🎉 No failing audits found! 100/100 confirmed in JSON reports.");
        }
    } catch (err) {
        console.error("Error extracting audits:", err);
    }
}

extractAudits();
