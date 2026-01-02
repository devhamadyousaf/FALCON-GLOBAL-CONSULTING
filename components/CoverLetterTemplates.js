import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoadingButton from './LoadingButton';
import { X } from 'lucide-react';

export default function CoverLetterTemplates({ userId, onTemplateSelect, selectedTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('text'); // 'text' or 'pdf'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const supabase = createClientComponentClient();

  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchTemplates();
    }
  }, [userId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      // Add a timeout to prevent stuck loading state
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`/api/cover-letter-templates?userId=${userId}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      } else {
        console.error('Error fetching templates:', data.error);
        setTemplates([]); // Set empty array on error
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Fetch templates timeout - request took too long');
      } else {
        console.error('Error fetching templates:', error);
      }
      setTemplates([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, template = null) => {
    setModalType(type);
    setEditingTemplate(template);
    
    if (template) {
      setTemplateName(template.name);
      setTemplateContent(template.content || '');
    } else {
      setTemplateName('');
      setTemplateContent('');
      setPdfFile(null);
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
    setPdfFile(null);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);

      if (modalType === 'text') {
        // Save text template
        const payload = {
          userId,
          name: templateName,
          type: 'text',
          content: templateContent
        };

        let response;
        if (editingTemplate) {
          // Update existing template
          response = await fetch(`/api/cover-letter-templates/${editingTemplate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: templateName, content: templateContent })
          });
        } else {
          // Create new template
          response = await fetch('/api/cover-letter-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const data = await response.json();
        if (response.ok) {
          await fetchTemplates();
          closeModal();
        } else {
          alert('Error saving template: ' + data.error);
        }
      } else if (modalType === 'pdf' && pdfFile) {
        // Upload PDF template
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result;
          
          const payload = {
            userId,
            name: templateName,
            fileData: base64Data,
            fileName: pdfFile.name,
            mimeType: pdfFile.type
          };

          const response = await fetch('/api/cover-letter-templates/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          if (response.ok) {
            await fetchTemplates();
            closeModal();
          } else {
            alert('Error uploading template: ' + data.error);
          }
        };
        reader.readAsDataURL(pdfFile);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/cover-letter-templates/${templateId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok) {
        await fetchTemplates();
      } else {
        alert('Error deleting template: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = async (filePath) => {
    const { data } = supabase.storage
      .from('cover-letters')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="cover-letter-templates">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cover Letter Templates</h2>
        <button
          onClick={() => openModal('text')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + New Text Template
        </button>
      </div>

      {loading && templates.length === 0 ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No templates yet</p>
          <p className="text-sm text-gray-500">
            Create a text template with variables like {'{'}{'{'} company_name {'}'}{'}'},  {'{'}{'{'} job_title {'}'}{'}'} or upload a PDF
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedTemplateId === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                    template.type === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {template.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {template.type === 'text' ? (
                <div className="bg-gray-50 p-3 rounded mb-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {template.content?.substring(0, 150)}
                    {template.content?.length > 150 && '...'}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm text-gray-600">📄 {template.file_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(template.file_size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {onTemplateSelect && (
                  <button
                    onClick={() => onTemplateSelect(template)}
                    className={`flex-1 px-3 py-1.5 rounded text-sm ${
                      selectedTemplateId === template.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {selectedTemplateId === template.id ? 'Selected' : 'Select'}
                  </button>
                )}
                {template.type === 'text' && (
                  <button
                    onClick={() => openModal('text', template)}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={closeModal}
          />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-md z-[101] bg-white"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {editingTemplate ? 'Edit Template' : modalType === 'text' ? 'Create Text Template' : 'Upload PDF Template'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Software Developer Cover Letter"
              />
            </div>

            {modalType === 'text' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Template Content
                  <span className="text-xs text-gray-500 ml-2">
                    (Use {'{'}{'{'} company_name {'}'}{'}'},  {'{'}{'{'} job_title {'}'}{'}'}, etc. for dynamic values)
                  </span>
                </label>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  placeholder={`Dear Hiring Manager at {{company_name}},

I am writing to express my interest in the {{job_title}} position...`}
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium mb-1">Available variables:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>{'{'}{'{'} company_name {'}'}{'}'} - Company name</li>
                    <li>{'{'}{'{'} job_title {'}'}{'}'} - Job title</li>
                    <li>{'{'}{'{'} location {'}'}{'}'} - Job location</li>
                    <li>{'{'}{'{'} user_name {'}'}{'}'} - Your name</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {pdfFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">Max file size: 5MB</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <LoadingButton
                onClick={saveTemplate}
                loading={loading}
                disabled={!templateName || (modalType === 'text' && !templateContent) || (modalType === 'pdf' && !pdfFile && !editingTemplate)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {editingTemplate ? 'Update' : 'Save'} Template
              </LoadingButton>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
