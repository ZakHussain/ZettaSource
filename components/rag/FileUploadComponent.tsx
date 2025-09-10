'use client';

import React, { useState, useEffect } from 'react';

interface FileUploadComponentProps {
  fieldName: string;
  maxFiles: number;
  onUpload: (files: File[]) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  fieldName,
  maxFiles,
  onUpload,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [hasSelectedFiles, setHasSelectedFiles] = useState<boolean>(false);

  useEffect(() => {
    setHasSelectedFiles(selectedFiles.length > 0);
  }, [selectedFiles]);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files).slice(0, maxFiles - selectedFiles.length);
      setSelectedFiles((prevFiles) => [...prevFiles, ...fileArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderFileList = () => {
    return selectedFiles.map((file, index) => (
      <div key={index} className="flex items-center justify-between p-2 border-b border-orange-200">
        <span className="text-black">{file.name}</span>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() => handleRemoveFile(index)}
        >
          &times;
        </button>
      </div>
    ));
  };

  return (
    <div className="m-4 p-4 border border-orange-200 rounded-lg shadow-md bg-orange-50">
      <h1 className="text-lg font-semibold mb-4 text-black">{fieldName}</h1>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="text-black border-dashed border-4 border-orange-300 h-32 flex justify-center items-center rounded-md bg-orange-100"
      >
        <label className="cursor-pointer text-center">
          <span className="text-brown-700 font-medium">
            Drag and drop files here, or click to select
          </span>
          <input
            type="file"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
        </label>
      </div>

      <div className="mt-4">
        {renderFileList()}
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-150"
            disabled={!hasSelectedFiles || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <svg
                className="w-4 h-4 mr-2 fill-current animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16 10a6 6 0 1 1-4-10v2a4 4 0 1 0 4 4h2z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-2 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16.707 5.293a1 1 0 0 1 0 1.414L10 13.414 7.293 10.707a1 1 0 0 1 1.414-1.414L10 11.586l5.293-5.293a1 1 0 0 1 1.414 0z" />
              </svg>
            )}
            Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;