import fs from 'fs';
import path from 'path';

export interface Document {
  content: string;
  metadata: {
    filename: string;
    filepath: string;
  };
}

/**
 * Reads all .md files from the docs directory and returns them
 * as an array of { content, metadata } objects.
 */
export function loadMarkdownDocs(): Document[] {
  const docsDir = path.join(process.cwd(), 'src', 'rag', 'docs');
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));

  return files.map((filename) => {
    const filepath = path.join(docsDir, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    return {
      content,
      metadata: { filename, filepath },
    };
  });
}
