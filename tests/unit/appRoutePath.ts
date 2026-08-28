import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Where a route's file lives, given the address it serves.
 *
 * The app has one route group per language, and a group name is invisible in
 * the URL: `/ru/pricing` is served from `app/(ru)/ru/pricing`. Tests name
 * routes the way a visitor sees them, so the group is resolved here rather
 * than written into every path in every test.
 */
const groups = ["", "(ru)", "(en)"];

export function appFile(projectPath: string): string {
  if (!projectPath.startsWith("app/")) return join(process.cwd(), projectPath);
  const relative = projectPath.slice("app/".length);
  for (const group of groups) {
    const candidate = join(process.cwd(), "app", group, relative);
    if (existsSync(candidate)) return candidate;
  }
  return join(process.cwd(), projectPath);
}
