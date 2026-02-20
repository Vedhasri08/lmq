import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      console.log("Fetched documents:", docs);
      setDocuments(docs);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    console.log("UPLOAD CLICKED");
    e.preventDefault();

    console.log("UPLOAD FILE:", uploadFile);
    console.log("IS FILE:", uploadFile instanceof File);
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      await fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      );
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 shadow-sm">
                <FileText className="w-7 h-7 text-blue-600" strokeWidth={1.8} />
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No documents yet
              </h3>

              <p className="text-sm text-slate-500 mb-6">
                Upload your first PDF to start learning with flashcards and
                quizzes generated from your content.
              </p>

              {/* Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-500  hover:from-blue-600 hover:to-sky-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Upload document
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#e5e7eb]">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date Modified
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Flashcards
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Quiz
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Size
              </th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {documents?.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDelete={handleDeleteRequest}
              />
            ))}
          </tbody>
        </table>

        {/* Footer / Pagination style */}
        <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing {documents.length} documents
          </p>

          <div className="flex gap-2"></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]" />

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight pb-1.5">
                My Documents
              </h1>
              <p className="text-slate-500 text-sm mt-1 ">
                {" "}
                Your personal library of knowledge and study resources.
              </p>
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 
             bg-[#1E293B] hover:bg-[#0F172A]
             text-white text-sm font-semibold rounded-lg 
             shadow-md shadow-[#1E293B]/20 
             transition-all duration-200 active:scale-[0.98]"
            >
              <Upload size={16} />
              Upload New
            </button>
          </div>

          {renderContent()}
        </div>

        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
              {/* Header */}
              <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Upload New Document
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Add a PDF document to your academic library.
                  </p>
                </div>

                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleUpload} className="px-8 py-4 space-y-6">
                {/* Document Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Document Name
                  </label>

                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    placeholder="e.g. Advanced React Patterns"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl 
                     focus:ring-2 focus:ring-[#B59A5A] focus:border-[#4F9CF9]
                     outline-none transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    PDF File
                  </label>

                  <div
                    className="relative group cursor-pointer border-2 border-dashed border-slate-200 
                        hover:border-[#4F9CF9] rounded-2xl bg-[#F9FAFB] transition-all"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />

                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#1E293B]
/5 rounded-2xl transition-opacity"
                    />

                    <div className="flex flex-col items-center justify-center py-10 px-6">
                      <div className="mb-4 bg-white p-4 rounded-full shadow-sm text-[#4F9CF9]">
                        <Upload className="w-7 h-7" strokeWidth={2} />
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        {uploadFile ? (
                          <span className="text-[#4F9CF9] font-semibold">
                            {uploadFile.name}
                          </span>
                        ) : (
                          <>
                            <span className="text-[#4F9CF9] font-bold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </>
                        )}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        PDF (Max 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-0 pt-2 pb-2 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={uploading}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 
                     hover:text-slate-900 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-10 py-2.5 bg-[#1E293B]
 hover:bg-[#a3874f]
                     text-white text-sm font-bold rounded-xl shadow-md
                     transition-all active:scale-95 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200">
              <div className="p-6">
                <div className="flex justify-between mb-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Confirm Delete
                  </h2>

                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-sm text-slate-600">
                  Are you sure you want to delete "{selectedDoc?.title}"?
                </p>

                <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-md border-l-2 border-[#4F9CF9]">
                  This action cannot be undone.
                </p>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg text-sm font-semibold shadow-sm transition"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentListPage;
