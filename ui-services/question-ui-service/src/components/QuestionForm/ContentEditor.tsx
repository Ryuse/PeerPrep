import React, { useEffect, useRef } from "react";
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

      const editor = quillRef.current.root;
      editor.style.fontFamily = "monospace";
      editor.style.overflowY = "auto";
      editor.style.height = "100%";

      // Insert raw HTML tags as text
      quillRef.current.setText(value);

      quillRef.current.on("text-change", () => {
        onChange(quillRef.current!.getText());
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (quillRef.current && quillRef.current.getText() !== value) {
      quillRef.current.setText(value);
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
