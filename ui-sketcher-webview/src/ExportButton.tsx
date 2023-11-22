import { useEditor } from "@tldraw/tldraw";
import { useState } from "react";
import { useMakeReal } from "./lib/useMakeReal";

export const ExportButton = () => {
  const editor = useEditor();
  const { makeReal } = useMakeReal();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await makeReal(editor);
    setTimeout(() => {
      // TODO: Fake loading to prevent double clicks, to improve
      setLoading(false);
    }, 3000);
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="p-2 cursor-pointer"
      style={{ zIndex: 100000, pointerEvents: "all" }}
    >
      <div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-60">
        {loading ? "Casting magic" : "Make Real"}
      </div>
    </button>
  );
};
