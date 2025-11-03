
import React, { useState, useRef } from 'react';
import { Form, Question, QuestionType, Option, ThemeName } from '../types';
import { generateFormQuestions } from '../services/geminiService';
import { PlusCircleIcon, TrashIcon, SparklesIcon, ImageIcon } from './Icons';

interface QuestionEditorProps {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, updateQuestion, removeQuestion }) => {
    const handleOptionChange = (optionId: string, value: string) => {
        const newOptions = question.options.map(opt => opt.id === optionId ? { ...opt, value } : opt);
        updateQuestion(question.id, { options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...question.options, { id: crypto.randomUUID(), value: `Option ${question.options.length + 1}` }];
        updateQuestion(question.id, { options: newOptions });
    };

    const removeOption = (optionId: string) => {
        const newOptions = question.options.filter(opt => opt.id !== optionId);
        updateQuestion(question.id, { options: newOptions });
    };

    const isOptionBased = [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question.type);

    const handleDeleteQuestion = () => {
        if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            removeQuestion(question.id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
            <div className="flex justify-between items-start gap-4">
                <input
                    type="text"
                    value={question.title}
                    onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                    placeholder="Question"
                    className="flex-grow text-lg p-2 border-b-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                    className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value={QuestionType.TEXT}>Short Answer</option>
                    <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                    <option value={QuestionType.CHECKBOXES}>Checkboxes</option>
                    <option value={QuestionType.DROPDOWN}>Dropdown</option>
                </select>
            </div>

            <div className="mt-4">
                {isOptionBased && (
                    <div className="space-y-2">
                        {question.options.map((option, index) => (
                            <div key={option.id} className="flex items-center gap-2">
                                <span className="text-gray-500">{index + 1}.</span>
                                <input
                                    type="text"
                                    value={option.value}
                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                    className="flex-grow p-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button onClick={() => removeOption(option.id)} className="text-gray-400 hover:text-red-500">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addOption} className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium">Add option</button>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end items-center gap-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-900">
                        Required
                    </label>
                </div>
                <button onClick={handleDeleteQuestion} className="text-gray-500 hover:text-red-600" title="Delete Question">
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

interface AIFormGeneratorProps {
    onQuestionsGenerated: (questions: Omit<Question, 'id'>[]) => void;
}

const AIFormGenerator: React.FC<AIFormGeneratorProps> = ({ onQuestionsGenerated }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic for your form.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const questions = await generateFormQuestions(topic);
            onQuestionsGenerated(questions);
            setTopic('');
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-lg p-6 my-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <SparklesIcon className="w-8 h-8 text-indigo-500 hidden md:block" />
                <div className="flex-grow w-full">
                    <label htmlFor="ai-topic" className="block text-sm font-medium text-gray-700 mb-1">
                        Generate questions with AI
                    </label>
                    <input
                        id="ai-topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Event Registration for a tech conference"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full md:w-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate
                        </>
                    )}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

const themes: Record<ThemeName, { name: string; colors: string[] }> = {
    indigo: { name: 'Default Indigo', colors: ['bg-indigo-600', 'bg-indigo-400', 'bg-indigo-200'] },
    teal: { name: 'Serene Teal', colors: ['bg-teal-600', 'bg-teal-400', 'bg-teal-200'] },
    gray: { name: 'Classic Gray', colors: ['bg-gray-700', 'bg-gray-500', 'bg-gray-300'] },
    orange: { name: 'Sunset Orange', colors: ['bg-orange-600', 'bg-orange-400', 'bg-orange-200'] },
};

interface ThemeSelectorProps {
    currentTheme: ThemeName;
    onThemeChange: (theme: ThemeName) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="bg-white p-6 rounded-lg border shadow-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(themes) as ThemeName[]).map((themeKey) => {
                    const theme = themes[themeKey];
                    return (
                        <button
                            key={themeKey}
                            onClick={() => onThemeChange(themeKey)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                                currentTheme === themeKey ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-400'
                            }`}
                            aria-label={`Select ${theme.name} theme`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                {theme.colors.map((color, index) => (
                                    <div key={index} className={`w-6 h-6 rounded-full ${color}`}></div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-700 mt-2 text-center">{theme.name}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};


interface FormBuilderProps {
  form: Form;
  onFormChange: (form: Form) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ form, onFormChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFormDetails = (updates: Partial<Form>) => {
    onFormChange({ ...form, ...updates });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("File is too large. Please select an image under 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            updateFormDetails({ headerImage: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateFormDetails({ headerImage: null });
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: '',
      type: QuestionType.TEXT,
      required: false,
      options: [],
    };
    const questions = [...form.questions, newQuestion];
    onFormChange({ ...form, questions });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const questions = form.questions.map(q => (q.id === id ? { ...q, ...updates } : q));
    onFormChange({ ...form, questions });
  };

  const removeQuestion = (id: string) => {
    const questions = form.questions.filter(q => q.id !== id);
    onFormChange({ ...form, questions });
  };
  
  const handleAIQuestions = (generatedQuestions: Omit<Question, 'id'>[]) => {
    const newQuestions: Question[] = generatedQuestions.map(q => ({
        ...q,
        id: crypto.randomUUID()
    }));
    onFormChange({ ...form, questions: [...form.questions, ...newQuestions] });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <ThemeSelector
            currentTheme={form.theme || 'indigo'}
            onThemeChange={(theme) => updateFormDetails({ theme })}
        />

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
            />
            
            {form.headerImage ? (
                <div className="relative group mb-4">
                    <img src={form.headerImage} alt="Form header" className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <button onClick={handleRemoveImage} className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-full shadow-lg" title="Remove image">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex justify-center items-center h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-gray-500 hover:text-indigo-600">
                            <ImageIcon className="w-6 h-6" />
                            <span>Add Header Image (Max 2MB)</span>
                        </div>
                    </button>
                </div>
            )}
            
            <input
                type="text"
                value={form.title}
                onChange={(e) => updateFormDetails({ title: e.target.value })}
                placeholder="Form title"
                className="text-3xl font-bold w-full p-2 border-b-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
            />
            <textarea
                value={form.description}
                onChange={(e) => updateFormDetails({ description: e.target.value })}
                placeholder="Form description"
                className="text-base text-gray-600 w-full p-2 mt-2 border-b-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                rows={2}
            />
        </div>

        <AIFormGenerator onQuestionsGenerated={handleAIQuestions} />

        {form.questions.map((question) => (
            <QuestionEditor
            key={question.id}
            question={question}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
            />
        ))}

        <div className="flex justify-center mt-4">
            <button
                onClick={addQuestion}
                className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                title="Add Question"
            >
                <PlusCircleIcon className="w-10 h-10" />
            </button>
        </div>
    </div>
  );
};