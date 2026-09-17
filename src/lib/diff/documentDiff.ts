export interface DiffHunk {
  type: 'added' | 'deleted' | 'unchanged';
  text: string;
  lineNumberOld?: number;
  lineNumberNew?: number;
}

export interface DocumentDiffResult {
  versionOldNumber: number;
  versionNewNumber: number;
  addedLinesCount: number;
  deletedLinesCount: number;
  unchangedLinesCount: number;
  hunks: DiffHunk[];
  summary: {
    text: string;
    isAiGenerated: boolean;
    modeLabel: '[LIVE AI Summary]' | '[OFFLINE Summary]';
    sourceReferences: string[];
  };
}

/**
 * Deterministic line-by-line text diffing engine.
 * Computes exact additions, deletions, and unchanged blocks between two versions.
 */
export function computeDocumentDiff(
  oldText: string,
  newText: string,
  versionOldNumber: number = 1,
  versionNewNumber: number = 2,
  isLiveAi: boolean = false
): DocumentDiffResult {
  const oldLines = oldText ? oldText.split('\n') : [];
  const newLines = newText ? newText.split('\n') : [];

  const hunks: DiffHunk[] = [];
  let addedCount = 0;
  let deletedCount = 0;
  let unchangedCount = 0;

  // Simple, deterministic longest common subsequence / line diff algorithm
  let oldIdx = 0;
  let newIdx = 0;
  let oldLineNo = 1;
  let newLineNo = 1;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length && oldLines[oldIdx] === newLines[newIdx]) {
      hunks.push({
        type: 'unchanged',
        text: oldLines[oldIdx],
        lineNumberOld: oldLineNo++,
        lineNumberNew: newLineNo++,
      });
      unchangedCount++;
      oldIdx++;
      newIdx++;
    } else {
      // Lookahead to check if old line appears later in newLines
      const matchInNew = newLines.slice(newIdx).indexOf(oldLines[oldIdx]);
      // Lookahead to check if new line appears later in oldLines
      const matchInOld = oldLines.slice(oldIdx).indexOf(newLines[newIdx]);

      if (oldIdx < oldLines.length && (matchInNew === -1 || (matchInOld !== -1 && matchInOld < matchInNew))) {
        hunks.push({
          type: 'deleted',
          text: oldLines[oldIdx],
          lineNumberOld: oldLineNo++,
        });
        deletedCount++;
        oldIdx++;
      } else if (newIdx < newLines.length) {
        hunks.push({
          type: 'added',
          text: newLines[newIdx],
          lineNumberNew: newLineNo++,
        });
        addedCount++;
        newIdx++;
      } else {
        // Fallback for trailing old lines
        hunks.push({
          type: 'deleted',
          text: oldLines[oldIdx],
          lineNumberOld: oldLineNo++,
        });
        deletedCount++;
        oldIdx++;
      }
    }
  }

  // Generate deterministic grounded summary from diff hunks
  const addedDiffs = hunks.filter((h) => h.type === 'added' && h.text.trim().length > 0);
  const deletedDiffs = hunks.filter((h) => h.type === 'deleted' && h.text.trim().length > 0);

  const sourceReferences: string[] = [];
  if (addedDiffs.length > 0) sourceReferences.push(`Added Hunks: ${addedDiffs.length} line(s)`);
  if (deletedDiffs.length > 0) sourceReferences.push(`Removed Hunks: ${deletedDiffs.length} line(s)`);

  let summaryText = `Version ${versionOldNumber} to Version ${versionNewNumber} comparison: `;
  if (addedCount === 0 && deletedCount === 0) {
    summaryText += 'No textual changes detected between document versions.';
  } else {
    summaryText += `Document updated with ${addedCount} line(s) added and ${deletedCount} line(s) removed. Key changes focused on Section ${
      addedDiffs[0]?.lineNumberNew || 1
    } provisions.`;
  }

  return {
    versionOldNumber,
    versionNewNumber,
    addedLinesCount: addedCount,
    deletedLinesCount: deletedCount,
    unchangedLinesCount: unchangedCount,
    hunks,
    summary: {
      text: summaryText,
      isAiGenerated: isLiveAi,
      modeLabel: isLiveAi ? '[LIVE AI Summary]' : '[OFFLINE Summary]',
      sourceReferences,
    },
  };
}
