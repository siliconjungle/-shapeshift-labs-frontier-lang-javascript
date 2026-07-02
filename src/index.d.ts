import type { FrontierLangDocument } from '@shapeshift-labs/frontier-lang-kernel';

export interface EmitJavaScriptOptions {
  readonly banner?: string;
  readonly sourceMapId?: string;
  readonly sourcePath?: string;
  readonly sourceHash?: string;
  readonly target?: FrontierProjectionTarget;
  readonly targetPath?: string;
  readonly targetHash?: string;
  readonly semanticIndexId?: string;
  readonly universalAstId?: string;
  readonly nativeAstId?: string;
  readonly nativeSourceId?: string;
  readonly sourceSpansBySemanticNodeId?: Readonly<Record<string, FrontierProjectionSourceSpan>>;
  readonly semanticSymbolIdsBySemanticNodeId?: Readonly<Record<string, string>>;
  readonly semanticOccurrenceIdsBySemanticNodeId?: Readonly<Record<string, string>>;
  readonly lossIdsBySemanticNodeId?: Readonly<Record<string, readonly string[]>>;
  readonly evidence?: readonly FrontierProjectionEvidenceRecord[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface FrontierProjectionTarget {
  readonly language?: string;
  readonly platform?: string;
  readonly packageName?: string;
  readonly emitPath?: string;
  readonly [key: string]: unknown;
}

export interface FrontierProjectionSourceSpan {
  readonly path?: string;
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
}

export interface FrontierProjectionGeneratedSpan extends FrontierProjectionSourceSpan {
  readonly target?: FrontierProjectionTarget;
  readonly targetPath?: string;
  readonly generatedName?: string;
}

export interface FrontierProjectionEvidenceRecord {
  readonly id: string;
  readonly kind?: string;
  readonly summary?: string;
  readonly [key: string]: unknown;
}

export interface FrontierProjectionSourceMapMapping {
  readonly id: string;
  readonly semanticNodeId: string;
  readonly nativeSourceId?: string;
  readonly semanticSymbolId?: string;
  readonly semanticOccurrenceId?: string;
  readonly sourceSpan?: FrontierProjectionSourceSpan;
  readonly generatedSpan: FrontierProjectionGeneratedSpan;
  readonly target?: FrontierProjectionTarget;
  readonly generatedName?: string;
  readonly evidenceIds?: readonly string[];
  readonly lossIds?: readonly string[];
  readonly precision: 'declaration';
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface FrontierProjectionSourceMap {
  readonly kind: 'frontier.lang.sourceMap';
  readonly version: 1;
  readonly id: string;
  readonly sourcePath?: string;
  readonly sourceHash?: string;
  readonly target?: FrontierProjectionTarget;
  readonly targetPath?: string;
  readonly targetHash?: string;
  readonly semanticIndexId?: string;
  readonly universalAstId?: string;
  readonly nativeAstId?: string;
  readonly nativeSourceId?: string;
  readonly mappings: readonly FrontierProjectionSourceMapMapping[];
  readonly evidence: readonly FrontierProjectionEvidenceRecord[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface JavaScriptSourceMapResult {
  readonly code: string;
  readonly sourceMap: FrontierProjectionSourceMap;
}

export interface EmitJavaScriptWithSourceMapResult extends JavaScriptSourceMapResult {
  readonly ast: JavaScriptAstModule;
}

export interface JavaScriptSourceRef {
  readonly semanticNodeId: string;
  readonly semanticNodeKind?: string;
  readonly semanticNodeName?: string;
  readonly regionIds?: readonly string[];
}

export type JavaScriptAstDeclaration =
  | { readonly kind: 'exportConst'; readonly name: string; readonly value: unknown; readonly freeze?: boolean; readonly sourceRef?: JavaScriptSourceRef }
  | { readonly kind: 'exportFunction'; readonly name: string; readonly params: readonly string[]; readonly body: readonly string[]; readonly sourceRef?: JavaScriptSourceRef }
  | { readonly kind: 'viewRenderFunction'; readonly name: string; readonly renders: readonly unknown[]; readonly sourceRef?: JavaScriptSourceRef };

export interface JavaScriptAstModule {
  readonly kind: 'javascript.module';
  readonly banner: string;
  readonly declarations: readonly JavaScriptAstDeclaration[];
}

export declare function toJavaScriptAst(document: FrontierLangDocument, options?: EmitJavaScriptOptions): JavaScriptAstModule;
export declare function renderJavaScriptAst(ast: JavaScriptAstModule): string;
export declare function renderJavaScriptAstWithSourceMap(ast: JavaScriptAstModule, options?: EmitJavaScriptOptions): JavaScriptSourceMapResult;
export declare function emitJavaScript(document: FrontierLangDocument, options?: EmitJavaScriptOptions): string;
export declare function emitJavaScriptWithSourceMap(document: FrontierLangDocument, options?: EmitJavaScriptOptions): EmitJavaScriptWithSourceMapResult;
