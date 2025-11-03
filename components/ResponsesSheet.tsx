
import React from 'react';
import { Form, Submission } from '../types';

interface ResponsesSheetProps {
  form: Form;
  submissions: Submission[];
}

export const ResponsesSheet: React.FC<ResponsesSheetProps> = ({ form, submissions }) => {
  const headers = ['Timestamp', ...form.questions.map(q => q.title)];

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  }

  const formatAnswer = (answer: string | string[] | undefined) => {
    if (answer === undefined) return '';
    if (Array.isArray(answer)) return answer.join(', ');
    return answer;
  }

  if (submissions.length === 0) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <div className="bg-white p-12 rounded-lg shadow-md border">
                <h2 className="text-2xl font-semibold text-gray-700">No responses yet</h2>
                <p className="mt-2 text-gray-500">Share your form to start collecting responses.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{form.title} - Responses</h1>
            <p className="text-lg text-gray-600">{submissions.length} response{submissions.length !== 1 && 's'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    {headers.map((header, index) => (
                        <th 
                            key={index}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {header}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map(submission => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatTimestamp(submission.submittedAt)}
                            </td>
                            {form.questions.map(question => (
                                <td key={question.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {formatAnswer(submission.answers[question.id])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
