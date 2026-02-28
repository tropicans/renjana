const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile) {
    console.error("Harap masukkan nama file, contoh: node build_pdf.js docs/file.md");
    process.exit(1);
}

const mdPath = path.resolve(inputFile);
const dir = path.dirname(mdPath);
const ext = path.extname(mdPath);
const base = path.basename(mdPath, ext);
const printMdPath = path.join(dir, `${base}_Print${ext}`);

const mdContent = fs.readFileSync(mdPath, 'utf-8');
const mermaidRegex = /```mermaid\r?\n([\s\S]*?)```/g;

let match;
let count = 1;
let newMdContent = mdContent;

console.log("Memulai proses konversi Mermaid ke PNG...");

while ((match = mermaidRegex.exec(mdContent)) !== null) {
    const mermaidCode = match[1];
    const mmdFile = path.join(dir, `diagram_${count}.mmd`);
    const pngFile = path.join(dir, `diagram_${count}.png`);

    fs.writeFileSync(mmdFile, mermaidCode);
    console.log(`- Merender diagram ${count}...`);

    try {
        // Run mermaid-cli
        execSync(`npx -y @mermaid-js/mermaid-cli -i "${mmdFile}" -o "${pngFile}" -b white`, { stdio: 'inherit' });

        // Replace in Markdown
        newMdContent = newMdContent.replace(match[0], `![Diagram ${count}](./diagram_${count}.png)`);
    } catch (e) {
        console.error(`Gagal merender diagram ${count}:`, e.message);
    }

    count++;
}

console.log("\nMenyimpan file Markdown sementara...");
fs.writeFileSync(printMdPath, newMdContent);

console.log("\nConvert Markdown ke PDF...");
try {
    execSync(`npx -y md-to-pdf "${printMdPath}"`, { stdio: 'inherit' });
    console.log("\n✅ BERHASIL! File PDF dengan grafik sudah selesai: 01_Assessment_Report_Print.pdf");
} catch (e) {
    console.error("Gagal convert ke PDF:", e.message);
}
