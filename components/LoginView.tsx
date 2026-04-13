import React, { useState } from 'react';
import Button from './Button';
import { ArrowLeftIcon, BookOpenIcon, BrainCircuitIcon, BriefcaseIcon, LockIcon, UserIcon } from './icons';

interface LoginViewProps {
  onLogin: (user: { email: string, pass: string, role: 'student' | 'teacher' }) => void;
  onStudentSignup: (signupData: { name: string, email: string, pass: string }) => void;
}

// --- Sub-components for each view ---

const LandingHero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden rounded-3xl bg-white/50 backdrop-blur-xl border border-black/5 p-6 md:p-10 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left copy */}
        <div>
          <div className="uppercase tracking-widest text-xs font-semibold text-primary-dark">Welcome to EduSense Academy</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight text-neutral-extradark mt-4">
            Empowering the Future with AI Education
            {/* <br className="hidden md:block" /> */}
          </h1>
          <p className="text-neutral-medium mt-4 max-w-xl">
            Adapive Learning and Skill Intelligence for Every Learners.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {/* <Button variant="outline" onClick={onGetStarted} className="!py-3 !px-6">Free Trial</Button> */}
            <Button onClick={onGetStarted} className="!py-3 !px-6 animate-pulse hover:animate-none hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/50">Get Started</Button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="group cursor-pointer transition-all duration-300 hover:scale-110">
              <div className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all">98%</div>
              <div className="text-xs font-semibold text-neutral mt-1 group-hover:text-neutral-dark transition-colors">Success Rate</div>
            </div>
            <div className="group cursor-pointer transition-all duration-300 hover:scale-110">
              <div className="text-3xl font-display font-bold bg-gradient-to-r from-secondary to-secondary-dark bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all">50+</div>
              <div className="text-xs font-semibold text-neutral mt-1 group-hover:text-neutral-dark transition-colors">AI Courses</div>
            </div>
            <div className="group cursor-pointer transition-all duration-300 hover:scale-110">
              <div className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all">24/7</div>
              <div className="text-xs font-semibold text-neutral mt-1 group-hover:text-neutral-dark transition-colors">AI Support</div>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-xl border border-white/20 bg-aurora transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-white/40">
            <img
              src="/home-model.png"
              alt="VR learning illustration"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
          </div>
          {/* Floating stats */}
          <div className="absolute left-4 -bottom-6 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-md flex items-center gap-3 animate-bounce hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-xl hover:bg-white/90" style={{ animationDuration: '3s' }}>
            <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
              <BrainCircuitIcon className="h-6 w-6 transition-transform hover:rotate-12" />
            </div>
            <div>
              {/* <div className="text-xl font-display font-bold text-neutral-extradark">30+</div> */}
              <div className="text-xs font-semibold text-neutral">Human–AI <br /> Collaboration</div>
            </div>
          </div>
          <div className="absolute right-4 bottom-10 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-md flex items-center gap-3 animate-bounce hover:scale-105 transition-all duration-300 cursor-pointer hover:shadow-xl hover:bg-white/90" style={{ animationDuration: '3s', animationDelay: '1s' }}>
            <div className="bg-secondary/10 text-secondary p-3 rounded-xl group-hover:bg-secondary/20 transition-colors">
              <BookOpenIcon className="h-6 w-6 transition-transform hover:rotate-12" />
            </div>
            <div>
              <div className="text-xl font-display font-bold text-neutral-extradark">50+</div>
              <div className="text-xs font-semibold text-neutral">Expert AI Class</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const RoleSelect: React.FC<{ onSelectRole: (role: 'student' | 'teacher') => void, onBack: () => void }> = ({ onSelectRole, onBack }) => (
  <div className="relative">
    {/* Background decoration */}
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
    
    <button onClick={onBack} className="group flex items-center gap-2 text-sm font-semibold text-neutral-medium hover:text-neutral-dark mb-12 transition-all hover:gap-3">
      <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      Back to home
    </button>
    
    <div className="text-center mb-5">
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-5 py-2 rounded-full mb-1 animate-pulse">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Get Started</span>
      </div>
      <h2 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-neutral-extradark via-primary to-secondary bg-clip-text text-transparent leading-tight">Choose Your Role</h2>
      <p className="text-neutral-medium mt-4 text-lg max-w-2xl mx-auto">Select your path and unlock personalized AI-powered learning experiences</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        role="button"
        tabIndex={0}
        aria-label="I am a Student"
        onClick={() => onSelectRole('student')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRole('student'); }}
        className="group relative overflow-hidden rounded-3xl cursor-pointer bg-white/60 backdrop-blur-2xl border-2 border-white/40 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-3 hover:border-primary/60"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-indigo-500/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          <div className="bg-aurora w-full h-full animate-aurora-bg" />
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[100px] group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="relative z-10 p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-gradient-to-br from-primary to-indigo-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <span className="text-xs font-bold bg-gradient-to-r from-primary to-indigo-600 text-white px-4 py-2 rounded-full shadow-md uppercase tracking-wider">Popular</span>
          </div>
          
          <h3 className="text-3xl font-display font-bold text-neutral-extradark mb-2 group-hover:text-primary transition-colors">I am a Student</h3>
          <p className="text-neutral-medium text-sm mb-6">Personalized AI-powered learning journey tailored to your goals</p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span>Adaptive practice & assessments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span>Real-time AI tutoring support</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span>Personalized learning paths</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-neutral-light/30">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Free</div>
              <span className="text-xs text-neutral">to start</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
              <span>Get started</span>
              <span className="text-xl">→</span>
            </div>
          </div>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="I am a Teacher"
        onClick={() => onSelectRole('teacher')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRole('teacher'); }}
        className="group relative overflow-hidden rounded-3xl cursor-pointer bg-white/60 backdrop-blur-2xl border-2 border-white/40 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-3 hover:border-secondary/60"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-cyan-500/10 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          <div className="bg-aurora w-full h-full animate-aurora-bg" />
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-[100px] group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="relative z-10 p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-gradient-to-br from-secondary to-cyan-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <BriefcaseIcon className="w-10 h-10 text-white" />
            </div>
            <span className="text-xs font-bold bg-gradient-to-r from-secondary to-cyan-600 text-white px-4 py-2 rounded-full shadow-md uppercase tracking-wider">Pro</span>
          </div>
          
          <h3 className="text-3xl font-display font-bold text-neutral-extradark mb-2 group-hover:text-secondary transition-colors">I am a Teacher</h3>
          <p className="text-neutral-medium text-sm mb-6">Comprehensive classroom management with AI-powered insights</p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
              <span>Smart classroom analytics</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
              <span>Student progress tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-dark">
              <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
              <span>AI-generated assessments</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-neutral-light/30">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-display font-bold bg-gradient-to-r from-secondary to-cyan-600 bg-clip-text text-transparent">Free</div>
              <span className="text-xs text-neutral">to start</span>
            </div>
            <div className="flex items-center gap-2 text-secondary font-bold group-hover:gap-4 transition-all">
              <span>Continue</span>
              <span className="text-xl">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudentLogin: React.FC<{ onLogin: (creds: any) => void, onSwitchToSignup: () => void, onBack: () => void }> = ({ onLogin, onSwitchToSignup, onBack }) => {
    const [email, setEmail] = useState('rahul.sharma@example.com');
    const [password, setPassword] = useState('password');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin({ email, pass: password, role: 'student' });
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
            <button onClick={onBack} className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark mb-6 transition-all">
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to role selection
            </button>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-1.5 rounded-full mb-3">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">Student Portal</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-neutral-extradark">Welcome Back!</h2>
                <p className="text-neutral-medium mt-2">Sign in to continue your learning journey.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-neutral-dark mb-2">Email Address</label>
                    <div className="relative">
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                            placeholder="your.email@example.com"
                        />
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-neutral-dark mb-2">Password</label>
                    <div className="relative">
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                            placeholder="Enter your password"
                        />
                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                    </div>
                </div>
                <Button type="submit" className="w-full !py-3.5 !text-base font-semibold shadow-lg hover:shadow-xl transition-all">Sign In</Button>
            </form>
            <p className="text-center text-sm mt-6 text-neutral-medium">
                Don't have an account? <button type="button" onClick={onSwitchToSignup} className="font-bold text-primary hover:text-primary-dark hover:underline transition-colors">Sign Up</button>
            </p>
        </div>
    );
};

