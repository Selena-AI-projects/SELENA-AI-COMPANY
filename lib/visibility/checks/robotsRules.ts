/**
 * robots.txt, read the way real crawlers read it.
 *
 * There is no single answer to "does this file allow ClaudeBot". RFC 9309 and
 * Google resolve a name to the most specific group and ignore the rest;
 * plenty of simpler crawlers apply every group whose user-agent matches,
 * wildcard included. A file that makes those two readers disagree is a file
 * whose owner cannot know who is being let in — which is why both readings
 * live here side by side rather than one being called correct.
 */

export interface RobotsRule {
  directive: "allow" | "disallow";
  path: string;
  source: string;
}

export interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

export interface RobotsVerdict {
  blocked: boolean;
  matchedRule: string | null;
}

export function parseRobots(body: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let hasRules = false;
  for (const rawLine of body.split(/\r?\n/)) {
    const source = rawLine.split("#", 1)[0]?.trim() ?? "";
    if (!source) continue;
    const separator = source.indexOf(":");
    if (separator < 0) continue;
    const key = source.slice(0, separator).trim().toLowerCase();
    const value = source.slice(separator + 1).trim();
    if (key === "user-agent") {
      if (!current || hasRules) {
        current = { agents: [], rules: [] };
        groups.push(current);
        hasRules = false;
      }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if ((key === "allow" || key === "disallow") && current) {
      current.rules.push({ directive: key, path: value, source });
      hasRules = true;
    }
  }
  return groups;
}

export function ruleMatchesRoot(path: string): boolean {
  if (!path) return false;
  const withoutEnd = path.replace(/\$$/, "");
  const prefix = withoutEnd.split("*", 1)[0] ?? withoutEnd;
  return "/".startsWith(prefix || "/");
}

function matchesAgent(group: RobotsGroup, agent: string): boolean {
  return group.agents.some((value) => value !== "*" && agent.includes(value));
}

/** Longest path wins; on a tie, Allow wins — the resolution both readers share. */
function selectRule(rules: RobotsRule[]): RobotsRule | undefined {
  return [...rules]
    .filter((rule) => ruleMatchesRoot(rule.path))
    .sort((a, b) => b.path.length - a.path.length || (a.directive === "allow" ? -1 : 1))[0];
}

/** RFC 9309: the crawler obeys the group that names it, and no other. */
export function decideBySpecificGroup(groups: RobotsGroup[], userAgent: string): RobotsVerdict {
  const agent = userAgent.toLowerCase();
  const named = groups.filter((group) => matchesAgent(group, agent));
  const applicable = named.length > 0 ? named : groups.filter((group) => group.agents.includes("*"));
  const selected = selectRule(applicable.flatMap((group) => group.rules));
  return { blocked: selected?.directive === "disallow", matchedRule: selected?.source ?? null };
}

/** The simpler reading: every group that matches applies, and one Disallow is enough. */
export function decideByEveryMatchingGroup(groups: RobotsGroup[], userAgent: string): RobotsVerdict {
  const agent = userAgent.toLowerCase();
  const applicable = groups.filter(
    (group) => matchesAgent(group, agent) || group.agents.includes("*"),
  );
  for (const group of applicable) {
    const selected = selectRule(group.rules);
    if (selected?.directive === "disallow") return { blocked: true, matchedRule: selected.source };
  }
  return { blocked: false, matchedRule: null };
}
