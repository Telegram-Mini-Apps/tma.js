/**
 * Copies specified text to the clipboard.
 * @param text - text to copy.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  try {
    const { clipboard } = navigator;
    if (clipboard) {
      return await clipboard.writeText(text);
    }
  } catch {
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}
