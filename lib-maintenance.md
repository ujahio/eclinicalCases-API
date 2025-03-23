# Library Maintanance

1. react: As of Mar, 15th, 2025, version is locked to v18 as "jsx-email", "react-draft-wysiwyg", is not compatible with React v19.
2. react-dom: As of Mar, 15th, 2025 version is locked to v18 as "react" cannot be upgraded.
3. @types/react: As of Mar, 15th, 2025 version is locked to v18 as react, react-dom cannot be upgraded to v19.
4. @types/react-dom: As of Mar, 15th, 2025 version is locked to v18 as react, react-dom cannot be upgraded to v19.
5. sass: locked to v1.77.3 as v1.88+ introduces new breaking changes with new apis.
6. tailwind: locked to v3.4.17 as upgrade to v4.0.0 is not feasible due to breaking changes. Upgrade is now a devex task.
7. pdfjs-dist: locked to v4.10.38 as v5.0.375 introduces bug with a package dependency of 'qcms_bg.wasm'. 'qcms_bg.wasm' is not an npm package but used with the package.

```
 if (typeof module_or_path === 'undefined') {
> 1859 |     module_or_path = new URL('qcms_bg.wasm', import.meta.url);
     | ^
1860 |   }
1861 |   const imports = __wbg_get_imports();
1862 |   if (typeof module_or_path === 'string' || typeof Request === 'function' && module_or_path instanceof Request || typeof URL =
== 'function' && module_or_path instanceof URL) {
```

# Audit Report
