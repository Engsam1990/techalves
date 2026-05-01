export declare function resolveUploadsDir(): string;
export declare function saveBase64Upload({ filename, contentType, data }: {
    filename?: string;
    contentType?: string;
    data?: string;
}): {
    filePath: string;
    url: string;
};
export declare function deleteUploadedFileByUrl(url: string): boolean;
//# sourceMappingURL=uploads.d.ts.map