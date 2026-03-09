export interface FileHandler {
  uploadFile(
    file: any,
    folder: string,
    filename: string,
  ): Promise<string | null>;

  deleteFile(fileUrl: string): Promise<string | null>;

  extractFileId(fileUrl: string): string | null;
}
