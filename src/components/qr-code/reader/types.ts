import { type Result } from "@zxing/library";

export type QrReaderProps = {
  /**
   * Media track constraints object, to specify which camera and capabilities to use
   */
  constraints?: MediaTrackConstraints;
  /**
   * Called when an error occurs.
   */
  onResult: OnResultFunction;
  /**
   * Property that represents the view finder component
   */
  ViewFinder?: () => React.ReactElement<never, never> | null;
  /**
   * Property that represents the scan period
   */
  scanDelay?: number;
  /**
   * Property that represents the ID of the video element
   */
  videoId?: string;
  /**
   * Property that represents an optional className to modify styles
   */
  className?: string;
  /**
   * Property that represents a style for the container
   */
  containerStyle?: object;
  /**
   * Property that represents a style for the video container
   */
  videoContainerStyle?: object;
  /**
   * Property that represents a style for the video
   */
  videoStyle?: object;
};

export type OnResultFunction = (
  /**
   * The QR values extracted by Zxing
   */
  result?: Result | undefined | null,
  /**
   * The name of the exceptions thrown while reading the QR
   */
  error?: Error | undefined | null
) => void;

export type UseQrReaderHookProps = {
  /**
   * Media constraints object, to specify which camera and capabilities to use
   */
  constraints?: MediaTrackConstraints;
  /**
   * Callback for retrieving the result
   */
  onResult: OnResultFunction;
  /**
   * Property that represents the scan period
   */
  scanDelay?: number;
  /**
   * Property that represents the ID of the video element
   */
  videoId?: string;
};

export type UseQrReaderHook = (props: UseQrReaderHookProps) => {
  videoRef: React.RefObject<HTMLVideoElement>;
};
