

import React, { useEffect, useState } from 'react';
import { unifiedDataService } from '../services/dataService';
import { Assessment, Classroom, ClassroomResource } from '../types';
import Button from './Button';
import Card from './Card';
import { BookOpenIcon, FileTextIcon, RefreshCwIcon } from './icons';

interface StudentClassroomViewProps {
  classroom: Classroom;
  assessments: Assessment[];
  resources: ClassroomResource[];
  onStartAssessment: (assessment: Assessment, isPractice?: boolean) => void;
  onSelectAssessment: (assessment: Assessment) => void;
  onBackToDashboard: () => void;
}

const StudentClassroomView: React.FC<StudentClassroomViewProps> = ({ classroom, assessments, resources, onStartAssessment, onSelectAssessment, onBackToDashboard }) => {
  const [liveAssessments, setLiveAssessments] = useState<Assessment[]>(assessments);
  const [isUpdating, setIsUpdating] = useState(false);

  // Subscribe to real-time updates from unified data service
  useEffect(() => {
    const unsubscribe = unifiedDataService.subscribe((data) => {
      const updatedAssessments = data.assessments.filter(a => a.classId === classroom.id);
      setLiveAssessments(updatedAssessments);
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 500);
    });

    // Initial sync
    const classAssessments = unifiedDataService.getClassAssessments(classroom.id);
    if (classAssessments.length > 0) {
      setLiveAssessments(classAssessments);
    }

    return unsubscribe;
  }, [classroom.id]);

  const assignedAssessments = liveAssessments.length > 0 ? liveAssessments : assessments.filter(a => a.classId === classroom.id);
  const classResources = resources.filter(r => r.classroomId === classroom.id);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBackToDashboard} className="text-sm font-semibold text-primary mb-6">&larr; Back to Dashboard</button>
        <header className="mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <BookOpenIcon className="h-8 w-8 text-secondary mr-3" />
                    <div>
                        <p className="text-lg text-neutral-medium">Classroom</p>
                        <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">{classroom.name}</h1>
                    </div>
                </div>
                {isUpdating && (
                  <div className="flex items-center text-sm text-secondary animate-pulse">
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </div>
                )}
            </div>
        </header>
        
        <div className="space-y-8">
            <Card>
                <h2 className="text-2xl font-bold font-display text-neutral-extradark mb-6">Class Materials</h2>
                <div className="space-y-4">
                    {classResources.length > 0 ? (
                        classResources.map(res => (
                            <div key={res.id} className="p-4 bg-white/50 rounded-xl border border-neutral-light/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileTextIcon className="w-6 h-6 text-neutral shrink-0"/>
                                    <div>
                                        <p className="font-semibold text-neutral-dark">{res.fileName}</p>
                                        <p className="text-xs text-neutral-medium">Uploaded: {new Date(res.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => alert(`Downloading ${res.fileName}... (Simulation)`)} className="!py-2 !px-4">
                                    Download
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-neutral-medium">Your teacher hasn't uploaded any materials for this class yet.</p>
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold font-display text-neutral-extradark">Assigned Work</h2>
                  <span className="text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                    {assignedAssessments.length} Active
                  </span>
                </div>
                <div className="space-y-4">
                    {assignedAssessments.length > 0 ? (
                        assignedAssessments.map(assessment => (
                            <div key={assessment.id} className={`p-4 bg-white/50 rounded-xl border border-neutral-light/50 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-primary transition-all duration-200 group ${isUpdating ? 'animate-pulse' : ''}`}>
                                <div 
                                    className="flex-grow cursor-pointer" 
                                    onClick={() => onSelectAssessment(assessment)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectAssessment(assessment); }}
                                    aria-label={`View details for ${assessment.title}`}
                                >
                                    <h4 className="font-bold text-lg text-primary group-hover:underline">{assessment.title}</h4>
                                    <p className="text-sm text-neutral-dark mt-1 max-w-lg">{assessment.description}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-medium font-semibold">
                                        <span>{assessment.totalQuestions} Questions</span>
                                        <span>&bull;</span>
                                        <span>{assessment.duration} Minutes</span>
                                        <span>&bull;</span>
                                        <span className="capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary">{assessment.difficulty}</span>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-6 shrink-0 flex items-center space-x-3">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartAssessment(assessment, false);
                                        }}
                                        className="!px-4 !py-2"
                                    >
                                        Start Assessment
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-neutral-medium">Your teacher hasn't assigned any work to this class yet.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentClassroomView;
