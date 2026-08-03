"use client";

import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from "react";
import { Upload, X, File, AlertCircle, Loader2, Coins, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Machine Learning",
  "NLP",
  "Computer Vision",
  "Finance & Economics",
  "Healthcare",
  "Climate & Environment",
  "Sports",
  "Social Science",
  "Other"
];

const LICENSES = [
  "MIT",
  "Apache 2.0",
  "CC-BY-4.0",
  "CC0 1.0",
  "GPL-3.0",
  "Custom"
];

const ALLOWED_TYPES = [".csv", ".json", ".xlsx", ".zip"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadDatasetPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTagInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.endsWith(",")) {
      const newTag = value.slice(0, -1).trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateFile = (selectedFile: File) => {
    setFileError("");
    
    if (selectedFile.size > MAX_SIZE_BYTES) {
      setFileError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return false;
    }

    const fileExtension = "." + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExtension)) {
      setFileError(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`);
      return false;
    }

    return true;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!file) {
      setSubmitError("Please select a file to upload.");
      return;
    }
    if (!title || !description || !category || !license) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          tags,
          license,
          fileSize: file.size,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload dataset");
      }

      const data = await res.json();
      
      // Show success toast
      setShowSuccessToast(true);

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      // Wait a moment for the toast to be seen before redirecting
      setTimeout(() => {
        router.push(`/datasets/${slug}`);
      }, 2000);
      
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred during upload. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 py-12 px-4 sm:px-6 lg:px-8 selection:bg-saffron-500/20">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Dataset</h1>
          <p className="text-slate-600">Share your data with the community. Please ensure your data is properly formatted and contains no PII.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Dataset Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                placeholder="e.g. Global Climate Indicators 2024"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors resize-y"
                placeholder="Describe what's in the dataset, how it was collected, and what it can be used for..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* License */}
              <div className="space-y-2">
                <label htmlFor="license" className="block text-sm font-medium text-slate-700">
                  License <span className="text-red-500">*</span>
                </label>
                <select
                  id="license"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Select a license</option>
                  {LICENSES.map(lic => (
                    <option key={lic} value={lic}>{lic}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                onKeyDown={handleTagKeyDown}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-colors"
                placeholder="Type tag and press comma or Enter (e.g. climate, timeseries)"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-saffron-100 border border-saffron-200 rounded-full text-saffron-800"
                    >
                      #{tag}
                      <button 
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-saffron-600 hover:text-red-600 focus:outline-none rounded-full p-0.5 hover:bg-saffron-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload Dropzone */}
            <div className="space-y-2 pt-4">
              <label className="block text-sm font-medium text-slate-700">
                Data File <span className="text-red-500">*</span>
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300
                  ${isDragging 
                    ? 'border-saffron-500 bg-saffron-50' 
                    : file 
                      ? 'border-slate-300 bg-slate-50 hover:border-saffron-300 hover:bg-slate-100' 
                      : 'border-slate-300 bg-slate-50 hover:border-saffron-300 hover:bg-slate-100'}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={ALLOWED_TYPES.join(",")}
                />

                {file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 bg-gradient-to-br from-saffron-100 to-orange-100 rounded-full">
                      <File className="w-8 h-8 text-saffron-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-900">{file.name}</div>
                    <div className="text-xs text-slate-500">{formatBytes(file.size)}</div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 relative z-10">
                    <div className={`p-4 rounded-full bg-slate-100 transition-colors duration-300 ${isDragging ? 'bg-saffron-100' : 'group-hover:bg-saffron-50'}`}>
                      <Upload className={`w-8 h-8 ${isDragging ? 'text-saffron-600' : 'text-slate-500 group-hover:text-saffron-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Drag & drop your file here or click to browse
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supported: {ALLOWED_TYPES.join(", ")} (Max: {MAX_SIZE_MB}MB)
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Subtle gradient glow on hover */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-saffron-500/0 via-saffron-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              
              {fileError && (
                <div className="flex items-center gap-1.5 text-sm text-red-600 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            {/* Success Message */}
            {showSuccessToast && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-2 bg-emerald-100 rounded-full shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Upload Successful!</p>
                  <p className="text-sm text-emerald-700 flex items-center gap-1 mt-0.5">
                    You earned <Coins className="w-3.5 h-3.5 text-saffron-600 inline" /> <span className="text-saffron-700 font-medium">+100 coins</span>
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <div className="px-3 py-1.5 rounded-full bg-saffron-50 border border-saffron-200 text-xs font-medium text-saffron-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  Earn 100 coins for this upload
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !!fileError || showSuccessToast}
                className={`
                  w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300
                  ${isSubmitting || !!fileError
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 hover:to-orange-700 shadow-sm hover:shadow-md active:scale-[0.99]'}
                  flex items-center justify-center gap-2
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Dataset
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