const StudentSignup: React.FC<{ onSignup: (data: any) => void, onBack: () => void }> = ({ onSignup, onBack }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSignup({ name, email, pass: password });
    };
    
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
            <button onClick={onBack} className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark mb-6 transition-all">
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to login
            </button>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-1.5 rounded-full mb-3">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">Create Account</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-neutral-extradark">Join EduSense</h2>
                <p className="text-neutral-medium mt-2">Start your learning journey today.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <div className="relative">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <div className="relative">
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                    />
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <Button type="submit" variant="primary" className="w-full !py-3.5 !text-base font-semibold shadow-lg hover:shadow-xl transition-all">Create Account</Button>
            </form>
        </div>
    );
};

const TeacherLogin: React.FC<{ onLogin: (creds: any) => void, onSwitchToSignup: () => void, onBack: () => void }> = ({ onLogin, onSwitchToSignup, onBack }) => {
    const [email, setEmail] = useState('priya.singh@example.com');
    const [password, setPassword] = useState('password123');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin({ email, pass: password, role: 'teacher' });
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-cyan-400 to-secondary-light"></div>
            <button onClick={onBack} className="group flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary-dark mb-6 transition-all">
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to role selection
            </button>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/10 to-secondary/5 px-4 py-1.5 rounded-full mb-3">
                    <BriefcaseIcon className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-semibold text-secondary">Teacher Portal</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-neutral-extradark">Welcome Back!</h2>
                <p className="text-neutral-medium mt-2">Access your classroom management dashboard.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="teacher-email" className="block text-sm font-semibold text-neutral-dark mb-2">Email Address</label>
                    <div className="relative">
                        <input 
                            id="teacher-email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-sm font-medium"
                            placeholder="your.email@school.com"
                        />
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                    </div>
                </div>
                <div>
                    <label htmlFor="teacher-password" className="block text-sm font-semibold text-neutral-dark mb-2">Password</label>
                    <div className="relative">
                        <input 
                            id="teacher-password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-sm font-medium"
                            placeholder="Enter your password"
                        />
                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                    </div>
                </div>
                <Button type="submit" variant="secondary" className="w-full !py-3.5 !text-base font-semibold shadow-lg hover:shadow-xl transition-all">Sign In</Button>
            </form>
            <p className="text-center text-sm mt-6 text-neutral-medium">
                Don't have an account? <button type="button" onClick={onSwitchToSignup} className="font-bold text-secondary hover:text-secondary-dark hover:underline transition-colors">Sign Up</button>
            </p>
        </div>
    );
};

