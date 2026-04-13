import React, { useState } from 'react';
import { Assessment, Question } from '../types';
import { generateSingleQuestion } from '../services/aiService';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { EditIcon, PlusCircleIcon, SparklesIcon, XCircleIcon, CheckIcon } from './icons';

interface AssessmentEditorViewProps {
    assessment: Assessment;
    initialQuestions: Question[];
    onSaveChanges: (assessmentId: string, updatedQuestions: Question[]) => void;
    onCancel: () => void;
}

const AssessmentEditorView: React.FC<AssessmentEditorViewProps> = ({ assessment, initialQuestions, onSaveChanges, onCancel }) => {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<Question>>({});
    
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiForm, setAiForm] = useState({ topic: assessment.topic || assessment.subject, difficulty: 'medium' as 'easy' | 'medium' | 'hard' });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleStartEdit = (question: Question) => {
        setEditingQuestionId(question.id);
        setEditedData(JSON.parse(JSON.stringify(question))); // Deep copy to avoid direct mutation
    };

    const handleCancelEdit = () => {
        setEditingQuestionId(null);
        setEditedData({});
    };

    const handleSaveEdit = (id: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...editedData } as Question : q));
        setEditingQuestionId(null);
        setEditedData({});
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        }
    };
    
    const handleInputChange = (field: keyof Question, value: any) => {
        setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(editedData.options || [])];
        newOptions[index] = value;
        setEditedData(prev => ({ ...prev, options: newOptions }));
    };
    
    const handleAddManualQuestion = () => {
        const newQuestion: Question = {
            id: `new-${Date.now()}`,
            assessmentId: assessment.id,
            question: 'New Question',
            options: ['', '', '', ''],
            correctAnswer: '',
            explanation: '',
            type: 'multiple_choice',
            difficulty: 'medium',
            topic: assessment.topic || assessment.subject,
            avgTimeToAnswer: 60,
        };
        setQuestions(prev => [...prev, newQuestion]);
        handleStartEdit(newQuestion);
    };

    const handleGenerateAIQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const generated = await generateSingleQuestion(assessment.subject, aiForm.topic, aiForm.difficulty, assessment.academicLevel || 'University Level');
            const newQuestion: Question = {
                id: `new-${Date.now()}`,
                assessmentId: assessment.id,
                ...generated,
                type: 'multiple_choice',
                difficulty: aiForm.difficulty,
                topic: aiForm.topic,
                avgTimeToAnswer: 60,
            };
            setQuestions(prev => [...prev, newQuestion]);
            setIsAiModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Failed to generate question. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <button onClick={onCancel} className="text-sm font-semibold text-primary mb-2">&larr; Back to Classroom</button>
                    <h1 className="text-3xl font-bold font-display text-neutral-extradark">Customize Assessment</h1>
                    <p className="text-lg text-neutral-medium">{assessment.title}</p>
                </div>
                <Button variant="success" onClick={() => onSaveChanges(assessment.id, questions)} className="!py-3 !px-6">
                    <CheckIcon className="h-5 w-5 mr-2"/>
                    Save All Changes
                </Button>
            </header>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <Card key={q.id} className={editingQuestionId === q.id ? 'ring-2 ring-secondary' : ''}>
                        {editingQuestionId === q.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-dark">Question {index + 1}</label>
                                    <textarea value={editedData.question || ''} onChange={(e) => handleInputChange('question', e.target.value)} rows={3} className="mt-1 w-full p-2 border rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-dark">Options</label>
                                    {(editedData.options || []).map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2 mt-1">
                                            <input type="radio" name={`correct-answer-${q.id}`} checked={editedData.correctAnswer === opt} onChange={() => handleInputChange('correctAnswer', opt)} />
                                            <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} className="w-full p-2 border rounded-md"/>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-dark">Explanation</label>
                                    <textarea value={editedData.explanation || ''} onChange={(e) => handleInputChange('explanation', e.target.value)} rows={2} className="mt-1 w-full p-2 border rounded-md"/>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                                    <Button variant="secondary" onClick={() => handleSaveEdit(q.id)}>Save Question</Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-start">
                                    <p className="flex-grow pr-4"><span className="font-bold">{index + 1}.</span> {q.question}</p>
                                    <div className="flex gap-2 shrink-0">
                                        <Button variant="outline" onClick={() => handleStartEdit(q)} className="!p-2"><EditIcon className="h-4 w-4"/></Button>
                                        <Button variant="danger" onClick={() => handleDelete(q.id)} className="!p-2"><XCircleIcon className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {q.options.map(opt => (
                                        <p key={opt} className={`text-sm p-2 rounded-md ${opt === q.correctAnswer ? 'bg-success/20 font-semibold text-success-dark' : 'bg-neutral-light/30'}`}>{opt}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
            
            <div className="mt-6 flex gap-4">
                 <Button onClick={handleAddManualQuestion} variant="outline" className="w-full">
                    <PlusCircleIcon className="h-5 w-5 mr-2"/>
                    Add Question Manually
                </Button>
                 <Button onClick={() => setIsAiModalOpen(true)} variant="secondary" className="w-full">
                    <SparklesIcon className="h-5 w-5 mr-2"/>
                    Generate with AI
                </Button>
            </div>

            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Generate AI Question">
                <form onSubmit={handleGenerateAIQuestion} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-neutral-dark">Topic</label>
                        <input value={aiForm.topic} onChange={e => setAiForm(p => ({...p, topic: e.target.value}))} required className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-neutral-dark">Difficulty</label>
                        <select value={aiForm.difficulty} onChange={e => setAiForm(p => ({...p, difficulty: e.target.value as any}))} className="mt-1 block w-full p-2 border rounded-md">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                     <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsAiModalOpen(false)} disabled={isGenerating}>Cancel</Button>
                        <Button type="submit" variant="secondary" disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate & Add'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AssessmentEditorView;