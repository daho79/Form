
import React, { useState, useEffect } from 'react';
import { FormBuilder } from './components/FormBuilder';
import { FormViewer } from './components/FormViewer';
import { ResponsesSheet } from './components/ResponsesSheet';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Form, Submission, QuestionType } from './types';
import { LinkIcon, ClipboardDocumentIcon, XMarkIcon } from './components/Icons';

type View = 'builder' | 'viewer' | 'responses';

const initialForm: Form = {
  id: 'default-form',
  title: 'My Awesome Form',
  description: 'Please fill out this form. Your responses are greatly appreciated!',
  questions: [
    {
      id: crypto.randomUUID(),
      title: 'What is your name?',
      type: QuestionType.TEXT,
      required: true,
      options: [],
    },
    {
        id: crypto.randomUUID(),
        title: 'Which topics are you interested in?',
        type: QuestionType.CHECKBOXES,
        required: false,
        options: [
            { id: crypto.randomUUID(), value: 'Technology' },
            { id: crypto.randomUUID(), value: 'Art & Design' },
            { id: crypto.randomUUID(), value: 'Science' },
        ],
    },
  ],
  theme: 'indigo',
  headerImage: null,
};

const ShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#view=fill`;
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Share your form</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">Anyone with the link can view and submit this form.</p>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 w-28 justify-center"
                    >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<{ currentView: View; setView: (view: View) => void; onShare: () => void }> = ({ currentView, setView, onShare }) => {
    const navItemClasses = "py-2 px-4 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-indigo-100 text-indigo-700";
    const inactiveClasses = "text-gray-500 hover:bg-gray-100 hover:text-gray-700";
    
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                       <h1 className="text-xl font-bold text-gray-800">AI Form Builder</h1>
                    </div>
                    <nav className="flex items-center space-x-2 bg-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => setView('builder')}
                            className={`${navItemClasses} ${currentView === 'builder' ? activeClasses : inactiveClasses}`}
                        >
                            Questions
                        </button>
                        <button
                            onClick={() => setView('responses')}
                            className={`${navItemClasses} ${currentView === 'responses' ? activeClasses : inactiveClasses}`}
                        >
                            Responses
                        </button>
                    </nav>
                    <div className="flex items-center">
                         <button
                            onClick={onShare}
                            className="text-indigo-600 border border-indigo-200 font-medium py-2 px-4 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2 flex items-center gap-2"
                        >
                            <LinkIcon className="w-5 h-5" />
                            <span>Share</span>
                        </button>
                         <button
                            onClick={() => setView('viewer')}
                            className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                           Preview
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('builder');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [form, setForm] = useLocalStorage<Form>('ai-form-builder:form', initialForm);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>('ai-form-builder:submissions', []);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#view=fill') {
        setView('viewer');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSetView = (newView: View) => {
    setView(newView);
    if (window.location.hash) {
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const handleFormChange = (updatedForm: Form) => {
    setForm(updatedForm);
  };

  const handleNewSubmission = (submission: Submission) => {
    setSubmissions(prev => [...prev, submission]);
  };

  const renderContent = () => {
    switch (view) {
      case 'builder':
        return <FormBuilder form={form} onFormChange={handleFormChange} />;
      case 'viewer':
        return <FormViewer form={form} onSubmit={handleNewSubmission} />;
      case 'responses':
        return <ResponsesSheet form={form} submissions={submissions} />;
      default:
        return <FormBuilder form={form} onFormChange={handleFormChange} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header currentView={view} setView={handleSetView} onShare={() => setIsShareModalOpen(true)} />
      <main>
        {renderContent()}
      </main>
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
};

export default App;
