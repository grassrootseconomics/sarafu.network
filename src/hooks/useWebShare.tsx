import { useEffect, useState } from "react";
interface IShareConfig {
  title: string;
  text?: string;
  url: string;
}

/**
 * Use native web share dialog when available
 * @param onSuccess function called on successfully sharing content
 * @param onError callback function called on error sharing content
 * @example
 * const { isSupported, isLoading, share } = useWebShare(successFn, errorFn);
 */
function useWebShare(onSuccess = () => null, onError = () => null) {
  const [loading, setLoading] = useState(true);
  const [isSupported, setSupport] = useState(false);

  useEffect(() => {
    if (!!navigator.share) {
      setSupport(true);
    } else {
      setSupport(false);
    }
    setLoading(false);
  }, [onSuccess, onError]);

  return {
    loading,
    isSupported,
    share: shareContent(onSuccess, onError),
  };
}

/**
 * Trigger native share popup
 */
function shareContent(onSuccess: () => void, onError: () => void) {
  return function (config: Partial<IShareConfig>) {
    const url = getUrl(config.url);
    const title = config.title || document.title;
    const text = config.text;
    navigator.share({ text, title, url }).then(onSuccess).catch(onError);
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
