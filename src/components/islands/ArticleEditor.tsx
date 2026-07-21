import React, { useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

/**
 * Extracts plain text from an array of BlockNote inline content elements,
 * preserving bold/italic marks as Portable Text mark objects.
 */
function inlineContentToPortableTextChildren(content: any[]): any[] {
  return content.map((item: any) => {
    if (item.type === "text") {
      const marks: string[] = [];
      if (item.styles?.bold) marks.push("strong");
      if (item.styles?.italic) marks.push("em");
      if (item.styles?.underline) marks.push("underline");
      if (item.styles?.strike) marks.push("strike-through");
      if (item.styles?.code) marks.push("code");
      return {
        _type: "span",
        _key: Math.random().toString(36).slice(2),
        text: item.text,
        marks,
      };
    }
    if (item.type === "link") {
      // Flatten link content as plain text for now
      return {
        _type: "span",
        _key: Math.random().toString(36).slice(2),
        text: item.content?.map((c: any) => c.text ?? "").join("") ?? "",
        marks: [],
      };
    }
    return { _type: "span", _key: Math.random().toString(36).slice(2), text: "", marks: [] };
  });
}

interface ArticleEditorProps {
  /** Initial Portable Text value (not yet used for seeding) */
  value?: any;
  /** Called on every content change with Portable Text blocks */
  onChange: (value: any[]) => void;
  placeholder?: string;
}

/**
 * Rich-text editor island powered by BlockNote 0.52 + Mantine theme.
 * Converts editor state to Portable Text on every change.
 */
const ArticleEditor: React.FC<ArticleEditorProps> = ({ value, onChange }) => {
  const editor = useCreateBlockNote();

  /** Convert BlockNote document to Portable Text and call onChange. */
  const handleChange = useCallback(() => {
    const doc = editor.document;
    const blocks: any[] = [];

    for (const block of doc) {
      // Determine Portable Text style from block type
      let style = "normal";
      switch (block.type) {
        case "paragraph":
          style = "normal";
          break;
        case "heading": {
          const level = Math.min((block.props as any).level ?? 1, 3);
          style = `h${level}`;
          break;
        }
        case "quote":
          style = "blockquote";
          break;
        case "bulletListItem":
          style = "bullet";
          break;
        case "numberedListItem":
          style = "number";
          break;
        case "checkListItem":
          style = "bullet";
          break;
        default:
          style = "normal";
      }

      const children = inlineContentToPortableTextChildren(
        Array.isArray((block as any).content) ? (block as any).content : []
      );

      // Only include block if it has actual text
      const hasText = children.some((c: any) => c.text?.trim());
      if (hasText) {
        blocks.push({
          _type: "block",
          _key: (block as any).id ?? Math.random().toString(36).slice(2),
          style,
          children,
          markDefs: [],
        });
      }
    }

    // Always emit at least one empty block
    if (blocks.length === 0) {
      blocks.push({
        _type: "block",
        _key: "empty",
        style: "normal",
        children: [{ _type: "span", _key: "empty-span", text: "", marks: [] }],
        markDefs: [],
      });
    }

    onChange(blocks);
  }, [editor, onChange]);

  return (
    <div
      style={{
        minHeight: "280px",
        border: "1px solid var(--color-hairline-strong, #cbd5e1)",
        borderRadius: "6px",
        overflow: "hidden",
        background: "var(--color-surface-card, #fff)",
      }}
    >
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        editable={true}
        data-theming-css-variables-demo
      />
    </div>
  );
};

export default ArticleEditor;