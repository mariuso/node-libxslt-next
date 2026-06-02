// Type definitions for libxslt-next
// Project: https://github.com/mariuso/node-libxslt-next
// Definitions by: libxslt-next contributors
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0

/// <reference path="./types/libxmljs2.d.ts" />
import * as libxmljs from "libxmljs2";

export { libxmljs };

export interface ApplyOptions {
    outputFormat?: "string" | "document" | undefined;
    noWrapParams?: boolean | undefined;
}

export interface Stylesheet {
    // Synchronous apply methods
    apply(source: string): string;
    apply(source: libxmljs.Document): libxmljs.Document;
    apply(source: string, params: object): string;
    apply(source: libxmljs.Document, params: object): libxmljs.Document;
    apply(source: string, params: object, options: ApplyOptions): string | libxmljs.Document;
    apply(source: libxmljs.Document, params: object, options: ApplyOptions): string | libxmljs.Document;

    // Asynchronous apply methods with callbacks
    apply(source: string, callback: ApplyStringCallback): void;
    apply(source: libxmljs.Document, callback: ApplyDocumentCallback): void;
    apply(source: string, params: object, callback: ApplyStringCallback): void;
    apply(source: libxmljs.Document, params: object, callback: ApplyDocumentCallback): void;
    apply(source: string, params: object, options: ApplyOptions, callback: ApplyCallback): void;
    apply(source: libxmljs.Document, params: object, options: ApplyOptions, callback: ApplyCallback): void;

    // File-based apply methods
    applyToFile(sourcePath: string, callback: ApplyStringCallback): void;
    applyToFile(sourcePath: string, params: object, callback: ApplyStringCallback): void;
    applyToFile(sourcePath: string, params: object, options: ApplyOptions, callback: ApplyStringCallback): void;
}

export type ApplyCallback = (err: Error | null, result?: string | libxmljs.Document) => void;
export type ApplyStringCallback = (err: Error | null, result?: string) => void;
export type ApplyDocumentCallback = (err: Error | null, result?: libxmljs.Document) => void;
export type ParseCallback = (err: Error | null, stylesheet?: Stylesheet) => void;

// Synchronous parse methods
export function parse(source: string): Stylesheet;
export function parse(source: libxmljs.Document): Stylesheet;

// Asynchronous parse methods
export function parse(source: string, callback: ParseCallback): void;
export function parse(source: libxmljs.Document, callback: ParseCallback): void;

// File-based parse method (async only)
export function parseFile(sourcePath: string, callback: ParseCallback): void;