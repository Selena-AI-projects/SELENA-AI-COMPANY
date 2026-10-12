// Проверка черновика тем же парсером, что публикует материалы Лаборатории
// (lib/lab/files.ts): файл должен пройти так, как если бы лежал в data/lab/.
// Запуск: node --import tsx editorial/validate-lab.ts <раздел> <slug> <locale> <путь к json>
import fs from "node:fs";
import { parseLabFile } from "@/lib/lab/files";

const [section, slug, locale, file] = process.argv.slice(2);
if (!section || !slug || !locale || !file) {
  console.error("usage: validate-lab.ts <section> <slug> <en|ru> <file>");
  process.exit(64);
}
try {
  const virtualPath = `data/lab/${section}/${slug}.${locale}.json`;
  const item = parseLabFile(virtualPath, fs.readFileSync(file, "utf8"));
  console.log(`LAB_OK ${virtualPath} locale=${item.locale} blocks=${item.item.blocks.length} sources=${item.item.sources.length}`);
} catch (error) {
  console.error(`LAB_INVALID ${(error as Error).message}`);
  process.exit(1);
}
