import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange?: (value: string) => void;
  onMultipleChange?: (values: string[]) => void;
  helperText?: string;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

async function uploadSingleFile(file: File) {
  const data = await readFileAsDataUrl(file);
  const result = await adminApi.uploadImage({ filename: file.name, contentType: file.type, data });
  return result.url;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  onMultipleChange,
  helperText,
  className,
  multiple = false,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFiles = async (files: File[]) => {
    if (disabled) return;
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      toast.error("Drop image files only");
      return;
    }

    setUploading(true);
    try {
      if (multiple) {
        const uploadedUrls: string[] = [];
        for (const file of imageFiles) {
          uploadedUrls.push(await uploadSingleFile(file));
        }
        onMultipleChange?.(uploadedUrls);
        if (!onMultipleChange && onChange && uploadedUrls[0]) {
          onChange(uploadedUrls[0]);
        }
        toast.success(uploadedUrls.length === 1 ? "Image uploaded" : `${uploadedUrls.length} images uploaded`);
      } else {
        const [file] = imageFiles;
        const url = await uploadSingleFile(file);
        onChange?.(url);
        toast.success("Image uploaded");
      }
    } catch (error: any) {
      toast.error(error.message || "Could not upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadFiles(Array.from(event.target.files || []));
  };

  const handleDrop = async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await uploadFiles(Array.from(event.dataTransfer.files || []));
  };

  const dragHandlers = {
    onDragEnter: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled) event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false);
    },
    onDrop: handleDrop,
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={handleSelect} disabled={disabled} />
      {value && !multiple ? (
        <div
          {...dragHandlers}
          className={cn("overflow-hidden rounded-xl border bg-card transition-colors", isDragging && "border-primary bg-primary/5")}
        >
          <div className="aspect-[16/9] bg-muted">
            <img src={value} alt={label} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t p-3">
            <Button type="button" variant="outline" size="sm" onClick={() => !disabled && inputRef.current?.click()} disabled={uploading || disabled}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange?.("") } disabled={disabled}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || disabled}
          {...dragHandlers}
          className={cn(
            "flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-4 text-center transition-colors hover:border-primary hover:bg-primary/5",
            isDragging && "border-primary bg-primary/10"
          )}
        >
          {uploading ? <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary" /> : <ImagePlus className="mb-3 h-6 w-6 text-primary" />}
          <span className="font-medium">{uploading ? `Uploading ${multiple ? "images" : "image"}...` : multiple ? "Upload image(s)" : "Upload image"}</span>
          <span className="mt-1 text-sm text-muted-foreground">
            {multiple ? "Drag photos here or select one or multiple photos." : "Drag a photo here or select PNG, JPG, WEBP or GIF up to 6MB"}
          </span>
        </button>
      )}
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}
