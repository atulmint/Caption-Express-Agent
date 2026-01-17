/**
 * Type declarations for Adobe Express Add-on SDK
 * These are minimal type definitions for the SDK imported from URL
 */

declare module 'https://express.adobe.com/static/add-on-sdk/sdk.js' {
  interface ClientStorage {
    getItem(key: string): Promise<unknown>;
    setItem(key: string, value: unknown): Promise<void>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
  }

  interface Runtime {
    type: string;
    exposeApi?<T>(apiObj: T): void;
    apiProxy?<T>(runtimeType: string): Promise<T>;
  }

  interface AddOnInstance {
    runtime: Runtime;
    manifest: Record<string, unknown>;
    clientStorage: ClientStorage;
    entrypointType: string;
  }

  interface Application {
    ui: {
      theme: string;
      locale: string;
      format: string;
    };
    document: unknown;
    oauth: unknown;
    currentUser: unknown;
    on(event: string, handler: (data: unknown) => void): void;
    off(event: string, handler: (data: unknown) => void): void;
  }

  interface AddOnSDKAPI {
    apiVersion: string;
    ready: Promise<void>;
    instance: AddOnInstance;
    app: Application;
    constants: unknown;
  }

  const addOnSDKAPI: AddOnSDKAPI;
  export default addOnSDKAPI;
  export { AddOnSDKAPI, AddOnInstance, Runtime, ClientStorage, Application };
}

declare module 'add-on-sdk-document-sandbox' {
  interface Runtime {
    type: string;
    exposeApi<T>(obj: T): void;
    apiProxy<T>(runtimeType: string): Promise<T>;
  }

  interface AddOn {
    runtime: Runtime;
  }

  interface AddOnDocumentSandboxSdk {
    instance: AddOn;
  }

  const addOnSandboxSdk: AddOnDocumentSandboxSdk;
  export default addOnSandboxSdk;
  export { Runtime, AddOn, AddOnDocumentSandboxSdk };
}

declare module 'express-document-sdk' {
  interface Point {
    x: number;
    y: number;
  }

  interface ContainerNode {
    children: {
      append(node: Node): void;
      remove(node: Node): void;
    };
    width?: number;
    height?: number;
  }

  interface Node {
    setPositionInParent(parentPoint: Point, localPoint: Point): void;
  }

  interface TextNode extends Node {
    // Text node specific properties
  }

  interface Context {
    selection: Node[];
    insertionParent: ContainerNode;
  }

  interface Editor {
    createText(text: string): TextNode;
    context: Context;
  }

  export const editor: Editor;
  export { Point, ContainerNode, Node, TextNode, Context, Editor };
}
