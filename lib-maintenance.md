# Library Maintanance

Jun 7th, 2026

1. Next.js pinned to 16.2.6 to avoid issues with 16.2.7 (images not loading). https://github.com/anomalyco/sst/issues/6867

```
The GitHub issue: https://github.com/anomalyco/sst/issues/6867
Title: "Next.js 16.2.4+  Nextjs image optimizer for local public images"
Key details from the issue:
- Affected: Next.js 16.2.4+
- Error: TypeError: s is not a function in image optimizer Lambda
- Pattern: Direct image URLs work (200), optimized via /_next/image fail (500)
- Reported: May 12, 2026
- Status: Open (as of search results)
- FIX: Pin openNextVersion to "4.0.2"
```

# Audit Report
