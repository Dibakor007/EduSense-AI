import React, { useState } from 'react';
import { unifiedDataService } from '../services/dataService';
import { Submission } from '../types';
import Button from './Button';
import Modal from './Modal';
import { CheckIcon, InfoIcon, XCircleIcon } from './icons';

interface TeacherFeedbackModalProps {
    isOpen: boolean;
    submission: Submission | null;
    teacherId: string;
    onClose: () => void;
    onSubmit: (feedback: { comments: string; grade?: number }) => void;
}

const TeacherFeedbackModal: React.FC<TeacherFeedbackModalProps> = ({
    isOpen,
    submission,
    teacherId,
    onClose,
    onSubmit,
}) => {
    const [comments, setComments] = useState('');
    const [grade, setGrade] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submission || !comments.trim()) {
            alert('Please enter feedback comments');
            return;
        }

        setIsSubmitting(true);
        try {
            const feedback = {
                id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                submissionId: submission.id,
                teacherId,
                comments: comments.trim(),
                grade: grade !== '' ? Number(grade) : undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Update submission with feedback via unified service
            unifiedDataService.addFeedback(submission.id, feedback);

            // Callback to parent
            onSubmit({ comments: comments.trim(), grade: grade !== '' ? Number(grade) : undefined });

            // Reset form
            setComments('');
            setGrade('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!submission) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Leave Feedback for Student">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-neutral-dark mb-2">
                        <InfoIcon className="h-4 w-4 inline mr-2" />
                        Your Feedback
                    </label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Write constructive feedback about this assessment submission. Highlight strengths and areas for improvement..."
                        className="w-full h-32 p-3 border border-neutral-light/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        required
                    />
                    <p className="text-xs text-neutral-medium mt-1">
                        {comments.length}/500 characters
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-neutral-dark mb-2">
                        Grade (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="e.g., 85"
                            className="w-24 p-2 border border-neutral-light/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-neutral-medium">/100</span>
                    </div>
                </div>

                <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm text-neutral-dark">
                        <strong>Student Score:</strong> {submission.result.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-neutral-dark mt-1">
                        <strong>Time Taken:</strong> {submission.result.timeTaken} minutes
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose}>
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !comments.trim()}>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Send Feedback'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TeacherFeedbackModal;
