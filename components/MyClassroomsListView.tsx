import React from 'react';
import { Classroom, User, Assessment, Submission } from '../types';
import { View } from '../App';
import Card from './Card';
import Button from './Button';
import { BookOpenIcon, BellIcon, CheckCircleIcon } from './icons';

interface MyClassroomsListViewProps {
  user: User;
  classrooms: Classroom[];
  onNavigate: (view: View, payload?: any) => void;
  assessments: Assessment[];
  submissions: Submission[];
  allUsers: User[];
}

const MyClassroomsListView: React.FC<MyClassroomsListViewProps> = ({ user, classrooms, onNavigate, assessments, submissions, allUsers }) => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-secondary mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">My Classrooms</h1>
          </div>
          <p className="text-lg text-neutral-medium mt-1">Select a classroom to view assignments and materials.</p>
        </header>

        {classrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map(c => {
              const teacher = allUsers.find(u => u.id === c.teacherId);
              const assignmentsForClass = assessments.filter(a => a.classId === c.id);
              const submittedAssessmentIds = submissions
                  .filter(s => s.studentId === user.id)
                  .map(s => s.assessmentId);
              const pendingCount = assignmentsForClass.filter(a => !submittedAssessmentIds.includes(a.id)).length;

              return (
                <Card key={c.id} className="!p-0 flex flex-col hover:-translate-y-1 transition-transform duration-300 group">
                  <div className="p-6 flex-grow">
                    {teacher && (
                      <div className="flex items-center mb-4">
                        <img src={teacher.avatar} alt={teacher.name} className="h-8 w-8 rounded-full mr-3" />
                        <div>
                          <p className="text-xs font-semibold text-neutral-medium">Taught by</p>
                          <p className="font-bold text-neutral-dark">{teacher.name}</p>
                        </div>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-primary group-hover:text-primary-dark transition-colors">{c.name}</h3>

                    <div className="mt-4 pt-4 border-t border-black/5">
                        {pendingCount > 0 ? (
                            <div className="flex items-center p-3 rounded-lg bg-warning/10 text-warning-dark">
                                <BellIcon className="h-6 w-6 mr-3 shrink-0" />
                                <div>
                                    <p className="font-bold">{pendingCount} Pending Assignment{pendingCount > 1 ? 's' : ''}</p>
                                    <p className="text-xs">Complete them to improve your score!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center p-3 rounded-lg bg-success/10 text-success-dark">
                                <CheckCircleIcon className="h-6 w-6 mr-3 shrink-0" />
                                <div>
                                    <p className="font-bold">All Caught Up!</p>
                                    <p className="text-xs">No pending assignments.</p>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                  <div className="bg-black/5 p-4 mt-auto">
                    <Button
                      variant="secondary"
                      onClick={() => onNavigate('studentClassroom', { classId: c.id })}
                      className="w-full !py-2.5"
                    >
                      Enter Classroom
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <h3 className="text-xl font-bold">You're not enrolled in any classes yet.</h3>
            <p className="text-neutral-medium mt-2">Use the "Join a Classroom" button in the header to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyClassroomsListView;