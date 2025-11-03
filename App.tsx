
import React, { useState } from 'react';
import { FormBuilder } from './components/FormBuilder';
import { FormViewer } from './components/FormViewer';
import { ResponsesSheet } from './components/ResponsesSheet';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Form, Submission, QuestionType, ThemeName } from './types';

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

const Header: React.FC<{ currentView: View; setView: (view: View) => void }> = ({ currentView, setView }) => {
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
                    <div>
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
  const [form, setForm] = useLocalStorage<Form>('ai-form-builder:form', initialForm);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>('ai-form-builder:submissions', []);

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
      <Header currentView={view} setView={setView} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;