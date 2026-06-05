import type { FrontierLangDocument } from '@shapeshift-labs/frontier-lang-kernel';

export interface EmitJavaScriptOptions {
  readonly banner?: string;
}

export interface JavaScriptSourceRef {
  readonly semanticNodeId: string;
  readonly semanticNodeKind?: string;
  readonly semanticNodeName?: string;
  readonly regionIds?: readonly string[];
}

export type JavaScriptAstDeclaration =
  | { readonly kind: 'exportConst'; readonly name: string; readonly value: unknown; readonly freeze?: boolean; readonly sourceRef?: JavaScriptSourceRef }
  | { readonly kind: 'exportFunction'; readonly name: string; readonly params: readonly string[]; readonly body: readonly string[]; readonly sourceRef?: JavaScriptSourceRef };

export interface JavaScriptAstModule {
  readonly kind: 'javascript.module';
  readonly banner: string;
  readonly declarations: readonly JavaScriptAstDeclaration[];
}

export declare function toJavaScriptAst(document: FrontierLangDocument, options?: EmitJavaScriptOptions): JavaScriptAstModule;
export declare function renderJavaScriptAst(ast: JavaScriptAstModule): string;
export declare function emitJavaScript(document: FrontierLangDocument, options?: EmitJavaScriptOptions): string;
