

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { View } from '../App';
import { unifiedDataService } from '../services/dataService';
import { Assessment, Classroom, ClassroomResource, Submission, User } from '../types';
import Button from './Button';
import Card from './Card';
import { ActivityIcon, BarChartIcon, CheckIcon, CheckSquareIcon, ChevronRightIcon, ChevronsDown, ClipboardListIcon, EditIcon, EyeIcon, FileTextIcon, LayoutGridIcon, PlusCircleIcon, SparklesIcon, Trash2Icon, TrophyIcon, UploadCloudIcon, UsersIcon, XCircleIcon } from './icons';
import Modal from './Modal';
import ProgressBar from './ProgressBar';

interface TeacherDashboardViewProps {
    user: User;
    classrooms: Classroom[];
    students: User[];
    assessments: Assessment[];
    submissions: Submission[];
    selectedClass: Classroom | null;
    onSelectClass: (classroom: Classroom | null) => void;
    onSelectStudent: (student: User) => void;
    onCreateClass: (name: string) => void;
    onAddStudent: (classId: string, studentEmail: string) => { success: boolean, message: string };
    onRemoveStudent: (classId: string, studentId: string) => void;
    onDeleteClass: (classId: string) => { success: boolean, message: string };
    onCreateAssessment: (details: {
        title: string;
        subject: string;
        topic: string;
        description: string;
        questionCount: number;
        duration: number;
        difficulty: 'easy' | 'medium' | 'hard';
        classIds: string[];
        academicLevel: string;
    }) => Promise<void>;
    onCreateManualAssessment: (details: {
        title: string;
        subject: string;
        topic: string;
        description: string;
        duration: number;
        difficulty: 'easy' | 'medium' | 'hard';
        classIds: string[];
        academicLevel: string;
    }) => void;
    academicSubjects: { [key: string]: { [key: string]: string[] } };
    isGeneratingQuiz: boolean;
    onEditAssessment: (assessment: Assessment) => void;
    onNavigate: (view: View, payload?: any) => void;
    resources: ClassroomResource[];
    onUploadResource: (classroomId: string, file: File) => void;
    onDeleteResource: (resourceId: string) => void;
}

