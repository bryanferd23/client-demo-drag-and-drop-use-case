import { ImageUpload } from "@/components/demo/ImageUpload";

export default function ImageUploadPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          Image Upload
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A robust drag-and-drop dropzone for image files. It features file validation, 
          real-time previews, and persistent storage using localStorage.
        </p>
      </div>

      <ImageUpload />
    </div>
  );
}