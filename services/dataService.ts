/**
 * Unified Data Service
 * Manages all real-time data synchronization between teacher and student dashboards
 * Ensures assessments, submissions, and feedback are immediately visible across all users
 */

import { Assessment, Classroom, Notification, Submission, TeacherFeedback, User } from '../types';

export interface DashboardDataCache {
    assessments: Assessment[];
    submissions: Submission[];
    classrooms: Classroom[];
    notifications: Notification[];
    lastUpdated: string;
}

class UnifiedDataService {
    private cache: DashboardDataCache = {
        assessments: [],
        submissions: [],
        classrooms: [],
        notifications: [],
        lastUpdated: new Date().toISOString(),
    };

    private listeners: ((data: DashboardDataCache) => void)[] = [];

    /**
     * Subscribe to data changes
     * When any data is updated, all listeners are notified
     */
    subscribe(callback: (data: DashboardDataCache) => void): () => void {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    /**
     * Notify all listeners of data changes
     */
    private notifyListeners() {
        this.cache.lastUpdated = new Date().toISOString();
        this.listeners.forEach(listener => listener(this.cache));
    }

    /**
     * Update assessments and trigger real-time updates
     */
    updateAssessments(assessments: Assessment[]) {
        this.cache.assessments = assessments;
        this.notifyListeners();
    }

    /**
     * Add a new assessment and notify all connected clients
     */
    addAssessment(assessment: Assessment) {
        this.cache.assessments.push(assessment);
        this.notifyListeners();
    }

    /**
     * Update submissions when a student completes an assessment
     * This triggers real-time updates for teacher dashboard
     */
    updateSubmissions(submissions: Submission[]) {
        this.cache.submissions = submissions;
        this.notifyListeners();
    }

    /**
     * Add a new submission (when student completes assessment)
     */
    addSubmission(submission: Submission) {
        this.cache.submissions.push(submission);
        this.notifyListeners();
    }

    /**
     * Add teacher feedback to a submission
     * Student dashboard gets real-time notification
     */
    addFeedback(submissionId: string, feedback: TeacherFeedback) {
        const submission = this.cache.submissions.find(s => s.id === submissionId);
        if (submission) {
            submission.feedback = feedback;
            this.notifyListeners();
        }
    }

    /**
     * Update classrooms
     */
    updateClassrooms(classrooms: Classroom[]) {
        this.cache.classrooms = classrooms;
        this.notifyListeners();
    }

    /**
     * Get assessments for a specific class
     */
    getClassAssessments(classId: string): Assessment[] {
        return this.cache.assessments.filter(a => a.classId === classId);
    }

    /**
     * Get submissions for a specific assessment
     */
    getAssessmentSubmissions(assessmentId: string): Submission[] {
        return this.cache.submissions.filter(s => s.assessmentId === assessmentId);
    }

    /**
     * Get student's submissions
     */
    getStudentSubmissions(studentId: string): Submission[] {
        return this.cache.submissions.filter(s => s.studentId === studentId);
    }

    /**
     * Get real-time class statistics
     */
    getClassStats(classId: string, classroom: Classroom, students: User[]) {
        const classAssessments = this.getClassAssessments(classId);
        const assessmentIds = new Set(classAssessments.map(a => a.id));
        const classSubmissions = this.cache.submissions.filter(s => assessmentIds.has(s.assessmentId));

        const studentsInClass = students.filter(s => classroom.studentIds.includes(s.id));
        const totalPossibleSubmissions = studentsInClass.length * classAssessments.length;
        const submissionRate = totalPossibleSubmissions > 0 ? (classSubmissions.length / totalPossibleSubmissions) * 100 : 0;

        const totalScore = classSubmissions.reduce((acc, s) => acc + s.result.percentage, 0);
        const classAverage = classSubmissions.length > 0 ? (totalScore / classSubmissions.length) : 0;

        return {
            totalAssessments: classAssessments.length,
            totalSubmissions: classSubmissions.length,
            submissionRate,
            classAverage,
            assessments: classAssessments,
            submissions: classSubmissions,
        };
    }

    /**
     * Get real-time student performance for teacher dashboard
     */
    getStudentPerformance(studentId: string, assessmentIds: string[]) {
        const assessmentIdSet = new Set(assessmentIds);
        const studentSubmissions = this.cache.submissions.filter(
            s => s.studentId === studentId && assessmentIdSet.has(s.assessmentId)
        );

        const averageScore = studentSubmissions.length > 0
            ? studentSubmissions.reduce((acc, s) => acc + s.result.percentage, 0) / studentSubmissions.length
            : 0;

        return {
            totalAssessmentsTaken: studentSubmissions.length,
            averageScore,
            submissions: studentSubmissions,
        };
    }

    /**
     * Get notifications for a specific user
     */
    getUserNotifications(userId: string): Notification[] {
        return this.cache.notifications.filter(n => n.userId === userId);
    }

    /**
     * Add notification
     */
    addNotification(notification: Notification) {
        this.cache.notifications.push(notification);
        this.notifyListeners();
    }

    /**
     * Mark notification as read
     */
    markNotificationAsRead(notificationId: string) {
        const notification = this.cache.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.notifyListeners();
        }
    }

    /**
     * Get real-time insights for student
     */
    getStudentRecentActivity(studentId: string, limit: number = 5) {
        const submissions = this.getStudentSubmissions(studentId);
        return submissions
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
            .slice(0, limit);
    }

    /**
     * Clear all cache (useful for testing)
     */
    clearCache() {
        this.cache = {
            assessments: [],
            submissions: [],
            classrooms: [],
            notifications: [],
            lastUpdated: new Date().toISOString(),
        };
        this.notifyListeners();
    }
}

// Export singleton instance
export const unifiedDataService = new UnifiedDataService();