const TeacherSignup: React.FC<{ onLogin: (creds: any) => void, onBack: () => void }> = ({ onLogin, onBack }) => {
    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Welcome, ${name}! Your teacher account has been created.`);
      onLogin({email: email, pass: password, role: 'teacher'});
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-cyan-400 to-secondary-light"></div>
            <button onClick={onBack} className="group flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary-dark mb-6 transition-all">
                <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to login
            </button>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/10 to-secondary/5 px-4 py-1.5 rounded-full mb-3">
                    <BriefcaseIcon className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-semibold text-secondary">Create Account</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-neutral-extradark">Join as Teacher</h2>
                <p className="text-neutral-medium mt-2">Empower your students with AI.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-sm font-medium"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Institution Name" 
                        value={institution} 
                        onChange={e => setInstitution(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-sm font-medium"
                    />
                    <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <div className="relative">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-sm font-medium"
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <div className="relative">
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        className="block w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-white to-surface/50 border-2 border-neutral-light/30 rounded-xl shadow-sm placeholder-neutral focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-sm font-medium"
                    />
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral" />
                </div>
                <Button type="submit" variant="secondary" className="w-full !py-3.5 !text-base font-semibold shadow-lg hover:shadow-xl transition-all">Create Account</Button>
            </form>
        </div>
    );
};


const LoginView: React.FC<LoginViewProps> = ({ onLogin, onStudentSignup }) => {
  const [viewMode, setViewMode] = useState<'landing' | 'role-select' | 'student-login' | 'student-signup' | 'teacher-login' | 'teacher-signup'>('landing');

  const renderContent = () => {
      switch (viewMode) {
          case 'landing':
            return <LandingHero onGetStarted={() => setViewMode('role-select')} />;
          case 'student-login': 
            return <StudentLogin 
                onLogin={onLogin} 
                onSwitchToSignup={() => setViewMode('student-signup')}
                onBack={() => setViewMode('role-select')}
            />;
          case 'student-signup': 
            return <StudentSignup
                onSignup={onStudentSignup}
                onBack={() => setViewMode('student-login')}
            />;
          case 'teacher-login': 
            return <TeacherLogin 
                onLogin={onLogin}
                onSwitchToSignup={() => setViewMode('teacher-signup')}
                onBack={() => setViewMode('role-select')}
            />;
          case 'teacher-signup':
            return <TeacherSignup
                onLogin={onLogin} // Simplified: signup logs in directly
                onBack={() => setViewMode('teacher-login')}
            />;
          case 'role-select':
          default:
            return <RoleSelect 
              onSelectRole={(role) => setViewMode(role === 'student' ? 'student-login' : 'teacher-login')}
              onBack={() => setViewMode('landing')}
            />;
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in-up overflow-hidden">
      {viewMode === 'landing' ? (
        <div className="max-w-7xl w-full">
          <div className="flex items-center justify-center mb-8 relative gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary-light to-secondary p-5 rounded-2xl shadow-lg mt-4">
                <BookOpenIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-6">
              <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-neutral-extradark via-primary to-secondary bg-clip-text text-transparent">
                EduSense AI
              </h1>
            </div>
          </div>
          {renderContent()}
        </div>
      ) : viewMode === 'role-select' ? (
        <div className="max-w-7xl w-full overflow-y-auto max-h-screen scrollbar-hide">
          {renderContent()}
        </div>
      ) : (
        <div className="max-w-md w-full">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default LoginView;