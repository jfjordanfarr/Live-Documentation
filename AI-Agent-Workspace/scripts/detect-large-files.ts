/**
 * detect-large-files.ts
 * 
 * Scans Live Documentation files to find implementation-archetyped source files
 * that exceed a configurable line count threshold.
 * 
 * Usage: npx tsx AI-Agent-Workspace/scripts/detect-large-files.ts [--threshold 1000]
 */

import * as fs from 'fs';
import * as path from 'path';

interface LargeFile {
  sourcePath: string;
  liveDocPath: string;
  lineCount: number;
  archetype: string;
}

const LAYER4_ROOT = '.mdmd/layer-4';
const DEFAULT_THRESHOLD = 1000;

function parseArgs(): { threshold: number } {
  const args = process.argv.slice(2);
  let threshold = DEFAULT_THRESHOLD;
  
  const thresholdIdx = args.indexOf('--threshold');
  if (thresholdIdx !== -1 && args[thresholdIdx + 1]) {
    threshold = parseInt(args[thresholdIdx + 1], 10);
  }
  
  return { threshold };
}

function extractArchetype(content: string): string | null {
  const match = content.match(/Archetype:\s*(\w+)/i);
  return match ? match[1].toLowerCase() : null;
}

function extractSourcePath(liveDocPath: string): string {
  // Convert .mdmd/layer-4/path/to/file.ts.mdmd.md -> path/to/file.ts
  let sourcePath = liveDocPath
    .replace(/^\.mdmd\/layer-4\//, '')
    .replace(/\.mdmd\.md$/, '');
  return sourcePath;
}

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return -1;
  }
}

function walkDir(dir: string, callback: (filePath: string) => void): void {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile() && entry.name.endsWith('.mdmd.md')) {
      callback(fullPath);
    }
  }
}

function main(): void {
  const { threshold } = parseArgs();
  const largeFiles: LargeFile[] = [];
  
  console.log(`\n🔍 Scanning for implementation files exceeding ${threshold} lines...\n`);
  
  walkDir(LAYER4_ROOT, (liveDocPath) => {
    const content = fs.readFileSync(liveDocPath, 'utf-8');
    const archetype = extractArchetype(content);
    
    if (archetype !== 'implementation') {
      return;
    }
    
    const sourcePath = extractSourcePath(liveDocPath);
    const lineCount = countLines(sourcePath);
    
    if (lineCount > threshold) {
      largeFiles.push({
        sourcePath,
        liveDocPath,
        lineCount,
        archetype
      });
    }
  });
  
  // Sort by line count descending
  largeFiles.sort((a, b) => b.lineCount - a.lineCount);
  
  if (largeFiles.length === 0) {
    console.log(`✅ No implementation files exceed ${threshold} lines.`);
    return;
  }
  
  console.log(`⚠️  Found ${largeFiles.length} implementation file(s) exceeding ${threshold} lines:\n`);
  console.log('| Lines | File |');
  console.log('|-------|------|');
  
  for (const file of largeFiles) {
    console.log(`| ${file.lineCount.toString().padStart(5)} | ${file.sourcePath} |`);
  }
  
  console.log('\n📊 Summary by directory:\n');
  
  const byDir = new Map<string, { count: number; totalLines: number }>();
  for (const file of largeFiles) {
    const dir = path.dirname(file.sourcePath);
    const existing = byDir.get(dir) || { count: 0, totalLines: 0 };
    existing.count++;
    existing.totalLines += file.lineCount;
    byDir.set(dir, existing);
  }
  
  for (const [dir, stats] of Array.from(byDir.entries()).sort((a, b) => b[1].totalLines - a[1].totalLines)) {
    console.log(`  ${dir}: ${stats.count} file(s), ${stats.totalLines} total lines`);
  }
}

main();
