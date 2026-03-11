import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const inputDir = "_backup/assets/images";
const outputBaseDir = "public/assets/images"; // Astro'da resimlerin gideceği yer

function getFiles(dir, files_ = []) {
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = path.join(dir, files[i]);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

// Görselleri listele
const allFiles = getFiles(inputDir);
const images = allFiles.filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

console.log(`Toplam ${images.length} görsel bulundu. Optimizasyon başlıyor...`);

images.forEach((imagePath) => {
  const relativePath = path.relative(inputDir, imagePath);
  const outputDir = path.join(outputBaseDir, path.dirname(relativePath));

  // Klasör oluştur
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFileName = path.parse(relativePath).name + ".webp";
  const outputPath = path.join(
    outputBaseDir,
    path.dirname(relativePath),
    outputFileName,
  );

  console.log(`İşleniyor: ${relativePath} -> ${outputFileName}`);

  try {
    // FFmpeg ile WebP dönüşümü
    // -q:v 80: Kalite %80 (genelde yeterli ve çok yer kazandırır)
    // -vf "scale='min(1920,iw)':-1": Eğer resim 1920px'den genişse ölçekle, değilse olduğu gibi bırak.
    const cmd = `ffmpeg -i "${imagePath}" -q:v 80 -vf "scale='min(1920,iw)':-1" -y "${outputPath}"`;
    execSync(cmd, { stdio: "ignore" });

    const oldSize = (fs.statSync(imagePath).size / 1024).toFixed(2);
    const newSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    const ratio = ((1 - newSize / oldSize) * 100).toFixed(2);

    console.log(`  Bitti: ${oldSize}KB -> ${newSize}KB (Kazanç: %${ratio})`);
  } catch (err) {
    console.error(`  Hata (${relativePath}):`, err.message);
  }
});

console.log(
  '\nTüm görseller optimize edildi ve "public/assets/images" klasörüne taşındı.',
);
