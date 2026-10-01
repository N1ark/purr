// Cuts a release: `npm run release -- 0.2.0`. Checks, bumps the version, rolls the changelog's
// Unreleased section into a dated one, commits and tags `v0.2.0`. Pushing is left to you.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
const run = (cmd, ...args) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
const fail = (msg) => {
  console.error(`release: ${msg}`);
  process.exit(1);
};

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? "")) fail("usage: npm run release -- X.Y.Z");
if (run("git", "branch", "--show-current") !== "main") fail("release from main");
if (run("git", "status", "--porcelain")) fail("the working tree is not clean");
if (run("git", "tag", "--list", `v${version}`)) fail(`v${version} is already tagged`);

const changelog = readFileSync("CHANGELOG.md", "utf8");
const unreleased = /^## Unreleased\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(changelog);
if (!unreleased?.[1].trim()) fail("CHANGELOG.md has nothing under ## Unreleased");

for (const script of ["check", "test", "format:check"]) {
  console.log(`release: npm run ${script}`);
  execFileSync("npm", ["run", "--silent", script], { stdio: "inherit" });
}

const date = new Date().toISOString().slice(0, 10);
writeFileSync(
  "CHANGELOG.md",
  changelog.replace("## Unreleased\n", `## Unreleased\n\n## ${version} — ${date}\n`),
);
run("npm", "version", version, "--no-git-tag-version", "--allow-same-version");
run("git", "add", "CHANGELOG.md", "package.json", "package-lock.json");
run("git", "commit", "-m", `Release ${version}`);
run("git", "tag", "-a", `v${version}`, "-m", `purr ${version}\n\n${unreleased[1].trim()}`);

console.log(`release: tagged v${version}. Publish it with: git push --follow-tags`);
