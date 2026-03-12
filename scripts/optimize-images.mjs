import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const inputDir = "_backup/assets/images";
const outputBaseDir = "public/assets/images";

// Responsive boyutlar — Lighthouse "Properly size images" uyarısını kapatır
const RESPONSIVE_WIDTHS = [208, 400, 800, 1200, 1920];

// Bu dosyalar küçültülmez, sadece WebP'ye çevrilir (favicon, UI öğeleri)
const NO_RESIZE_PATTERNS = [
  /favicon/i,
  /placeholder/i,
  /map-placeholder/i,
  /rewards-app-mockup/i,
];

// Sertifikalar — küçük ve net olması lazım, kalite yüksek tutulur
const HIGH_QUALITY_PATTERNS = [/cert\//i, /kosher/i, /gluten/i];

function getFiles(dir, files_ = []) {
  if (!fs.existsSync(dir)) return files_;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

function shouldSkipResize(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return NO_RESIZE_PATTERNS.some((p) => p.test(normalized));
}

function getQuality(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.includes("hero-background")) return 65;
  return HIGH_QUALITY_PATTERNS.some((p) => p.test(normalized)) ? 90 : 80;
}

// Görselin gerçek genişliğini ffprobe ile al
function getImageWidth(imagePath) {
  try {
    const result = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "${imagePath}"`,
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    return parseInt(result.toString().trim(), 10);
  } catch {
    return null;
  }
}

if (!fs.existsSync(inputDir)) {
  console.error(`Giriş dizini bulunamadı: ${inputDir}`);
  process.exit(1);
}

const allFiles = getFiles(inputDir);
const images = allFiles.filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

console.log(
  `Toplam ${images.length} görsel bulundu. Optimizasyon başlıyor...\n`,
);

// Astro'da srcset için kullanılacak manifest
const manifest = {};

images.forEach((imagePath) => {
  const relativePath = path.relative(inputDir, imagePath).replace(/\\/g, "/");
  const outputDirRelative = path.dirname(relativePath);
  const outputDir = path.join(outputBaseDir, outputDirRelative);
  const baseName = path.parse(relativePath).name;
  const quality = getQuality(relativePath);
  const skipResize = shouldSkipResize(relativePath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`İşleniyor: ${relativePath}`);

  const originalWidth = getImageWidth(imagePath);
  const generatedSizes = [];

  if (skipResize) {
    // Sadece WebP'ye çevir, boyutlandırma yapma
    const outputPath = path.join(outputDir, `${baseName}.webp`);
    try {
      execSync(`ffmpeg -i "${imagePath}" -q:v ${quality} -y "${outputPath}"`, {
        stdio: "ignore",
      });
      const oldKB = (fs.statSync(imagePath).size / 1024).toFixed(1);
      const newKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`  ✓ ${baseName}.webp — ${oldKB}KB → ${newKB}KB`);
      generatedSizes.push({ width: originalWidth, file: `${baseName}.webp` });
    } catch (err) {
      console.error(`  ✗ Hata: ${err.message}`);
    }
  } else {
    // Her responsive boyut için ayrı WebP üret
    const widthsToGenerate = originalWidth
      ? RESPONSIVE_WIDTHS.filter(
          (w) =>
            w <= originalWidth ||
            (w <= 1920 && imagePath.includes("hero-background")),
        )
      : RESPONSIVE_WIDTHS;

    // En az bir boyut üretilsin (orijinal küçükse bile)
    if (widthsToGenerate.length === 0) {
      widthsToGenerate.push(originalWidth || RESPONSIVE_WIDTHS[0]);
    }

    // Orijinal boyutu da ekle (eğer listede yoksa)
    if (originalWidth && !widthsToGenerate.includes(originalWidth)) {
      widthsToGenerate.push(originalWidth);
    }

    widthsToGenerate.sort((a, b) => a - b);

    widthsToGenerate.forEach((width) => {
      const suffix = widthsToGenerate.length > 1 ? `-${width}w` : "";
      const outputFileName = `${baseName}${suffix}.webp`;
      const outputPath = path.join(outputDir, outputFileName);

      try {
        const scaleFilter =
          width === originalWidth
            ? "scale=iw:ih" // Orijinal boyut — scale yapma
            : `scale=${width}:-2`; // -2: yüksekliği çift piksele yuvarla (codec uyumu)

        execSync(
          `ffmpeg -i "${imagePath}" -q:v ${quality} -vf "${scaleFilter}" -y "${outputPath}"`,
          { stdio: "ignore" },
        );

        const newKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
        console.log(`  ✓ ${outputFileName} (${width}px) — ${newKB}KB`);
        generatedSizes.push({ width, file: outputFileName });
      } catch (err) {
        console.error(`  ✗ ${outputFileName} hatası: ${err.message}`);
      }
    });
  }

  // Manifest'e ekle
  manifest[relativePath] = {
    original: relativePath,
    quality,
    sizes: generatedSizes,
    srcset: generatedSizes
      .map(
        (s) =>
          `/assets/images/${outputDirRelative === "." ? "" : outputDirRelative + "/"}${s.file} ${s.width}w`,
      )
      .join(", "),
  };

  console.log("");
});

// Manifest'i kaydet
const manifestPath = path.join(outputBaseDir, "image-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\n✅ Tüm görseller optimize edildi.`);
console.log(`📄 Manifest: ${manifestPath}`);
