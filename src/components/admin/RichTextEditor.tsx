import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeEditorValue = (value: string) => {
  const text = String(value || "");
  if (!text.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return `<p>${escapeHtml(text).replace(/\n/g, "<br />")}</p>`;
};

const toolbar = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: UnderlineIcon, label: "Underline", command: "underline" },
  { icon: Heading2, label: "Heading", command: "formatBlock", value: "<h2>" },
  { icon: Quote, label: "Quote", command: "formatBlock", value: "<blockquote>" },
  { icon: List, label: "Bullets", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
];

const alignTools = [
  { icon: AlignLeft, label: "Align left", command: "justifyLeft" },
  { icon: AlignCenter, label: "Align center", command: "justifyCenter" },
  { icon: AlignRight, label: "Align right", command: "justifyRight" },
  { icon: AlignJustify, label: "Justify", command: "justifyFull" },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 180, disabled = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);

  const normalizedValue = useMemo(() => normalizeEditorValue(value), [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue;
    }
  }, [normalizedValue]);

  const emitChange = () => {
    if (disabled) return;
    onChange(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command: string, commandValue?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const insertLink = () => {
    if (disabled) return;
    const url = window.prompt("Enter the link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  const clearFormatting = () => {
    if (disabled) return;
    runCommand("removeFormat");
    runCommand("unlink");
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        {toolbar.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => runCommand(item.command, item.value)}
            disabled={disabled}
            title={item.label}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
        <Separator orientation="vertical" className="mx-1 h-6" />
        {alignTools.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => runCommand(item.command)}
            disabled={disabled}
            title={item.label}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={insertLink} title="Insert link" disabled={disabled}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={clearFormatting} title="Clear formatting" disabled={disabled}>
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative">
        {!normalizedValue && !focused && placeholder && (
          <div className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          className={cn(
            "prose prose-sm max-w-none p-4 focus:outline-none prose-headings:font-display prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-muted-foreground",
            focused && "ring-2 ring-primary/20",
            disabled && "cursor-not-allowed bg-muted/40 opacity-80"
          )}
          style={{ minHeight }}
          onInput={emitChange}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
        />
      </div>
    </div>
  );
}
