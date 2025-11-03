
import React, { useState } from 'react';
import { Form, QuestionType, Answer, Submission, ThemeName } from '../types';

interface FormViewerProps {
  form: Form;
  onSubmit: (submission: Submission) => void;
}

const themeConfig: Record<ThemeName, Record<string, string>> = {
    indigo: {
        headerBorder: 'bg-indigo-600', // Changed to bg for the div approach
        buttonBg: 'bg-indigo-600',
        buttonHoverBg: 'hover:bg-indigo-700',
        focusRing: 'focus:ring-indigo-500',
        radioText: 'text-indigo-600',
    },
    teal: {
        headerBorder: 'bg-teal-600',
        buttonBg: 'bg-teal-600',
        buttonHoverBg: 'hover:bg-teal-700',
        focusRing: 'focus:ring-teal-500',
        radioText: 'text-teal-600',
    },
    gray: {
        headerBorder: 'bg-gray-700',
        buttonBg: 'bg-gray-700',
        buttonHoverBg: 'hover:bg-gray-800',
        focusRing: 'focus:ring-gray-500',
        radioText: 'text-gray-700',
    },
    orange: {
        headerBorder: 'bg-orange-600',
        buttonBg: 'bg-orange-600',
        buttonHoverBg: 'hover:bg-orange-700',
        focusRing: 'focus:ring-orange-500',
        radioText: 'text-orange-600',
    },
};


export const FormViewer: React.FC<FormViewerProps> = ({ form, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeTheme = themeConfig[form.theme || 'indigo'];

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleCheckboxChange = (questionId: string, optionValue: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[] || []);
    let newAnswers;
    if (checked) {
      newAnswers = [...currentAnswers, optionValue];
    } else {
      newAnswers = currentAnswers.filter(v => v !== optionValue);
    }
    setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    form.questions.forEach(q => {
      if (q.required) {
        const answer = answers[q.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[q.id] = 'This field is required.';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submission: Submission = {
        id: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        answers,
      };
      onSubmit(submission);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto my-10 p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-6">Your response has been recorded.</p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setAnswers({});
            setErrors({});
          }}
          className={`font-bold py-2 px-6 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeTheme.buttonBg} ${activeTheme.buttonHoverBg} ${activeTheme.focusRing}`}
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 bg-white rounded-lg shadow-lg">
      {form.headerImage ? (
        <img src={form.headerImage} alt={`${form.title} header`} className="w-full max-h-64 object-cover rounded-t-lg" />
      ) : (
        <div className={`h-2.5 ${activeTheme.headerBorder} rounded-t-lg`}></div>
      )}
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{form.title}</h1>
        <p className="text-gray-600 mb-8 border-b pb-4">{form.description}</p>
        
        <form onSubmit={handleSubmit} noValidate>
          {form.questions.map(q => (
            <div key={q.id} className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2">
                {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {q.type === QuestionType.TEXT && (
                <input
                  type="text"
                  onChange={e => handleInputChange(q.id, e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-transparent ${activeTheme.focusRing}`}
                />
              )}

              {q.type === QuestionType.MULTIPLE_CHOICE && q.options.map(opt => (
                <div key={opt.id} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={opt.id}
                    name={q.id}
                    value={opt.value}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    className={`h-4 w-4 border-gray-300 ${activeTheme.radioText} ${activeTheme.focusRing}`}
                  />
                  <label htmlFor={opt.id} className="ml-3 block text-sm font-medium text-gray-700">{opt.value}</label>
                </div>
              ))}

              {q.type === QuestionType.CHECKBOXES && q.options.map(opt => (
                <div key={opt.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={opt.id}
                    value={opt.value}
                    onChange={e => handleCheckboxChange(q.id, opt.value, e.target.checked)}
                    className={`h-4 w-4 text-indigo-600 border-gray-300 rounded ${activeTheme.radioText} ${activeTheme.focusRing}`}
                  />
                  <label htmlFor={opt.id} className="ml-3 block text-sm font-medium text-gray-700">{opt.value}</label>
                </div>
              ))}

              {q.type === QuestionType.DROPDOWN && (
                <select
                  onChange={e => handleInputChange(q.id, e.target.value)}
                  defaultValue=""
                  className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-transparent ${activeTheme.focusRing}`}
                >
                  <option value="" disabled>Select an option</option>
                  {q.options.map(opt => (
                    <option key={opt.id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
              )}

              {errors[q.id] && <p className="text-red-500 text-sm mt-1">{errors[q.id]}</p>}
            </div>
          ))}
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className={`font-bold py-2 px-6 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeTheme.buttonBg} ${activeTheme.buttonHoverBg} ${activeTheme.focusRing}`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};