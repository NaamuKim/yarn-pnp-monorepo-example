export { fixModuleResolution } from './fix-module-resolution';
export { fixEsModuleInterop } from './fix-esmodule-interop';
export { fixStrict } from './fix-strict';

import { fixModuleResolution } from './fix-module-resolution';
import { fixEsModuleInterop } from './fix-esmodule-interop';
import { fixStrict } from './fix-strict';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyAllTsconfigFixes(config: Record<string, any>): {
  moduleResolution: boolean;
  esModuleInterop: boolean;
  strict: boolean;
} {
  return {
    moduleResolution: fixModuleResolution(config),
    esModuleInterop: fixEsModuleInterop(config),
    strict: fixStrict(config),
  };
}
