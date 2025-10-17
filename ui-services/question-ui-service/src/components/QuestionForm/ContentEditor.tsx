import React, { useEffect, useRef, useState } from "react";
import FormField from "./FormField";
import * as Quill from "quill";
import "quill/dist/quill.snow.css";
import "@/styles/quill.peerprep-theme";
import "@/styles/quill.peerprep-theme.css";

interface ContentEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  height?: string;
  maxHeight?: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  label = "Content (HTML allowed) *",
  value,
  onChange,
  error,
  height = "30vh",
  maxHeight = "60vh",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill.default | null>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill.default(editorRef.current, {
        theme: "peerprep",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["link", "image"],
            ["clean"],
          ],
        },
        placeholder: "Enter the question description...",
      });

      quillRef.current.root.style.fontFamily = "monospace";
      quillRef.current.root.style.overflowY = "auto";
      quillRef.current.root.style.height = "100%";

      const delta = quillRef.current.clipboard.convert({ html: value });
      quillRef.current.setContents(delta, "silent");

      quillRef.current.on("text-change", () => {
        if (!isHtmlMode) {
          const html = quillRef.current!.root.innerHTML;
          onChange(html);
          setHtmlValue(html);
        }
      });
    }
  }, [editorRef, onChange, value, isHtmlMode]);

  useEffect(() => {
    setHtmlValue(value);
    if (quillRef.current && !isHtmlMode) {
      const delta = quillRef.current.clipboard.convert({ html: value });
      quillRef.current.setContents(delta, "silent");
    }
  }, [value, isHtmlMode]);

  const handleToggleMode = () => {
    if (!isHtmlMode && quillRef.current) {
      setHtmlValue(quillRef.current.root.innerHTML);
    } else if (isHtmlMode && quillRef.current) {
      const delta = quillRef.current.clipboard.convert({ html: htmlValue });
      quillRef.current.setContents(delta, "silent");
    }
    setIsHtmlMode(!isHtmlMode);
  };

  return (
    <FormField label={label} error={error}>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          className={`px-3 py-1 rounded ${
            !isHtmlMode ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"
          }`}
          onClick={() => !isHtmlMode || handleToggleMode()}
        >
          Editor
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded ${
            isHtmlMode ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"
          }`}
          onClick={handleToggleMode}
        >
          HTML
        </button>
      </div>

      <div
        style={{ position: "relative", height, maxHeight }}
        className="rounded"
      >
        {/* Quill Editor */}
        <div
          ref={editorRef}
          className="bg-gray-700 text-white h-full w-full rounded"
        />

        {/* HTML overlay */}
        {isHtmlMode && (
          <textarea
            value={htmlValue}
            onChange={(e) => {
              setHtmlValue(e.target.value);
              onChange(e.target.value);
            }}
            className="absolute top-0 left-0 w-full p-2 border border-gray-700 bg-gray-800 text-white font-mono resize-none"
            style={{
              height: `calc(100% + 40px)`,
              boxSizing: "border-box",
            }}
          />
        )}
      </div>
    </FormField>
  );
};

export default ContentEditor;
