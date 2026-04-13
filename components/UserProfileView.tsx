import React, { useState, useMemo } from 'react';
import { User, Classroom } from '../types';
import Card from './Card';
import Button from './Button';
import { UserIcon, EditIcon, BookOpenIcon, BriefcaseIcon, GraduationCapIcon, CheckIcon, LayoutGridIcon, BrainCircuitIcon } from './icons';

interface UserProfileViewProps {
  user: User;
  onUpdateProfile: (updatedUser: User) => void;
  onBack: () => void;
  classrooms?: Classroom[];
  students?: User[];
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="text-center">
        <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto text-secondary">
            {icon}
        </div>
        <p className="mt-2 text-3xl font-bold font-display text-neutral-extradark">{value}</p>
        <p className="text-sm font-semibold text-neutral">{label}</p>
    </div>
);

// --- Sub-components for each profile type ---

const StudentProfile: React.FC<{
    user: User;
    onUpdateProfile: (user: User) => void;
}> = ({ user, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSaveChanges = () => {
        onUpdateProfile({ ...user, name, email });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(user.name);
        setEmail(user.email);
        setIsEditing(false);
    };

    const educationLevels = [
      { name: 'SSC (Class 9-10)', icon: <BookOpenIcon />, color: 'text-primary' },
      { name: 'HSC (Class 11-12)', icon: <BriefcaseIcon />, color: 'text-secondary' },
      { name: 'University Level', icon: <GraduationCapIcon />, color: 'text-success' },
      { name: 'Solo Leveling', icon: <BrainCircuitIcon />, color: 'text-danger' },
    ];

    return (
        <div className="space-y-8">
            <Card>
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full border-4 border-white shadow-lg" />
                  <div className="ml-4">
                    {isEditing ? (
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="text-2xl font-bold font-display text-neutral-extradark bg-transparent border-b-2 border-primary focus:outline-none"/>
                    ) : (
                      <h2 className="text-2xl font-bold font-display text-neutral-extradark">{user.name}</h2>
                    )}
                    {isEditing ? (
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-neutral-medium bg-transparent border-b-2 border-primary/50 focus:outline-none mt-1" />
                    ) : (
                      <p className="text-neutral-medium">{user.email}</p>
                    )}
                  </div>
                </div>
                {!isEditing && <Button onClick={() => setIsEditing(true)} variant="outline" className="!p-2"><EditIcon className="h-5 w-5" /></Button>}
              </div>
              {isEditing && (
                 <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                 </div>
              )}
            </Card>
            <Card>
                <h3 className="text-xl font-bold font-display text-neutral-extradark mb-4">Academic Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {educationLevels.map(level => {
                        const isSelected = user.educationLevel === level.name;
                        return (
                            <div key={level.name} onClick={() => onUpdateProfile({ ...user, educationLevel: level.name })} className={`p-6 text-center rounded-2xl transition-all duration-300 cursor-pointer relative border-4 group ${isSelected ? 'border-primary shadow-lg scale-105' : 'border-transparent hover:border-primary/30'}`} role="button" tabIndex={0}>
                                <div className={`absolute inset-0 rounded-xl transition-opacity ${isSelected ? 'bg-primary/10' : 'bg-surface/50 group-hover:bg-primary/5'}`}></div>
                                {isSelected && <div className="absolute -top-3 -right-3 bg-primary text-white rounded-full p-1.5 shadow-md"><CheckIcon className="h-4 w-4" /></div>}
                                <div className="relative z-10">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-colors ${isSelected ? 'bg-primary/20' : 'bg-neutral-light/30 group-hover:bg-primary/10'}`}>
                                        {React.cloneElement(level.icon, { className: `h-10 w-10 transition-transform group-hover:scale-110 ${isSelected ? level.color : 'text-neutral-dark'}` })}
                                    </div>
                                    <p className={`mt-4 font-bold text-lg transition-colors ${isSelected ? 'text-primary-dark' : 'text-neutral-extradark'}`}>{level.name}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};

const TeacherProfileEditor: React.FC<{
    user: User;
    onSave: (updatedData: Partial<User>) => void;
    onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user.name, email: user.email, institution: user.institution || '',
        subjects: user.subjects?.join(', ') || '', experience: user.experience || 0, bio: user.bio || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = () => {
        onSave({
            ...formData,
            subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
            experience: Number(formData.experience) || 0,
        });
    };

    const inputClasses = "mt-1 block w-full px-4 py-3 bg-surface/50 border border-neutral-light/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary";
    const labelClasses = "block text-sm font-semibold text-neutral-dark";

    return (
        <Card>
            <h3 className="text-xl font-bold font-display text-neutral-extradark mb-6">Edit Profile</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClasses}/></div>
                    <div><label className={labelClasses}>Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Institution</label><input type="text" name="institution" value={formData.institution} onChange={handleInputChange} className={inputClasses}/></div>
                    <div><label className={labelClasses}>Years of Experience</label><input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className={inputClasses}/></div>
                </div>
                <div><label className={labelClasses}>Subjects Taught (comma-separated)</label><input type="text" name="subjects" value={formData.subjects} onChange={handleInputChange} className={inputClasses}/></div>
                <div><label className={labelClasses}>About Me</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className={inputClasses}></textarea></div>
            </div>
             <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-black/10">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveChanges} variant="secondary">Save Changes</Button>
             </div>
        </Card>
    );
};

const TeacherProfile: React.FC<{
    user: User;
    classrooms: Classroom[];
    onEdit: () => void;
}> = ({ user, classrooms, onEdit }) => {
    const managedClassrooms = classrooms.filter(c => c.teacherId === user.id);
    const totalStudents = managedClassrooms.reduce((sum, c) => sum + c.studentIds.length, 0);

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full border-4 border-white shadow-lg" />
                      <div className="mt-4 sm:mt-0 sm:ml-6">
                        <h2 className="text-3xl font-bold font-display text-neutral-extradark">{user.name}</h2>
                        <div className="flex items-center text-secondary-dark font-semibold mt-1">
                            <BriefcaseIcon className="h-5 w-5 mr-2" />
                            <span>{user.institution || 'Institution not set'}</span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={onEdit} variant="outline" className="!p-2">
                      <EditIcon className="h-5 w-5" />
                    </Button>
                </div>
            </Card>
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-black/5">
                    <StatCard icon={<LayoutGridIcon className="h-8 w-8"/>} label="Classrooms" value={managedClassrooms.length} />
                    <StatCard icon={<UserIcon className="h-8 w-8"/>} label="Total Students" value={totalStudents} />
                    <StatCard icon={<BookOpenIcon className="h-8 w-8"/>} label="Subjects" value={user.subjects?.length || 0} />
                    <StatCard icon={<GraduationCapIcon className="h-8 w-8"/>} label="Experience" value={`${user.experience || 0} yrs`} />
                </div>
            </Card>
             <Card>
                <h3 className="text-xl font-bold font-display text-neutral-extradark mb-4">About Me</h3>
                <p className="text-neutral-dark leading-relaxed">{user.bio || 'No biography provided.'}</p>
            </Card>
            <Card>
                <h3 className="text-xl font-bold font-display text-neutral-extradark mb-4">Subjects Taught</h3>
                <div className="flex flex-wrap gap-3">
                    {user.subjects && user.subjects.length > 0 ? user.subjects.map(subject => (
                        <span key={subject} className="px-4 py-2 bg-secondary/10 text-secondary-dark font-semibold rounded-full text-sm">
                            {subject}
                        </span>
                    )) : <p className="text-neutral-medium text-sm">No subjects listed.</p>}
                 </div>
            </Card>
        </div>
    );
};


const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdateProfile, onBack, classrooms = [], students = [] }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedData: Partial<User>) => {
    onUpdateProfile({ ...user, ...updatedData });
    setIsEditing(false);
  };

  const renderContent = () => {
    if (user.role === 'teacher') {
        if (isEditing) {
            return <TeacherProfileEditor user={user} onSave={handleUpdate} onCancel={() => setIsEditing(false)} />
        }
        return <TeacherProfile user={user} classrooms={classrooms} onEdit={() => setIsEditing(true)} />;
    }
    return <StudentProfile user={user} onUpdateProfile={onUpdateProfile} />;
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center">
          <UserIcon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">My Profile</h1>
        </div>
        <p className="text-lg text-neutral-medium mt-1">View and manage your account details.</p>
      </header>

      {renderContent()}

      <div className="text-center mt-8">
        <Button onClick={onBack} variant="outline">Back to Dashboard</Button>
      </div>
    </div>
  );
};

export default UserProfileView;