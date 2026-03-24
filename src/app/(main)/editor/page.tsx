import { PlateEditor } from "~/components/editor/plate-editor";

export default function Page() {
  return (
    <div className="h-[calc(100vh-80px)] w-full" data-registry="plate">
      <PlateEditor />
    </div>
  );
}
