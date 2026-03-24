import { useCallback, useMemo } from "react";
interface IShareConfig {
  title: string;
  text?: string;
  url: string;
  files?: File[];
}

/**
 * Use native web share dialog when available
 * @param onSuccess function called on successfully sharing content
 * @param onError callback function called on error sharing content
 * @example
 * const { isSupported, share } = useWebShare(successFn, errorFn);
 */
function useWebShare(onSuccess = () => null, onError = () => null) {
  const isSupported = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.share,
    []
  );

  const share = useCallback(
    (config: Partial<IShareConfig>) => {
      const url = getUrl(config.url);
      const title = config.title || document.title;
      const text = config.text;
      const files = config.files;
      navigator
        .share({ text, title, url, files })
        .then(onSuccess)
        .catch(onError);
    },
    [onSuccess, onError]
  );

  return {
    loading: false,
    isSupported,
    share,
  };
}

/**
 * Get the URL to be shared.
 * If the site uses canonical URL, then use that URL otherwise the current URL
 * @param url URL that might be passed on by the user
 */
function getUrl(url?: string): string {
  if (!!url) {
    return url;
  } else {
    const canonicalEl = document.querySelector(
      "link[rel=canonical]"
    ) as HTMLLinkElement;
    return canonicalEl ? canonicalEl.href : window.location.href;
  }
}
export default useWebShare;
