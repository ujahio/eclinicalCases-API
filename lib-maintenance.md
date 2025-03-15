# Library Maintanance

1. react: As of Mar, 15th, 2025, version is locked to v18 as "jsx-email", "react-draft-wysiwyg", is not compatible with React v19.
2. react-dom: As of Mar, 15th, 2025 version is locked to v18 as "react" cannot be upgraded.
3. @types/react: As of Mar, 15th, 2025 version is locked to v18 as react, react-dom cannot be upgraded to v19.
4. @types/react-dom: As of Mar, 15th, 2025 version is locked to v18 as react, react-dom cannot be upgraded to v19.
5. sass: locked to v1.77.3 as v1.88+ introduces new breaking changes with new apis.
6. tailwind: locked to v3.4.17 as upgrade to v4.0.0 is not feasible due to breaking changes. Upgrade is now a devex task.

# Audit Report

1. As of Mar, 15th, 2025, canvg a dependency of html2pdf.js has a high severity vulnerability (See: https://github.com/advisories/GHSA-v2mw-5mch-w8c5). Recommendation is to downgrade html2pdf.js to 0.9.0 to fix this. The issue is html2pdf.js@0.9.0 has issues marked as "critical" in the audit report

```
xmldom  *
Severity: critical
Misinterpretation of malicious XML input - https://github.com/advisories/GHSA-h6q6-9hqw-rwfv
xmldom allows multiple root nodes in a DOM - https://github.com/advisories/GHSA-crh6-fp67-6883
Misinterpretation of malicious XML input - https://github.com/advisories/GHSA-5fg8-2547-mr8q
```

The solution is to find a replacement for html2pdf.js.

2.
