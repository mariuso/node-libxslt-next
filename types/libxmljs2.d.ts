// Minimal type definitions for libxmljs2
// Based on libxmljs2 API

declare module "libxmljs2" {
    export interface ParserOptions {
        noblanks?: boolean;
        noent?: boolean;
        nocdata?: boolean;
        noerror?: boolean;
        nowarning?: boolean;
        pedantic?: boolean;
        nonet?: boolean;
        nocompact?: boolean;
        dtdload?: boolean;
        dtdattr?: boolean;
        dtdvalid?: boolean;
        nobasefix?: boolean;
        huge?: boolean;
        oldsax?: boolean;
        ignorenc?: boolean;
        biglines?: boolean;
    }

    export interface Node {
        doc(): Document;
        parent(): Node | null;
        namespace(): Namespace | null;
        namespacePrefix(): string | null;
        namespaceHref(): string | null;
        type(): string;
        name(): string;
        text(): string;
        text(text: string): Node;
        toString(): string;
        remove(): void;
    }

    export interface Element extends Node {
        name(): string;
        name(name: string): Element;
        attr(name: string): Attribute | null;
        attr(attr: Attribute): Element;
        attr(name: string, value: string): Element;
        attrs(): Attribute[];
        child(idx: number): Node | null;
        childNodes(): Node[];
        addChild(child: Node): Node;
        node(name: string): Element;
        node(name: string, content: string): Element;
        text(): string;
        text(text: string): Element;
        find(xpath: string): Node[];
        get(xpath: string): Node | null;
    }

    export interface Attribute {
        name(): string;
        namespace(): Namespace | null;
        value(): string;
        value(value: string): Attribute;
        node(): Element;
        remove(): void;
    }

    export interface Namespace {
        href(): string;
        prefix(): string;
    }

    export interface Document {
        root(): Element | null;
        root(node: Element): Document;
        encoding(): string;
        encoding(encoding: string): Document;
        version(): string;
        find(xpath: string): Node[];
        get(xpath: string): Node | null;
        node(name: string): Element;
        toString(): string;
        validate(schema: Document): boolean;
    }

    export interface SyntaxError {
        message: string;
        code: number;
        line: number;
        column: number;
        level: number;
        file: string | null;
    }

    export function parseXml(source: string, options?: ParserOptions): Document;
    export function parseHtml(source: string, options?: ParserOptions): Document;
    export function parseHtmlFragment(source: string, options?: ParserOptions): Document;

    export const version: string;
    export const libxml_version: string;
    export const libxml_parser_version: string;
    export const libxml_debug_enabled: boolean;

    export function memoryUsage(): number;
    export function nodeCount(): number;

    export class Comment extends Node {}
    export class Text extends Node {}
    export class ProcessingInstruction extends Node {}
}