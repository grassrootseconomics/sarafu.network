import { CameraIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { forwardRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "../ui/button";

const WebcamCapture = forwardRef<
  Webcam,
  { capturePhoto: () => void; onCancel: () => void }
>((props, ref) => {
  const [videoConstraints, setVideoConstraints] = useState({
    facingMode: "environment",
  });

  const rotateCamera = () => {
    setVideoConstraints((prev) => ({
      ...prev,
      facingMode: prev.facingMode === "environment" ? "user" : "environment",
    }));
  };

  return (
    <div className="fixed top-0 left-0 w-dvw h-dvh z-50 flex items-center justify-center bg-muted">
      <Webcam
        audio={false}
        ref={ref}
        screenshotFormat="image/jpeg"
        className="border-2 border-gray-300 mx-auto w-full"
        videoConstraints={videoConstraints}
      />
      <div className="absolute bottom-2 gap-4 left-[50%] translate-x-[-50%] flex items-center justify-center">
        <Button
          type="button"
          onClick={props.capturePhoto}
          variant="outline"
          className="w-10 h-10 p-2 rounded-full"
        >
          <CameraIcon className="w-full h-full" />
        </Button>
        <Button
          type="button"
          onClick={rotateCamera}
          variant="outline"
          className="w-10 h-10 p-2 rounded-full"
        >
          <RotateCcwIcon className="w-full h-full" />
        </Button>
      </div>
      <Button
        type="button"
        onClick={props.onCancel}
        variant="outline"
        className="absolute top-2 right-2 w-10 h-10 p-2 rounded-full"
      >
        <XIcon className="w-full h-full" />
      </Button>
    </div>
  );
});

WebcamCapture.displayName = "WebcamCapture";

export default WebcamCapture;
