// Social sharing helper: native share sheet on mobile, clipboard fallback elsewhere.
export type ShareResult = 'shared' | 'copied' | 'cancelled';

export async function shareContent(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  const { title, text, url } = opts;
  const nav = navigator as any;

  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title, text, url });
      return 'shared';
    } catch {
      // User cancelled the share sheet, or it failed. Fall through to copy.
      return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`.trim());
    return 'copied';
  } catch {
    return 'cancelled';
  }
}