const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const ClassList: React.FC<{
    classrooms: Classroom[];
    assessments: Assessment[];
    submissions: Submission[];
    onCreateClass: (name: string) => void;
    onSelectClass: (classroom: Classroom) => void;
    onDeleteClass: (classId: string) => { success: boolean, message: string };
}> = ({ classrooms, assessments, submissions, onCreateClass, onSelectClass, onDeleteClass }) => {
    const [isCreateClassModalOpen, setCreateClassModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClassName.trim()) {
            onCreateClass(newClassName.trim());
            setNewClassName('');
            setCreateClassModalOpen(false);
        }
    };

    const handleDeleteClass = (classId: string, className: string) => {
        if (window.confirm(`Are you sure you want to delete "${className}"? This will remove all students from this classroom and delete all associated assessments and submissions. This action cannot be undone.`)) {
            const result = onDeleteClass(classId);
            if (result.success) {
                alert(`Classroom "${className}" has been deleted successfully.`);
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold font-display text-neutral-extradark">Your Classrooms</h2>
                <Button onClick={() => setCreateClassModalOpen(true)}>
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Create New Class
                </Button>
            </div>
            {classrooms.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map(c => {
                        const assessmentsForClass = assessments.filter(a => a.classId === c.id);
                        const assessmentIdsForClass = new Set(assessmentsForClass.map(a => a.id));
                        const submissionsForClass = submissions.filter(s => assessmentIdsForClass.has(s.assessmentId));
                        const totalScore = submissionsForClass.reduce((acc, s) => acc + s.result.percentage, 0);
                        const classAverage = submissionsForClass.length > 0 ? (totalScore / submissionsForClass.length) : 0;
                        
                        return (
                            <Card key={c.id} padding="none" className="flex flex-col hover:-translate-y-1 transition-transform duration-300 group overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-secondary to-cyan-400"></div>
                                <div className="p-6 flex-grow">
                                    <h3 className="text-xl font-bold text-primary group-hover:text-primary-dark transition-colors truncate">{c.name}</h3>
                                    <p className="text-xs text-neutral-medium font-mono mt-1">CODE: {c.classCode}</p>

                                    <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-2 gap-4 text-center">
                                        <div className="p-2 rounded-lg bg-primary/5">
                                            <UsersIcon className="h-6 w-6 text-primary mx-auto mb-1" />
                                            <p className="text-xl font-bold font-display text-primary-dark">{c.studentIds.length}</p>
                                            <p className="text-xs font-semibold text-neutral-dark">Students</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-secondary/5">
                                            <FileTextIcon className="h-6 w-6 text-secondary mx-auto mb-1" />
                                            <p className="text-xl font-bold font-display text-secondary-dark">{assessmentsForClass.length}</p>
                                            <p className="text-xs font-semibold text-neutral-dark">Assessments</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-success/5 col-span-2">
                                            <TrophyIcon className="h-6 w-6 text-success mx-auto mb-1" />
                                            <p className="text-xl font-bold font-display text-success-dark">
                                                {submissionsForClass.length > 0 ? `${classAverage.toFixed(1)}%` : 'N/A'}
                                            </p>
                                            <p className="text-xs font-semibold text-neutral-dark">Class Average</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black/5 p-4 mt-auto space-y-2">
                                    <Button variant="secondary" onClick={() => onSelectClass(c)} className="w-full !py-2.5 group/btn">
                                        Open Dashboard
                                        <ChevronRightIcon className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1"/>
                                    </Button>
                                    <button 
                                        onClick={() => handleDeleteClass(c.id, c.name)} 
                                        className="w-full py-2 px-3 text-sm font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Delete Class
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <p className="text-neutral-medium">You haven't created any classrooms yet.</p>
                    <Button onClick={() => setCreateClassModalOpen(true)} className="mt-4">Create Your First Class</Button>
                </Card>
            )}
            <Modal isOpen={isCreateClassModalOpen} onClose={() => setCreateClassModalOpen(false)} title="Create a New Classroom">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label htmlFor="className" className="block text-sm font-medium text-neutral-dark">Class Name</label>
                        <input id="className" type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="e.g., Class 10 Science 2025" className="mt-1 block w-full px-4 py-3 bg-surface border border-neutral-light/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                         <Button type="button" variant="outline" onClick={() => setCreateClassModalOpen(false)}>Cancel</Button>
                         <Button type="submit" variant="secondary">Create Class</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            isActive
                ? 'border-secondary text-secondary-dark'
                : 'border-transparent text-neutral-medium hover:text-neutral-dark'
        }`}
    >
        {icon}
        {children}
    </button>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <Card padding="sm" className="flex items-center">
        <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-2xl font-bold font-display text-neutral-extradark">{value}</p>
            <p className="text-sm font-semibold text-neutral">{label}</p>
        </div>
    </Card>
);

const ClassDetail: React.FC<TeacherDashboardViewProps> = (props) => {
    const { selectedClass, students, assessments, submissions, onSelectClass, onSelectStudent, onAddStudent, onRemoveStudent, onCreateAssessment, onCreateManualAssessment, academicSubjects, isGeneratingQuiz, onEditAssessment, classrooms, onNavigate, resources, onUploadResource, onDeleteResource } = props;
    
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assessments' | 'materials'>('overview');
    const [isCreateAssessmentModalOpen, setCreateAssessmentModalOpen] = useState(false);
    const [creationMode, setCreationMode] = useState<'choice' | 'ai' | 'manual'>('choice');
    const [assessmentModalStep, setAssessmentModalStep] = useState(1);
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);
    const [liveSubmissions, setLiveSubmissions] = useState<Submission[]>(submissions);
    const [liveAssessments, setLiveAssessments] = useState<Assessment[]>(assessments);
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [assessmentForm, setAssessmentForm] = useState({
        title: '', subject: '', topic: '', description: '', questionCount: 10, duration: 20,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard', academicLevel: Object.keys(academicSubjects)[0] || 'University Level', classIds: new Set<string>(),
    });

    // Subscribe to real-time updates from unified data service
    useEffect(() => {
        const unsubscribe = unifiedDataService.subscribe((data) => {
            setLiveSubmissions(data.submissions);
            setLiveAssessments(data.assessments);
            setIsUpdating(true);
            setTimeout(() => setIsUpdating(false), 500);
        });

        return unsubscribe;
    }, []);
    
    const classData = useMemo(() => {
        if (!selectedClass) return null;

        const studentsInClass = students.filter(s => selectedClass.studentIds.includes(s.id));
        const assessmentsForClass = liveAssessments.filter(a => a.classId === selectedClass.id);
        const assessmentIds = new Set(assessmentsForClass.map(a => a.id));
        const submissionsForClass = liveSubmissions.filter(s => assessmentIds.has(s.assessmentId));
        
        const totalPossibleSubmissions = studentsInClass.length * assessmentsForClass.length;
        const submissionRate = totalPossibleSubmissions > 0 ? (submissionsForClass.length / totalPossibleSubmissions) * 100 : 0;
        
        const totalScore = submissionsForClass.reduce((acc, s) => acc + s.result.percentage, 0);
        const classAverage = submissionsForClass.length > 0 ? (totalScore / submissionsForClass.length) : 0;

        const studentAverages: { [studentId: string]: { totalScore: number, count: number, average: number } } = {};
        studentsInClass.forEach(student => {
            const studentSubmissions = submissionsForClass.filter(s => s.studentId === student.id);
            const total = studentSubmissions.reduce((acc, s) => acc + s.result.percentage, 0);
            const count = studentSubmissions.length;
            studentAverages[student.id] = { totalScore: total, count, average: count > 0 ? total / count : 0 };
        });

        const performanceDistribution = [
            { name: '<60%', count: 0, fill: '#EF4444' },
            { name: '60-80%', count: 0, fill: '#F59E0B' },
            { name: '>80%', count: 0, fill: '#10B981' },
        ];
        Object.values(studentAverages).forEach(({ average }) => {
            if (average > 80) performanceDistribution[2].count++;
            else if (average >= 60) performanceDistribution[1].count++;
            else performanceDistribution[0].count++;
        });

        return {
            studentsInClass, assessmentsForClass, submissionsForClass, submissionRate, classAverage,
            studentAverages, performanceDistribution
        };
    }, [selectedClass, students, liveAssessments, liveSubmissions]);

    const closeAndResetAssessmentModal = useCallback(() => {
        setCreateAssessmentModalOpen(false);
        setTimeout(() => {
            setCreationMode('choice');
            setAssessmentModalStep(1);
            setAssessmentForm({
                title: '', subject: '', topic: '', description: '', questionCount: 10, duration: 20,
                difficulty: 'medium', academicLevel: Object.keys(academicSubjects)[0] || 'University Level', classIds: new Set([selectedClass?.id || '']),
            });
        }, 300);
    }, [selectedClass, academicSubjects]);

    useEffect(() => {
        if (selectedClass && isCreateAssessmentModalOpen) {
            setAssessmentForm(prev => ({ ...prev, classIds: new Set([selectedClass.id]) }));
        }
    }, [selectedClass, isCreateAssessmentModalOpen]);

    const updateAssessmentForm = useCallback((field: keyof typeof assessmentForm, value: any) => {
        setAssessmentForm(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'subject') {
                newState.topic = '';
            }
            return newState;
        });
    }, []);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAssessmentForm(prev => {
            const newState = { ...prev, [name]: name === 'questionCount' || name === 'duration' ? parseInt(value) || 0 : value };
            if (name === 'academicLevel') { newState.subject = ''; newState.topic = ''; }
            else if (name === 'subject') { newState.topic = ''; }
            return newState;
        });
    }, []);

    const handleClassCheckboxChange = useCallback((classId: string) => {
        setAssessmentForm(prev => {
            const newClassIds = new Set(prev.classIds);
            if (newClassIds.has(classId)) newClassIds.delete(classId); else newClassIds.add(classId);
            return { ...prev, classIds: newClassIds };
        });
    }, []);

    const handleCreateAIAssessmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (assessmentForm.classIds.size === 0) { alert("Please select at least one class."); return; }
        await onCreateAssessment({ ...assessmentForm, classIds: Array.from(assessmentForm.classIds) });
        closeAndResetAssessmentModal();
    };

    const handleCreateManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (assessmentForm.classIds.size === 0) { alert("Please select at least one class."); return; }
        await onCreateManualAssessment({ ...assessmentForm, classIds: Array.from(assessmentForm.classIds) });
        closeAndResetAssessmentModal();
    };
    
    const handleAddStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudentEmail.trim() || !selectedClass) return;
        const result = onAddStudent(selectedClass.id, newStudentEmail);
        if (result.success) setNewStudentEmail(''); else alert(result.message);
    };

    const handleRemoveStudentClick = (studentId: string) => {
        if (!selectedClass) return;
        const student = students.find(s => s.id === studentId);
        if (student && window.confirm(`Are you sure you want to remove ${student.name} from this class?`)) {
            onRemoveStudent(selectedClass.id, studentId);
        }
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedClass) {
            onUploadResource(selectedClass.id, e.target.files[0]);
            e.target.value = '';
        }
    };
    
    const formInputClasses = "mt-1 block w-full px-4 py-3 bg-white/60 border-2 border-neutral-light/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary";

    if (!selectedClass || !classData) return null;
    
    const { studentsInClass, assessmentsForClass, submissionsForClass, submissionRate, classAverage, studentAverages, performanceDistribution } = classData;
    const resourcesForClass = resources.filter(r => r.classroomId === selectedClass.id);

    return (
        <div>
            <button onClick={() => onSelectClass(null)} className="text-sm font-semibold text-primary mb-4">&larr; Back to all classrooms</button>
            <h2 className="text-3xl font-bold font-display text-neutral-extradark mb-1">{selectedClass.name}</h2>
            <p className="text-neutral-medium mb-6">Class Dashboard</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<UsersIcon className="h-6 w-6"/>} label="Total Students" value={studentsInClass.length}/>
                <StatCard icon={<TrophyIcon className="h-6 w-6"/>} label="Class Average" value={`${classAverage.toFixed(1)}%`}/>
                <StatCard icon={<CheckSquareIcon className="h-6 w-6"/>} label="Submission Rate" value={`${submissionRate.toFixed(0)}%`}/>
                <StatCard icon={<FileTextIcon className="h-6 w-6"/>} label="Active Assessments" value={assessmentsForClass.length}/>
            </div>
            
            <Card padding="none">
                <div className="flex border-b border-neutral-light/50 px-4">
                    <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutGridIcon className="w-5 h-5"/>}>Overview</TabButton>
                    <TabButton isActive={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<UsersIcon className="w-5 h-5"/>}>Students</TabButton>
                    <TabButton isActive={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')} icon={<ClipboardListIcon className="w-5 h-5"/>}>Assessments</TabButton>
                    <TabButton isActive={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon={<FileTextIcon className="w-5 h-5"/>}>Materials</TabButton>
                </div>
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
                            <div className="lg:col-span-3 space-y-6">
                                <Card>
                                    <h3 className="font-bold text-neutral-dark mb-4">Class Performance Distribution</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={performanceDistribution} margin={{top: 5, right: 20, left: -10, bottom: 5}}>
                                                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748B'}}/>
                                                <YAxis allowDecimals={false} label={{ value: 'Students', angle: -90, position: 'insideLeft', fill: '#64748B' }} tick={{fontSize: 12, fill: '#64748B'}}/>
                                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}}/>
                                                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                                 <div className="grid grid-cols-2 gap-4">
                                    <Button onClick={() => setActiveTab('students')} variant="outline" className="!py-4 text-base"><PlusCircleIcon className="w-5 h-5 mr-2"/> Add Student</Button>
                                    <Button onClick={() => setCreateAssessmentModalOpen(true)} variant="secondary" className="!py-4 text-base"><SparklesIcon className="w-5 h-5 mr-2"/> Create Assessment</Button>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <Card className="h-full">
                                    <div className="flex items-center gap-2 mb-4"><ActivityIcon className="w-5 h-5 text-neutral-dark"/><h3 className="font-bold text-neutral-dark">Recent Activity</h3></div>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {submissionsForClass.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 10).map(sub => {
                                            const student = students.find(s => s.id === sub.studentId);
                                            const assessment = assessments.find(a => a.id === sub.assessmentId);
                                            if (!student || !assessment) return null;
                                            return (
                                                <div key={sub.id} className="flex items-center gap-3 p-2 bg-surface/50 rounded-md">
                                                    <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full"/>
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-dark leading-tight">{student.name} submitted <span className="font-bold">{assessment.title}</span></p>
                                                        <p className="text-xs text-neutral-medium">{formatTimeAgo(sub.submittedAt)} &middot; Score: <span className="font-bold">{sub.result.percentage.toFixed(0)}%</span></p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {submissionsForClass.length === 0 && <p className="text-sm text-center text-neutral-medium py-8">No student submissions yet.</p>}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <div className="animate-fade-in">
                            <form onSubmit={handleAddStudentSubmit} className="flex gap-2 mb-6">
                                <input type="email" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="Add student by email..." className="flex-grow w-full px-4 py-2 bg-surface border border-neutral-light/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" required/>
                                <Button type="submit" variant="secondary" className="!px-4 !py-2 shrink-0">Add Student</Button>
                            </form>
                            <div className="space-y-2 max-h-[30rem] overflow-y-auto">
                                {studentsInClass.map(student => (
                                    <div key={student.id} className="grid grid-cols-12 items-center p-2 bg-surface/50 rounded-lg group transition-colors hover:bg-secondary/10">
                                        <div className="col-span-5 flex items-center">
                                            <img src={student.avatar} alt={student.name} className="h-8 w-8 rounded-full mr-3" />
                                            <span className="font-semibold text-neutral-dark group-hover:text-secondary-dark">{student.name}</span>
                                        </div>
                                        <div className="col-span-3 text-center">
                                            <p className="text-sm font-bold text-neutral-dark">{studentAverages[student.id]?.average.toFixed(1) || 'N/A'}%</p>
                                            <p className="text-xs text-neutral-medium">Avg. Score</p>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <p className="text-sm font-bold text-neutral-dark">{studentAverages[student.id]?.count || 0}</p>
                                            <p className="text-xs text-neutral-medium">Submitted</p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <Button variant="outline" onClick={() => onSelectStudent(student)} className="!p-1.5 mr-1"><EyeIcon className="h-4 w-4"/></Button>
                                            <button className="text-danger/70 hover:text-danger p-1 z-10 relative" onClick={() => handleRemoveStudentClick(student.id)}><XCircleIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'assessments' && (
                        <div className="animate-fade-in">
                           <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-neutral-extradark">Assessments for this Class</h3>
                                <Button variant="secondary" onClick={() => setCreateAssessmentModalOpen(true)} className="!py-1.5 !px-3 text-sm"><SparklesIcon className="h-4 w-4 mr-2"/>Create New</Button>
                            </div>
                             <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-2">
                                {assessmentsForClass.length > 0 ? assessmentsForClass.map(assessment => {
                                    const submissionCount = submissions.filter(s => s.assessmentId === assessment.id).length;
                                    const isExpanded = expandedAssessmentId === assessment.id;
                                    return (
                                        <div key={assessment.id} className="bg-surface/50 rounded-lg overflow-hidden border border-neutral-light/50">
                                            <button onClick={() => setExpandedAssessmentId(isExpanded ? null : assessment.id)} className="w-full text-left p-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-neutral-dark">{assessment.title}</p>
                                                    <p className="text-sm text-neutral-medium">{submissionCount} / {studentsInClass.length} submitted</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-24"><ProgressBar value={submissionCount} max={studentsInClass.length} /></div>
                                                    <ChevronsDown className={`w-5 h-5 text-neutral transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div className="p-4 border-t border-neutral-light/50 animate-fade-in">
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" onClick={() => onEditAssessment(assessment)} className="!py-1 !px-3 text-sm flex-1"><EditIcon className="h-4 w-4 mr-2"/>Customize Questions</Button>
                                                        <Button variant="secondary" onClick={() => onNavigate('smartClassInsight', { assessmentId: assessment.id, classId: selectedClass.id })} className="!py-1 !px-3 text-sm flex-1"><BarChartIcon className="h-4 w-4 mr-2"/>View Full Report</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : <p className="text-center text-neutral-medium py-8">No assessments assigned to this class yet.</p>}
                            </div>
                        </div>
                    )}
                     {activeTab === 'materials' && (
                        <div className="animate-fade-in">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-neutral-extradark">Class Materials</h3>
                                <Button variant="secondary" onClick={handleUploadClick} className="!py-1.5 !px-3 text-sm">
                                    <UploadCloudIcon className="h-4 w-4 mr-2"/>Upload New File
                                </Button>
                            </div>
                            <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-2">
                                {resourcesForClass.length > 0 ? resourcesForClass.map(res => (
                                    <div key={res.id} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg border border-neutral-light/50">
                                        <div className="flex items-center gap-3">
                                            <FileTextIcon className="w-6 h-6 text-neutral shrink-0"/>
                                            <div>
                                                <p className="font-semibold text-neutral-dark">{res.fileName}</p>
                                                <p className="text-xs text-neutral-medium">Uploaded: {new Date(res.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button variant="danger" onClick={() => onDeleteResource(res.id)} className="!p-2">
                                            <Trash2Icon className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-center text-neutral-medium py-8">No materials have been uploaded for this class yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Modal isOpen={isCreateAssessmentModalOpen} onClose={closeAndResetAssessmentModal} title={creationMode === 'choice' ? 'Create New Assessment' : creationMode === 'ai' ? 'Generate with AI' : 'Create Manually'}>
                {creationMode === 'choice' && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-neutral-dark mb-6 text-center">How would you like to create this assessment?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div onClick={() => setCreationMode('ai')} className="p-8 text-center rounded-2xl bg-surface/50 border-2 border-transparent hover:border-secondary hover:shadow-lg transition-all cursor-pointer">
                                <SparklesIcon className="h-12 w-12 text-secondary mx-auto mb-3" />
                                <h4 className="font-bold text-lg text-secondary-dark">Generate with AI</h4>
                                <p className="text-sm text-neutral-medium mt-1">Let our AI create questions for you based on your topic and difficulty.</p>
                            </div>
                            <div onClick={() => setCreationMode('manual')} className="p-8 text-center rounded-2xl bg-surface/50 border-2 border-transparent hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                                <EditIcon className="h-12 w-12 text-primary mx-auto mb-3" />
                                <h4 className="font-bold text-lg text-primary-dark">Create Manually</h4>
                                <p className="text-sm text-neutral-medium mt-1">Write your own questions and build the assessment from scratch.</p>
                            </div>
                        </div>
                    </div>
                )}
                {creationMode === 'ai' && (
                     <div className="animate-fade-in">
                        <style>{`
                            .range-thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #0891B2; cursor: pointer; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
                            .range-thumb::-moz-range-thumb { width: 20px; height: 20px; background: #0891B2; cursor: pointer; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
                        `}</style>
                        <button type="button" onClick={() => setCreationMode('choice')} className="text-sm font-semibold text-primary mb-4">&larr; Back to options</button>
                        <div className="mb-6">
                            <div className="flex items-center justify-center">
                                {[1, 2, 3].map((step, index) => (
                                    <React.Fragment key={step}>
                                        <div className="flex flex-col items-center text-center w-24">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${assessmentModalStep >= step ? 'bg-secondary text-white' : 'bg-neutral-light/50 text-neutral-medium'}`}>
                                                {assessmentModalStep > step ? <CheckIcon className="w-5 h-5"/> : step}
                                            </div>
                                            <p className={`text-xs font-semibold mt-2 ${assessmentModalStep >= step ? 'text-secondary-dark' : 'text-neutral-medium'}`}>
                                                {['Details', 'Configure', 'Assign'][index]}
                                            </p>
                                        </div>
                                        {index < 2 && <div className={`flex-1 h-1 mx-2 transition-colors ${assessmentModalStep > step ? 'bg-secondary' : 'bg-neutral-light/50'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <form onSubmit={handleCreateAIAssessmentSubmit}>
                            <div style={{ display: assessmentModalStep === 1 ? 'block' : 'none' }}>
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-bold text-neutral-dark mb-1">Assessment Title</label>
                                        <input id="title" name="title" type="text" value={assessmentForm.title} onChange={handleFormChange} required className={formInputClasses} placeholder="e.g., Mid-term Exam on Algebra"/>
                                    </div>
                                    <div>
                                        <label htmlFor="academicLevel" className="block text-sm font-bold text-neutral-dark mb-1">Academic Level</label>
                                        <select id="academicLevel" name="academicLevel" value={assessmentForm.academicLevel} onChange={handleFormChange} className={formInputClasses}>{Object.keys(academicSubjects).map(level => <option key={level} value={level}>{level}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-dark mb-2">Subject</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {assessmentForm.academicLevel && Object.keys(academicSubjects[assessmentForm.academicLevel as keyof typeof academicSubjects] || {}).map(subject => (
                                                <button type="button" key={subject} onClick={() => { updateAssessmentForm('subject', subject); }} className={`p-4 text-center rounded-xl border-2 font-semibold transition-all ${assessmentForm.subject === subject ? 'bg-secondary/10 border-secondary text-secondary-dark' : 'bg-surface/50 border-neutral-light/50 hover:border-secondary/50'}`}>{subject}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {assessmentForm.subject && (
                                        <div className="animate-fade-in">
                                            <label htmlFor="topic" className="block text-sm font-bold text-neutral-dark mb-2">Topic</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {(academicSubjects[assessmentForm.academicLevel as keyof typeof academicSubjects]?.[assessmentForm.subject] || []).map((topic: string) => (
                                                    <button type="button" key={topic} onClick={() => updateAssessmentForm('topic', topic)} className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-colors ${assessmentForm.topic === topic ? 'bg-secondary text-white' : 'bg-neutral-light/40 hover:bg-neutral-light/80'}`}>{topic}</button>
                                                ))}
                                            </div>
                                            <input id="topic" name="topic" type="text" value={assessmentForm.topic} onChange={handleFormChange} required disabled={!assessmentForm.subject} className={formInputClasses} placeholder="Or type a custom topic"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div style={{ display: assessmentModalStep === 2 ? 'block' : 'none' }}>
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label htmlFor="questionCount" className="block text-sm font-bold text-neutral-dark mb-2">Number of Questions: <span className="font-bold text-lg text-secondary ml-2">{assessmentForm.questionCount}</span></label>
                                        <input id="questionCount" name="questionCount" type="range" min="5" max="25" value={assessmentForm.questionCount} onChange={handleFormChange} className="w-full h-2 bg-neutral-light/30 rounded-lg appearance-none cursor-pointer range-thumb" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-dark mb-2">Difficulty</label>
                                        <div className="flex rounded-lg border-2 border-neutral-light/50 p-1 bg-surface/50">
                                            {(['easy', 'medium', 'hard'] as const).map(level => (
                                                <button type="button" key={level} onClick={() => updateAssessmentForm('difficulty', level)} className={`flex-1 capitalize text-center font-semibold p-2 rounded-md transition-colors ${assessmentForm.difficulty === level ? 'bg-secondary text-white shadow' : 'text-neutral-medium hover:bg-neutral-light/40'}`}>{level}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="duration" className="block text-sm font-bold text-neutral-dark mb-1">Duration (minutes)</label>
                                        <input id="duration" name="duration" type="number" value={assessmentForm.duration} onChange={handleFormChange} required className={formInputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-bold text-neutral-dark mb-1">Description (Optional)</label>
                                        <textarea id="description" name="description" value={assessmentForm.description} onChange={handleFormChange} rows={3} className={formInputClasses} placeholder="Provide some context for your students..."></textarea>
                                    </div>
                                </div>
                            </div>
                             <div style={{ display: assessmentModalStep === 3 ? 'block' : 'none' }}>
                                <div className="space-y-4 animate-fade-in">
                                    <h3 className="text-xl font-bold text-neutral-dark">Assign to Classrooms</h3>
                                    <p className="text-neutral-medium">Students in the selected classrooms will be notified.</p>
                                    {selectedClass && assessmentForm.classIds.has(selectedClass.id) && (
                                        <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success-dark">
                                            ✓ <strong>{selectedClass.name}</strong> is selected
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-1 -m-1">
                                        {classrooms.map(c => (
                                            <div key={c.id} onClick={() => handleClassCheckboxChange(c.id)} role="checkbox" aria-checked={assessmentForm.classIds.has(c.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${assessmentForm.classIds.has(c.id) ? 'border-secondary bg-secondary/10 shadow-md' : 'bg-surface/50 border-neutral-light/50 hover:border-secondary/50'}`}>
                                                {assessmentForm.classIds.has(c.id) && <div className="absolute top-3 right-3 bg-secondary text-white rounded-full p-1 shadow"><CheckIcon className="w-4 h-4" /></div>}
                                                <p className={`font-bold text-lg ${assessmentForm.classIds.has(c.id) ? 'text-secondary-dark' : 'text-neutral-extradark'}`}>{c.name}</p>
                                                <div className="flex items-center text-sm text-neutral-medium mt-1"><UsersIcon className="w-4 h-4 mr-1.5" /><span>{c.studentIds.length} students</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-8 pt-4 border-t border-black/10">
                                <Button type="button" variant="outline" onClick={() => setAssessmentModalStep(p => p - 1)} disabled={assessmentModalStep === 1}>Back</Button>
                                {assessmentModalStep < 3 ? (
                                    <Button type="button" variant="secondary" onClick={() => setAssessmentModalStep(p => p + 1)}>Next <ChevronRightIcon className="w-4 h-4 ml-1"/></Button>
                                ) : (
                                    <Button type="submit" variant="success" disabled={isGeneratingQuiz || assessmentForm.classIds.size === 0}>
                                        {isGeneratingQuiz ? 'Generating...' : 'Create & Assign'} <SparklesIcon className="w-4 h-4 ml-2"/>
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
                {creationMode === 'manual' && (
                    <div className="animate-fade-in">
                        <button type="button" onClick={() => setCreationMode('choice')} className="text-sm font-semibold text-primary mb-4">&larr; Back to options</button>
                        <form onSubmit={handleCreateManualSubmit} className="space-y-4">
                            <div><label htmlFor="title-manual" className="block text-sm font-medium text-neutral-dark">Assessment Title</label><input id="title-manual" name="title" type="text" value={assessmentForm.title} onChange={handleFormChange} required className={formInputClasses} /></div>
                            <div><label htmlFor="academicLevel-manual" className="block text-sm font-medium text-neutral-dark">Academic Level</label><select id="academicLevel-manual" name="academicLevel" value={assessmentForm.academicLevel} onChange={handleFormChange} className={formInputClasses}>{Object.keys(academicSubjects).map(level => <option key={level} value={level}>{level}</option>)}</select></div>
                            <div><label htmlFor="subject-manual" className="block text-sm font-medium text-neutral-dark">Subject</label><select id="subject-manual" name="subject" value={assessmentForm.subject} onChange={handleFormChange} required disabled={!assessmentForm.academicLevel} className={formInputClasses}><option value="">-- Select Subject --</option>{assessmentForm.academicLevel && Object.keys(academicSubjects[assessmentForm.academicLevel as keyof typeof academicSubjects] || {}).map(subject => (<option key={subject} value={subject}>{subject}</option>))}</select></div>
                            <div><label htmlFor="topic-manual" className="block text-sm font-medium text-neutral-dark">Topic</label><input id="topic-manual" name="topic" type="text" value={assessmentForm.topic} onChange={handleFormChange} list="topics-list-manual" required disabled={!assessmentForm.subject} className={formInputClasses} /><datalist id="topics-list-manual">{assessmentForm.subject && (academicSubjects[assessmentForm.academicLevel as keyof typeof academicSubjects]?.[assessmentForm.subject] || []).map((topic: string) => (<option key={topic} value={topic} />))}</datalist></div>
                            <div className="grid grid-cols-2 gap-6">
                                <div><label htmlFor="duration-manual" className="block text-sm font-medium text-neutral-dark">Duration (minutes)</label><input id="duration-manual" name="duration" type="number" value={assessmentForm.duration} onChange={handleFormChange} required className={formInputClasses} /></div>
                                <div><label htmlFor="difficulty-manual" className="block text-sm font-medium text-neutral-dark">Difficulty</label><select id="difficulty-manual" name="difficulty" value={assessmentForm.difficulty} onChange={handleFormChange} className={formInputClasses}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                            </div>
                            <div><label htmlFor="description-manual" className="block text-sm font-medium text-neutral-dark">Description (Optional)</label><textarea id="description-manual" name="description" value={assessmentForm.description} onChange={handleFormChange} rows={2} className={formInputClasses}></textarea></div>
                            <h3 className="font-bold text-neutral-dark pt-2">Assign to Classrooms</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-40 overflow-y-auto p-1">
                                {classrooms.map(c => (
                                    <div key={c.id} onClick={() => handleClassCheckboxChange(c.id)} role="checkbox" aria-checked={assessmentForm.classIds.has(c.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${assessmentForm.classIds.has(c.id) ? 'border-secondary bg-secondary/10' : 'border-neutral-light/50 hover:border-secondary/50'}`}>
                                        {assessmentForm.classIds.has(c.id) && (<div className="absolute top-2 right-2 bg-secondary text-white rounded-full p-0.5"><CheckIcon className="w-3 h-3" /></div>)}
                                        <p className="font-bold text-secondary-dark">{c.name}</p>
                                        <div className="flex items-center text-sm text-neutral-medium mt-1"><UsersIcon className="w-4 h-4 mr-1.5" /><span>{c.studentIds.length} students</span></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                                <Button type="button" variant="outline" onClick={closeAndResetAssessmentModal}>Cancel</Button>
                                <Button type="submit" variant="success" disabled={assessmentForm.classIds.size === 0}>
                                    Create & Add Questions
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
};


const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = (props) => {
    return (
        <>
            <header className="mb-8">
                <div className="flex items-center">
                    <LayoutGridIcon className="h-8 w-8 text-secondary mr-3" />
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Teacher Dashboard</h1>
                </div>
                <p className="text-lg text-neutral-medium mt-1">Manage your classrooms and monitor student performance.</p>
            </header>

            {props.selectedClass 
                ? <ClassDetail {...props} /> 
                : <ClassList 
                    classrooms={props.classrooms} 
                    onCreateClass={props.onCreateClass} 
                    onSelectClass={props.onSelectClass}
                    onDeleteClass={props.onDeleteClass}
                    assessments={props.assessments}
                    submissions={props.submissions}
                  />
            }
        </>
    );
};

export default TeacherDashboardView;