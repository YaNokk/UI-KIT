import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function sourceCandidate(importer: string, specifier: string): string | null {
  const raw = resolve(dirname(importer), specifier.replace(/\.js$/, ""));
  for (const extension of [".ts", ".tsx"]) {
    const candidate = `${raw}${extension}`;
    if (existsSync(candidate)) return candidate;
  }
  for (const index of ["index.ts", "index.tsx"]) {
    const candidate = resolve(raw, index);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function collectModuleGraph(entry: string, visited = new Set<string>()): string[] {
  if (visited.has(entry)) return [];
  visited.add(entry);
  const source = readFileSync(entry, "utf8");
  const dependencies = Array.from(source.matchAll(/(?:from\s+|import\s+)["'](\.[^"']+)["']/g))
    .flatMap((match) => {
      const candidate = sourceCandidate(entry, match[1] ?? "");
      return candidate == null ? [] : [candidate];
    });
  return [entry, ...dependencies.flatMap((dependency) => collectModuleGraph(dependency, visited))];
}

describe("Table and Pagination package boundaries", () => {
  it.each(["Table", "Pagination"])("keeps TanStack outside the %s subpath graph", (subpath) => {
    const entry = resolve(process.cwd(), "packages", "ui", "src", subpath, "index.ts");
    const graph = collectModuleGraph(entry);
    expect(graph.length).toBeGreaterThan(0);
    for (const file of graph) expect(readFileSync(file, "utf8")).not.toContain("@tanstack/");
  });
});
