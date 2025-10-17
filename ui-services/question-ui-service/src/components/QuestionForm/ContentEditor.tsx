import React, { useEffect, useRef } from "react";
import FormField from "./FormField";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "@/styles/quill.peerprep-theme";
import "@/styles/quill.peerprep-theme.css";

interface ContentEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  height?: string; // optional height
  maxHeight?: string; // optional max height
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
  const quillRef = useRef<Quill | null>(null);

  // Initialize Quill once
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
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
      quillRef.current.root.style.overflowY = "auto"; // enable scrolling
      quillRef.current.root.style.height = "100%"; // fill container

      quillRef.current.on("text-change", () => {
        onChange(quillRef.current!.root.innerHTML);
      });
    }
  }, [onChange]);

  // Sync external value
  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <FormField label={label} error={error}>
      <div
        ref={editorRef}
        className="bg-gray-700 text-white rounded"
        style={{ height, maxHeight }}
      />
    </FormField>
  );
};

export default ContentEditor;
