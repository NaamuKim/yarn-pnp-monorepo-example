import type { FileInfo, API } from 'jscodeshift';

// BC #5 – microsoft/TypeScript PR #63077
// import x from 'y' assert { type: 'json' }  →  import x from 'y' with { type: 'json' }
//
// Only replaces `assert {` that directly follows a module specifier string,
// so bare `assert` identifiers in regular code are unaffected.
export default function transform(fileInfo: FileInfo, _api: API): string {
  return fileInfo.source.replace(
    /(from\s+['"][^'"]*['"]\s*)\bassert\s*(\{)/g,
    '$1with $2',
  );
}
