import { download } from "./download";

// Helper function to convert SVG to Canvas
const convertSVGToCanvas = (svg: SVGSVGElement, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
  });
};

export const svgToPNG = async (
  svg: SVGSVGElement,
  filename: string
): Promise<File> => {
  const canvas = document.createElement("canvas");
  const convertedCanvas = await convertSVGToCanvas(svg, canvas);

  return new Promise<File>((resolve, reject) => {
    convertedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(new File([blob], filename, { type: "image/png" }));
    });
  });
};

export const downloadSVGAsPNG = async (
  svg: SVGSVGElement,
  filename: string
) => {
  const canvas = document.createElement("canvas");
  const convertedCanvas = await convertSVGToCanvas(svg, canvas);

  const pngFile = convertedCanvas.toDataURL("image/png");
  download(pngFile, filename);
};
