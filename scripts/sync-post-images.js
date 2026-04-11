#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const repoRoot = process.cwd();
const postsDir = path.join(repoRoot, "_posts");
const args = new Set(process.argv.slice(2));
const runAll = args.has("--all");
const shouldStage = args.has("--stage");

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".bmp",
  ".avif",
]);

function run(command) {
  return cp.execSync(command, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();
}

function gitAdd(files) {
  if (files.length === 0) {
    return;
  }

  const result = cp.spawnSync("git", ["add", "--", ...files], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("git add failed");
  }
}

function getTargetPosts() {
  if (runAll) {
    return fs
      .readdirSync(postsDir)
      .filter((name) => name.endsWith(".md"))
      .map((name) => path.join(postsDir, name));
  }

  let staged = "";
  try {
    staged = run("git diff --cached --name-only --diff-filter=ACMR");
  } catch (error) {
    return [];
  }

  return staged
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => file.startsWith("_posts/") && file.endsWith(".md"))
    .map((file) => path.join(repoRoot, file));
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyIfNeeded(sourcePath, destPath) {
  ensureDir(path.dirname(destPath));
  if (!fs.existsSync(destPath) || fs.readFileSync(sourcePath).compare(fs.readFileSync(destPath)) !== 0) {
    fs.copyFileSync(sourcePath, destPath);
    return true;
  }
  return false;
}

function getPostSlug(postPath) {
  const filename = path.basename(postPath, path.extname(postPath));
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function stripDecoration(rawUrl) {
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function isRemote(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url) || /^(?:data:|mailto:|tel:|#)/i.test(url);
}

function isImagePath(url) {
  const clean = url.split(/[?#]/, 1)[0];
  return IMAGE_EXTENSIONS.has(path.extname(clean).toLowerCase());
}

function unique(values) {
  return [...new Set(values)];
}

function resolveSourceCandidates(postPath, slug, url) {
  const cleanUrl = stripDecoration(url).split(/[?#]/, 1)[0];
  const basename = path.basename(cleanUrl);
  const rootRelative = cleanUrl.replace(/^\/+/, "");
  const postDir = path.dirname(postPath);

  return unique([
    path.resolve(postDir, cleanUrl),
    path.resolve(repoRoot, rootRelative),
    path.resolve(repoRoot, "assets", slug, basename),
    path.resolve(repoRoot, "img", "blog", slug, basename),
  ]);
}

function replaceMarkdownImage(match, altText, rawUrl, postPath, slug, state) {
  const url = stripDecoration(rawUrl);
  if (isRemote(url) || !isImagePath(url)) {
    return match;
  }

  const basename = path.basename(url.split(/[?#]/, 1)[0]);
  const destRelative = `/img/blog/${slug}/${basename}`;
  const destAbsolute = path.join(repoRoot, "img", "blog", slug, basename);
  const candidates = resolveSourceCandidates(postPath, slug, url);
  const existingSource = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());

  if (!existingSource) {
    state.missing.push(`${toPosix(path.relative(repoRoot, postPath))}: ${url}`);
    return match;
  }

  if (copyIfNeeded(existingSource, destAbsolute)) {
    state.copied.push(toPosix(path.relative(repoRoot, destAbsolute)));
  }

  if (url !== destRelative) {
    state.changed = true;
    return `![${altText}](${destRelative})`;
  }

  return match;
}

function replaceHtmlImage(match, prefix, rawUrl, suffix, postPath, slug, state) {
  const url = stripDecoration(rawUrl);
  if (isRemote(url) || !isImagePath(url)) {
    return match;
  }

  const basename = path.basename(url.split(/[?#]/, 1)[0]);
  const destRelative = `/img/blog/${slug}/${basename}`;
  const destAbsolute = path.join(repoRoot, "img", "blog", slug, basename);
  const candidates = resolveSourceCandidates(postPath, slug, url);
  const existingSource = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());

  if (!existingSource) {
    state.missing.push(`${toPosix(path.relative(repoRoot, postPath))}: ${url}`);
    return match;
  }

  if (copyIfNeeded(existingSource, destAbsolute)) {
    state.copied.push(toPosix(path.relative(repoRoot, destAbsolute)));
  }

  if (url !== destRelative) {
    state.changed = true;
    return `${prefix}${destRelative}${suffix}`;
  }

  return match;
}

function processPost(postPath) {
  const slug = getPostSlug(postPath);
  const original = fs.readFileSync(postPath, "utf8");
  const state = {
    changed: false,
    copied: [],
    missing: [],
  };

  let next = original.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, rawUrl) =>
    replaceMarkdownImage(match, altText, rawUrl, postPath, slug, state)
  );

  next = next.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, rawUrl, suffix) =>
    replaceHtmlImage(match, prefix, rawUrl, suffix, postPath, slug, state)
  );

  if (state.changed) {
    fs.writeFileSync(postPath, next, "utf8");
  }

  return state;
}

function main() {
  const posts = getTargetPosts();
  if (posts.length === 0) {
    console.log("No target posts to process.");
    return;
  }

  const copied = [];
  const missing = [];
  const changedPosts = [];
  const touchedFiles = [];

  for (const postPath of posts) {
    const result = processPost(postPath);
    if (result.changed) {
      const relativePost = toPosix(path.relative(repoRoot, postPath));
      changedPosts.push(relativePost);
      touchedFiles.push(relativePost);
    }
    copied.push(...result.copied);
    touchedFiles.push(...result.copied);
    missing.push(...result.missing);
  }

  if (changedPosts.length > 0) {
    console.log("Updated posts:");
    for (const post of changedPosts) {
      console.log(`- ${post}`);
    }
  }

  if (copied.length > 0) {
    console.log("Synced images:");
    for (const file of unique(copied)) {
      console.log(`- ${file}`);
    }
  }

  if (missing.length > 0) {
    console.error("Missing image sources:");
    for (const item of unique(missing)) {
      console.error(`- ${item}`);
    }
    process.exitCode = 1;
    return;
  }

  if (shouldStage) {
    gitAdd(unique(touchedFiles));
  }

  console.log("Post image sync completed.");
}

main();
