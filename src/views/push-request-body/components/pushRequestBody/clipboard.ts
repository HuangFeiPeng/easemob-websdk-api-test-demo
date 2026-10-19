export interface CopyFallbackTarget {
  focus: () => void;
  select: () => void;
}

export const copyTextWithFallback = async (
  text: string,
  fallbackTarget: CopyFallbackTarget,
): Promise<boolean> => {
  let clipboardSucceeded = false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      clipboardSucceeded = true;
    } catch {
      clipboardSucceeded = false;
    }
  }
  if (clipboardSucceeded) return true;
  let legacySucceeded = false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    legacySucceeded = document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch {
    legacySucceeded = false;
  }
  if (legacySucceeded) return true;
  fallbackTarget.focus();
  fallbackTarget.select();
  return false;
};
