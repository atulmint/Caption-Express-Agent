/**
 * Document Sandbox Code for CaptionCraft AI
 * 
 * This code runs in the Adobe Express document sandbox and provides
 * APIs to insert generated captions directly into the canvas as text elements.
 */

import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the runtime from the sandbox SDK
const { runtime } = addOnSandboxSdk.instance;

/**
 * Document Sandbox API
 * Exposes methods to the UI runtime for document manipulation
 */
interface SandboxApi {
  insertTextIntoCanvas(text: string): Promise<boolean>;
}

/**
 * Insert text into the current Adobe Express canvas
 * Creates a styled text element and adds it to the current artboard
 */
async function insertTextIntoCanvas(text: string): Promise<boolean> {
  try {
    // Create a new text node with the caption content
    const textNode = editor.createText(text);
    
    // Get the insertion parent (current artboard/container)
    const insertionParent = editor.context.insertionParent;
    
    if (!insertionParent) {
      console.error('No insertion parent available');
      return false;
    }
    
    // Append the text node to the current artboard
    insertionParent.children.append(textNode);
    
    // Position the text in a visible area
    // Get the page/artboard dimensions to center the text
    const artboard = insertionParent;
    
    // Check if we can get width/height from the artboard
    if ('width' in artboard && 'height' in artboard) {
      const artboardWidth = (artboard as { width: number }).width;
      const artboardHeight = (artboard as { height: number }).height;
      
      // Position text in the center-ish area of the artboard
      const xPos = artboardWidth * 0.1; // 10% from left
      const yPos = artboardHeight * 0.4; // 40% from top
      
      textNode.setPositionInParent(
        { x: xPos, y: yPos },
        { x: 0, y: 0 }
      );
    } else {
      // Default positioning if we can't get dimensions
      textNode.setPositionInParent(
        { x: 50, y: 100 },
        { x: 0, y: 0 }
      );
    }
    
    // Select the newly created text so user can see it and modify if needed
    editor.context.selection = [textNode];
    
    console.log('Text inserted successfully');
    return true;
  } catch (error) {
    console.error('Failed to insert text:', error);
    return false;
  }
}

/**
 * Start the sandbox and expose APIs to the UI runtime
 */
function start(): void {
  // Define the API to expose to the UI
  const sandboxApi: SandboxApi = {
    insertTextIntoCanvas
  };
  
  // Expose the API to the UI runtime
  runtime.exposeApi(sandboxApi);
  
  console.log('CaptionCraft AI: Document sandbox initialized');
}

// Initialize the sandbox
start();
