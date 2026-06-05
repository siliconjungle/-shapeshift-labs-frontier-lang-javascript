import type { FrontierLangDocument } from '@shapeshift-labs/frontier-lang-kernel';

export interface EmitJavaScriptOptions {
  readonly banner?: string;
}

export declare function emitJavaScript(document: FrontierLangDocument, options?: EmitJavaScriptOptions): string;
