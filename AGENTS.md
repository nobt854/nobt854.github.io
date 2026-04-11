# Codex Constraints For This Repo

This file adapts the project rules from `CLAUDE.md` and `.claude/settings.local.json` into Codex-facing instructions.

## Project Scope

- This repository is a Jekyll blog.
- Treat `CLAUDE.md` as the source policy for blog-writing behavior.
- Prefer minimal, targeted edits. Do not rewrite unrelated content.

## Mandatory Blog Creation Flow

When the user provides raw material that looks like blog content, do not generate a post immediately.

1. First confirm whether the user wants to create a blog post.
2. After the user confirms, confirm the blog type if it was not explicitly provided.
3. Only generate or modify a blog post after both confirmations are complete.

Hard rules:

- Do not decide on your own that a blog post should be created.
- Do not infer the blog type on your own.
- If either confirmation is missing, stop and ask.

## Supported Blog Types

### Technical

Use for technical case studies, experiments, tool usage notes, and troubleshooting records.

Rules:

- Keep the technical content intact.
- Light polish is acceptable, but do not dilute technical completeness.
- Avoid filler phrasing such as “事情是这样的”.

Suggested front matter:

```md
---
layout: post
title: "标题"
date: YYYY-MM-DD
categories: blog
tags: [技术, 标签2]
author: nobt854
---
```

### Opinion

Use only after the user explicitly chooses the opinion type.

Rules:

- Preserve the user's core viewpoint as written. Only minor grammar or punctuation cleanup is allowed.
- Include a visual companion, preferably SVG or ASCII.
- AI commentary must stay short and restrained.
- Avoid over-structuring or turning it into a long essay.

Required sections:

- `## 💭 核心观点`
- `## 🎨 图解`
- `## 🤖 AI 点评`
- Optional: `## 📌 延伸思考`

### Research

Use for one or more questions that need concise investigation.

Rules:

- Answer as a domain expert.
- Keep the response concise and direct.
- Do not add excessive sectioning or ornamental structure.

## Formatting Rules

- Use native Markdown tables, not ASCII-art tables.
- Use tables for side-by-side comparisons or repeated structured data.
- Wrap tree structures, flow chains, and command-like sequences in fenced code blocks.
- Important viewpoints should use blockquotes, and strong emphasis is preferred when appropriate.
- Major sections should be separated with `---`.
- For technical posts, second-level headings should include a relevant emoji.
- Use inline code for paths, commands, config names, and identifiers such as `CLAUDE.md`, `skills/`, and `.env`.

## Output Quality Rules

- Keep the overall blog visually consistent with the existing site.
- Prioritize readability over flourish.
- Match the selected blog type. Do not mix styles casually.
- For opinion and research posts, prefer concise output over long expansions.

## Pre-Commit Validation

Before committing a created or modified blog post:

1. Confirm the blog type was explicitly chosen by the user.
2. Verify table syntax is valid Markdown.
3. Verify major sections use `---` where appropriate.
4. Verify tree/process snippets are fenced.
5. Verify required sections exist for the selected blog type.
6. If the local environment supports it, run `jekyll build` or an equivalent project validation command before commit.

Hard rules:

- If blog type confirmation is missing, do not proceed as if it were confirmed.
- Do not commit unvalidated blog content.

## External Fetch Preference

If remote content is required for this project, prefer the domains already allowed in the Claude config:

- `nobt854.github.io`
- `jina.ai`
- `github.com`

## Editing Guidance

- When editing posts under `_posts/`, preserve existing front matter style and permalink conventions used by nearby posts.
- Reuse the repository's existing Chinese writing tone unless the target article is clearly English.
- If asked to transform notes into a post, collect the two mandatory confirmations first, then generate the draft.
- Post images should end up under `img/blog/<post-slug>/` and use `/img/blog/<post-slug>/<file>` links so they remain stable after site deploys and domain changes.
- This repo includes a local pre-commit hook plus `npm run sync:post-images` to copy referenced images into the blog image directory and rewrite post links automatically.
