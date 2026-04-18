---
title: "Test Hidden Draft Brief"
date: "2026-04-18"
category: "Finance"
author: "Rohan"
status: "draft"
featured_image: ""
---

# Test Hidden Draft Brief

This article has `status: draft` in its frontmatter.

- It should **NOT** appear in `/guides`.
- It **should** render at `localhost:5173/guides/test-hidden`.
- It should **NOT** appear in `sitemap.xml`.

> RISK AUDIT: This file exists only to verify draft-mode filtering. Delete it before shipping to production.
