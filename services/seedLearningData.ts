/**
 * Seed Learning Data — populates Firestore with sample live sessions, recordings,
 * quizzes, capstones, attendance, submissions, and course progress.
 *
 * Call `seedLearningData()` from the admin dashboard or browser console.
 * It fetches existing courses, instructors, and students from Firestore,
 * then creates realistic linked records. Duplicate-safe: checks if
 * liveSessions already has docs before writing.
 */
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { signUp } from './authService';
import type {
  Course,
  Instructor,
  Student,
  LiveSession,
  SessionAttendance,
  Recording,
  RecordingProgress,
  Quiz,
  QuizQuestion,
  QuizSubmission,
  Capstone,
  CapstoneSubmission,
  CourseProgress,
} from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Main seed function ───────────────────────────────────────────────────────

export async function seedLearningData(): Promise<{ created: Record<string, number> }> {
  // 1. Check for existing data (prevent duplicates)
  const existingSessionsSnap = await getDocs(collection(db, 'liveSessions'));
  if (!existingSessionsSnap.empty) {
    throw new Error('Learning data already exists. Delete existing live sessions before re-seeding.');
  }

  // 2. Fetch existing entities from Firestore — or create them if empty
  const [coursesSnap, instructorsSnap, studentsSnap] = await Promise.all([
    getDocs(query(collection(db, 'courses'))),
    getDocs(query(collection(db, 'instructors'))),
    getDocs(query(collection(db, 'students'))),
  ]);

  let courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Course);
  let instructors = instructorsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Instructor);
  let students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Student);

  const created: Record<string, number> = {
    courses: 0,
    instructors: 0,
    students: 0,
    liveSessions: 0,
    sessionAttendance: 0,
    recordings: 0,
    recordingProgress: 0,
    quizzes: 0,
    quizQuestions: 0,
    quizSubmissions: 0,
    capstones: 0,
    capstoneSubmissions: 0,
    courseProgress: 0,
  };

  // Auto-seed instructors if none exist
  if (instructors.length === 0) {
    const seedInstructors: Array<Omit<Instructor, 'id'>> = [
      { name: 'Dr. Ahmed Hassan', role: 'Lead Instructor', experience: '15 years', qualifications: ['PhD Computer Science', 'AWS Certified'], bio: 'Expert in software engineering and cloud architecture with 15 years of industry experience.', image: '', specialization: 'Software Engineering', visible: true, createdAt: now, updatedAt: now },
      { name: 'Prof. Sara El-Masry', role: 'Senior Instructor', experience: '12 years', qualifications: ['MBA', 'PMP Certified'], bio: 'Business strategy and project management expert with extensive corporate training experience.', image: '', specialization: 'Business Strategy', visible: true, createdAt: now, updatedAt: now },
      { name: 'Eng. Omar Khalil', role: 'Instructor', experience: '8 years', qualifications: ['MSc Data Science', 'Google Certified'], bio: 'Data science and AI specialist focused on practical applications in the MENA region.', image: '', specialization: 'Data Science & AI', visible: true, createdAt: now, updatedAt: now },
    ];
    for (const inst of seedInstructors) {
      const ref = await addDoc(collection(db, 'instructors'), inst);
      instructors.push({ id: ref.id, ...inst } as Instructor);
    }
    created.instructors = seedInstructors.length;
  }

  // Auto-seed courses if none exist
  if (courses.length === 0) {
    const seedCourses: Array<Omit<Course, 'id'>> = [
      { title: 'Full-Stack Web Development Bootcamp', category: 'Technology', instructor: instructors[0].name, price: 2500, currency: 'EGP', rating: 4.8, enrolled: 45, capacity: 60, duration: '12 weeks', image: '', level: 'Intermediate', description: 'Comprehensive full-stack development covering React, Node.js, and cloud deployment.', visible: true, createdAt: now, updatedAt: now },
      { title: 'Strategic Business Leadership', category: 'Management', instructor: instructors[1].name, price: 3500, currency: 'EGP', rating: 4.9, enrolled: 30, capacity: 40, duration: '8 weeks', image: '', level: 'Advanced', description: 'Executive leadership program focusing on strategic thinking and organizational management.', visible: true, createdAt: now, updatedAt: now },
      { title: 'Data Science & Machine Learning Fundamentals', category: 'Technology', instructor: instructors[2].name, price: 2000, currency: 'EGP', rating: 4.7, enrolled: 55, capacity: 70, duration: '10 weeks', image: '', level: 'Beginner', description: 'Introduction to data science, Python, and machine learning with hands-on projects.', visible: true, createdAt: now, updatedAt: now },
      { title: 'Financial Analysis & Investment Strategy', category: 'Finance', instructor: instructors[1].name, price: 3000, currency: 'EGP', rating: 4.6, enrolled: 25, capacity: 35, duration: '6 weeks', image: '', level: 'Intermediate', description: 'Learn financial modeling, investment analysis, and portfolio management techniques.', visible: true, createdAt: now, updatedAt: now },
    ];
    for (const c of seedCourses) {
      const ref = await addDoc(collection(db, 'courses'), c);
      courses.push({ id: ref.id, ...c } as Course);
    }
    created.courses = seedCourses.length;
  }

  // Auto-seed students if none exist
  if (students.length === 0) {
    const seedStudents: Array<Omit<Student, 'id'>> = [
      { name: 'Youssef Amr', email: 'youssef@example.com', phone: '+201012345678', country: 'Egypt', groupIds: [], enrolledCourseIds: [courses[0].id, courses[1].id], level: 'intermediate', lifecycleStage: 'active', isActive: true, source: 'website', preferredLanguage: 'ar', createdAt: now, updatedAt: now },
      { name: 'Nour El-Din', email: 'nour@example.com', phone: '+201098765432', country: 'Egypt', groupIds: [], enrolledCourseIds: [courses[0].id], level: 'beginner', lifecycleStage: 'active', isActive: true, source: 'referral', preferredLanguage: 'ar', createdAt: now, updatedAt: now },
      { name: 'Fatima Al-Rashid', email: 'fatima@example.com', phone: '+971501234567', country: 'UAE', groupIds: [], enrolledCourseIds: [courses[0].id, courses[2].id], level: 'beginner', lifecycleStage: 'active', isActive: true, source: 'social', preferredLanguage: 'en', createdAt: now, updatedAt: now },
      { name: 'Khalid Al-Saud', email: 'khalid@example.com', phone: '+966512345678', country: 'Saudi Arabia', groupIds: [], enrolledCourseIds: [courses[1].id, courses[3].id], level: 'advanced', lifecycleStage: 'active', isActive: true, source: 'website', preferredLanguage: 'ar', createdAt: now, updatedAt: now },
      { name: 'Layla Ibrahim', email: 'layla@example.com', phone: '+201155556666', country: 'Egypt', groupIds: [], enrolledCourseIds: [courses[2].id], level: 'beginner', lifecycleStage: 'lead', isActive: true, source: 'website', preferredLanguage: 'en', createdAt: now, updatedAt: now },
      { name: 'Mohamed Tarek', email: 'mohamed.t@example.com', phone: '+201277778888', country: 'Egypt', groupIds: [], enrolledCourseIds: [courses[0].id, courses[2].id], level: 'intermediate', lifecycleStage: 'active', isActive: true, source: 'referral', preferredLanguage: 'ar', createdAt: now, updatedAt: now },
    ];
    for (const s of seedStudents) {
      const ref = await addDoc(collection(db, 'students'), s);
      students.push({ id: ref.id, ...s } as Student);
    }
    created.students = seedStudents.length;
  }

  // Pick up to 4 courses, up to 3 instructors, up to 6 students
  const usedCourses = courses.slice(0, Math.min(4, courses.length));
  const usedInstructors = instructors.slice(0, Math.min(3, instructors.length));
  const usedStudents = students.slice(0, Math.min(6, students.length));

  // Helper: get an instructor id for a course (round-robin)
  const getInstructor = (idx: number) => usedInstructors[idx % usedInstructors.length];

  // ── 3. LIVE SESSIONS ────────────────────────────────────────────────────

  const sessionDefs: Array<Omit<LiveSession, 'id'>> = [
    {
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Introduction to the Course',
      description: 'Welcome session covering the syllabus, expectations, and icebreaker activities.',
      scheduledStartTime: now - 7 * DAY,
      scheduledEndTime: now - 7 * DAY + 2 * HOUR,
      actualStartTime: now - 7 * DAY + 5 * 60000,
      actualEndTime: now - 7 * DAY + 2 * HOUR - 10 * 60000,
      status: 'ended',
      platform: 'jitsi',
      roomName: 'elite-intro-session',
      roomPassword: 'welcome2024',
      recordingEnabled: true,
      maxParticipants: 30,
      createdAt: now - 10 * DAY,
      updatedAt: now - 7 * DAY,
    },
    {
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Module 1: Core Fundamentals',
      description: 'Deep dive into the foundational concepts with hands-on exercises.',
      scheduledStartTime: now - 3 * DAY,
      scheduledEndTime: now - 3 * DAY + 2 * HOUR,
      actualStartTime: now - 3 * DAY,
      actualEndTime: now - 3 * DAY + 1.5 * HOUR,
      status: 'ended',
      platform: 'google_meet',
      roomName: 'elite-module1',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      recordingEnabled: true,
      maxParticipants: 30,
      createdAt: now - 5 * DAY,
      updatedAt: now - 3 * DAY,
    },
    {
      courseId: usedCourses[Math.min(1, usedCourses.length - 1)].id,
      instructorId: getInstructor(1).id,
      title: 'Live Workshop: Practical Application',
      description: 'Interactive workshop where students apply what they have learned in real scenarios.',
      scheduledStartTime: now - 30 * 60000, // started 30 min ago — currently live
      scheduledEndTime: now + 1.5 * HOUR,
      actualStartTime: now - 25 * 60000,
      status: 'live',
      platform: 'jitsi',
      roomName: 'elite-workshop-live',
      roomPassword: 'workshop123',
      recordingEnabled: true,
      maxParticipants: 25,
      createdAt: now - 2 * DAY,
      updatedAt: now,
    },
    {
      courseId: usedCourses[Math.min(1, usedCourses.length - 1)].id,
      instructorId: getInstructor(1).id,
      title: 'Q&A and Revision Session',
      description: 'Open Q&A for students to clarify doubts before the upcoming quiz.',
      scheduledStartTime: now + 2 * DAY,
      scheduledEndTime: now + 2 * DAY + 1.5 * HOUR,
      status: 'scheduled',
      platform: 'youtube_live',
      roomName: 'elite-qa-revision',
      meetingUrl: 'https://youtube.com/live/example123',
      recordingEnabled: false,
      maxParticipants: 50,
      createdAt: now - 1 * DAY,
      updatedAt: now - 1 * DAY,
    },
    {
      courseId: usedCourses[Math.min(2, usedCourses.length - 1)].id,
      instructorId: getInstructor(2).id,
      title: 'Guest Speaker: Industry Insights',
      description: 'A guest speaker from the industry shares practical experiences and career advice.',
      scheduledStartTime: now + 5 * DAY,
      scheduledEndTime: now + 5 * DAY + 2 * HOUR,
      status: 'scheduled',
      platform: 'external_link',
      roomName: 'elite-guest-speaker',
      meetingUrl: 'https://zoom.us/j/1234567890',
      recordingEnabled: true,
      maxParticipants: 40,
      createdAt: now - DAY,
      updatedAt: now - DAY,
    },
    {
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Cancelled: Holiday Make-up Session',
      description: 'This session was cancelled due to a public holiday.',
      scheduledStartTime: now - 1 * DAY,
      scheduledEndTime: now - 1 * DAY + 2 * HOUR,
      status: 'cancelled',
      platform: 'jitsi',
      roomName: 'elite-makeup-cancelled',
      recordingEnabled: false,
      createdAt: now - 4 * DAY,
      updatedAt: now - 2 * DAY,
    },
  ];

  const sessionIds: string[] = [];
  for (const s of sessionDefs) {
    const ref = await addDoc(collection(db, 'liveSessions'), s);
    sessionIds.push(ref.id);
    created.liveSessions++;
  }

  // ── 4. SESSION ATTENDANCE ───────────────────────────────────────────────
  // Add attendance for ended and live sessions (indices 0, 1, 2)
  const attendanceSessions = [
    { sessionIdx: 0, courseId: sessionDefs[0].courseId },
    { sessionIdx: 1, courseId: sessionDefs[1].courseId },
    { sessionIdx: 2, courseId: sessionDefs[2].courseId },
  ];

  for (const { sessionIdx, courseId } of attendanceSessions) {
    const sessionId = sessionIds[sessionIdx];
    const sessionDef = sessionDefs[sessionIdx];
    const attendeeCount = Math.min(usedStudents.length, sessionIdx === 2 ? 3 : 4);

    for (let i = 0; i < attendeeCount; i++) {
      const student = usedStudents[i];
      const joinTime = (sessionDef.actualStartTime || sessionDef.scheduledStartTime) + (i * 2 * 60000);
      const isLive = sessionDef.status === 'live';
      const leftTime = isLive ? null : joinTime + (60 + Math.floor(Math.random() * 50)) * 60000;
      const duration = isLive ? Math.floor((now - joinTime) / 60000) : leftTime ? Math.floor((leftTime - joinTime) / 60000) : 0;

      const att: Record<string, any> = {
        sessionId,
        userId: student.userId || student.id,
        studentId: student.id,
        courseId,
        joinedAt: joinTime,
        durationMinutes: duration,
        status: isLive && i < 2 ? 'joined' : 'left',
      };
      if (leftTime !== null) att.leftAt = leftTime;
      await addDoc(collection(db, 'sessionAttendance'), att);
      created.sessionAttendance++;
    }
  }

  // ── 5. RECORDINGS ──────────────────────────────────────────────────────

  const recordingDefs: Array<Omit<Recording, 'id'>> = [
    {
      sessionId: sessionIds[0],
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Introduction to the Course — Recording',
      description: 'Full recording of the introductory session including icebreaker activities.',
      storageType: 'youtube_unlisted',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      durationSeconds: 6840,
      processingStatus: 'ready',
      visibility: 'enrolled_only',
      viewCount: 18,
      order: 1,
      publishedAt: now - 6 * DAY,
      createdAt: now - 7 * DAY,
      updatedAt: now - 6 * DAY,
    },
    {
      sessionId: sessionIds[1],
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Module 1: Core Fundamentals — Recording',
      description: 'Recording of the hands-on fundamentals session.',
      storageType: 'youtube_unlisted',
      url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      thumbnailUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
      durationSeconds: 5400,
      processingStatus: 'ready',
      visibility: 'enrolled_only',
      viewCount: 12,
      order: 2,
      publishedAt: now - 2 * DAY,
      createdAt: now - 3 * DAY,
      updatedAt: now - 2 * DAY,
    },
    {
      courseId: usedCourses[Math.min(1, usedCourses.length - 1)].id,
      instructorId: getInstructor(1).id,
      title: 'Getting Started Tutorial',
      description: 'A supplemental tutorial video covering initial setup and configuration.',
      storageType: 'external_url',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg',
      durationSeconds: 3600,
      processingStatus: 'ready',
      visibility: 'public',
      viewCount: 45,
      order: 1,
      publishedAt: now - 14 * DAY,
      createdAt: now - 15 * DAY,
      updatedAt: now - 14 * DAY,
    },
    {
      courseId: usedCourses[Math.min(1, usedCourses.length - 1)].id,
      instructorId: getInstructor(1).id,
      title: 'Advanced Techniques Deep Dive',
      description: 'In-depth walkthrough of advanced techniques with real-world examples.',
      storageType: 'youtube_unlisted',
      url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
      thumbnailUrl: 'https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg',
      durationSeconds: 7200,
      processingStatus: 'ready',
      visibility: 'enrolled_only',
      viewCount: 8,
      order: 2,
      publishedAt: now - 5 * DAY,
      createdAt: now - 6 * DAY,
      updatedAt: now - 5 * DAY,
    },
    {
      courseId: usedCourses[Math.min(2, usedCourses.length - 1)].id,
      instructorId: getInstructor(2).id,
      title: 'Project Walkthrough and Best Practices',
      description: 'Instructor walkthrough of a sample project demonstrating best practices.',
      storageType: 'firebase_storage',
      url: '',
      storagePath: 'recordings/sample-project-walkthrough.mp4',
      durationSeconds: 4500,
      fileSizeBytes: 256000000,
      mimeType: 'video/mp4',
      processingStatus: 'ready',
      visibility: 'enrolled_only',
      viewCount: 6,
      order: 1,
      publishedAt: now - 3 * DAY,
      createdAt: now - 4 * DAY,
      updatedAt: now - 3 * DAY,
    },
    {
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Supplementary Reading Material Overview',
      description: 'Quick overview of supplementary materials and how to use them.',
      storageType: 'external_url',
      url: 'https://www.youtube.com/watch?v=pTB0EiLXUC8',
      thumbnailUrl: 'https://img.youtube.com/vi/pTB0EiLXUC8/hqdefault.jpg',
      durationSeconds: 1800,
      processingStatus: 'ready',
      visibility: 'public',
      viewCount: 32,
      order: 3,
      publishedAt: now - 10 * DAY,
      createdAt: now - 11 * DAY,
      updatedAt: now - 10 * DAY,
    },
  ];

  const recordingIds: string[] = [];
  for (const r of recordingDefs) {
    const ref = await addDoc(collection(db, 'recordings'), r);
    recordingIds.push(ref.id);
    created.recordings++;
  }

  // ── 6. RECORDING PROGRESS ──────────────────────────────────────────────

  const progressPairs = [
    { studentIdx: 0, recordingIdx: 0, percent: 100 },
    { studentIdx: 0, recordingIdx: 1, percent: 65 },
    { studentIdx: 1, recordingIdx: 0, percent: 100 },
    { studentIdx: 1, recordingIdx: 2, percent: 40 },
    { studentIdx: 2, recordingIdx: 0, percent: 80 },
    { studentIdx: 2, recordingIdx: 3, percent: 20 },
  ];

  for (const { studentIdx, recordingIdx, percent } of progressPairs) {
    if (studentIdx >= usedStudents.length || recordingIdx >= recordingIds.length) continue;
    const student = usedStudents[studentIdx];
    const rec = recordingDefs[recordingIdx];
    const totalSec = rec.durationSeconds || 3600;
    const watchedSec = Math.floor(totalSec * percent / 100);

    const rpId = `${student.userId || student.id}_${recordingIds[recordingIdx]}`;
    const rp: Omit<RecordingProgress, 'id'> = {
      recordingId: recordingIds[recordingIdx],
      userId: student.userId || student.id,
      courseId: rec.courseId,
      watchedSeconds: watchedSec,
      totalSeconds: totalSec,
      percentWatched: percent,
      completed: percent >= 95,
      lastWatchedAt: now - Math.floor(Math.random() * 3) * DAY,
      updatedAt: now,
    };
    await setDoc(doc(db, 'recordingProgress', rpId), rp);
    created.recordingProgress++;
  }

  // ── 7. QUIZZES ─────────────────────────────────────────────────────────

  interface QuizDef {
    quiz: Omit<Quiz, 'id'>;
    questions: Array<Omit<QuizQuestion, 'id'>>;
  }

  const quizDefs: QuizDef[] = [
    {
      quiz: {
        courseId: usedCourses[0].id,
        instructorId: getInstructor(0).id,
        title: 'Module 1 Assessment',
        description: 'Test your understanding of the core fundamentals covered in Module 1.',
        instructions: 'Answer all questions. You have 30 minutes to complete this quiz.',
        timeLimitMinutes: 30,
        dueDate: now + 7 * DAY,
        publishedAt: now - 2 * DAY,
        status: 'published',
        passingScore: 60,
        maxAttempts: 3,
        shuffleQuestions: true,
        shuffleOptions: true,
        showResultsToStudent: true,
        totalMarks: 20,
        questionCount: 5,
        createdAt: now - 3 * DAY,
        updatedAt: now - 2 * DAY,
      },
      questions: [
        {
          questionText: 'What is the primary purpose of this course module?',
          questionType: 'mcq',
          options: [
            { id: 'a1', text: 'To introduce advanced algorithms', isCorrect: false },
            { id: 'a2', text: 'To build a strong foundation in core concepts', isCorrect: true },
            { id: 'a3', text: 'To prepare for certification exams', isCorrect: false },
            { id: 'a4', text: 'To review previous coursework', isCorrect: false },
          ],
          marks: 4,
          order: 1,
          explanation: 'Module 1 focuses on establishing a strong foundation in the core concepts.',
        },
        {
          questionText: 'True or False: Practice exercises are optional in this course.',
          questionType: 'true_false',
          options: [
            { id: 'b1', text: 'True', isCorrect: false },
            { id: 'b2', text: 'False', isCorrect: true },
          ],
          marks: 4,
          order: 2,
          explanation: 'Practice exercises are a mandatory part of the learning process.',
        },
        {
          questionText: 'Which of the following best describes the learning methodology used?',
          questionType: 'mcq',
          options: [
            { id: 'c1', text: 'Lecture-only approach', isCorrect: false },
            { id: 'c2', text: 'Project-based learning with mentorship', isCorrect: true },
            { id: 'c3', text: 'Self-paced reading only', isCorrect: false },
            { id: 'c4', text: 'Exam-focused drilling', isCorrect: false },
          ],
          marks: 4,
          order: 3,
          explanation: 'The course uses project-based learning with instructor mentorship.',
        },
        {
          questionText: 'Explain in one sentence why consistent practice is important.',
          questionType: 'short_answer',
          options: [],
          correctAnswer: 'Consistent practice reinforces learning and builds muscle memory for applying concepts.',
          marks: 4,
          order: 4,
          explanation: 'Regular practice helps solidify understanding and improve retention.',
        },
        {
          questionText: 'True or False: Students can access recordings of live sessions.',
          questionType: 'true_false',
          options: [
            { id: 'e1', text: 'True', isCorrect: true },
            { id: 'e2', text: 'False', isCorrect: false },
          ],
          marks: 4,
          order: 5,
          explanation: 'Live sessions are recorded and made available to enrolled students.',
        },
      ],
    },
    {
      quiz: {
        courseId: usedCourses[Math.min(1, usedCourses.length - 1)].id,
        instructorId: getInstructor(1).id,
        title: 'Midterm Knowledge Check',
        description: 'A comprehensive midterm quiz covering all topics discussed so far.',
        instructions: 'This is a timed quiz. You have 45 minutes. No external resources allowed.',
        timeLimitMinutes: 45,
        dueDate: now + 14 * DAY,
        publishedAt: now - 1 * DAY,
        status: 'published',
        passingScore: 70,
        maxAttempts: 2,
        shuffleQuestions: false,
        shuffleOptions: true,
        showResultsToStudent: true,
        totalMarks: 15,
        questionCount: 4,
        createdAt: now - 5 * DAY,
        updatedAt: now - 1 * DAY,
      },
      questions: [
        {
          questionText: 'Which technique is most effective for organizing large projects?',
          questionType: 'mcq',
          options: [
            { id: 'f1', text: 'Writing everything in a single file', isCorrect: false },
            { id: 'f2', text: 'Modular architecture with clear separation of concerns', isCorrect: true },
            { id: 'f3', text: 'Avoiding documentation', isCorrect: false },
          ],
          marks: 4,
          order: 1,
          explanation: 'Modular architecture allows for better maintainability and scalability.',
        },
        {
          questionText: 'True or False: Testing should only happen after the project is complete.',
          questionType: 'true_false',
          options: [
            { id: 'g1', text: 'True', isCorrect: false },
            { id: 'g2', text: 'False', isCorrect: true },
          ],
          marks: 3,
          order: 2,
          explanation: 'Testing should be done continuously throughout the development process.',
        },
        {
          questionText: 'What are the key benefits of code reviews?',
          questionType: 'short_answer',
          options: [],
          correctAnswer: 'Code reviews improve quality, catch bugs early, and facilitate knowledge sharing.',
          marks: 4,
          order: 3,
          explanation: 'Code reviews are essential for maintaining quality and team collaboration.',
        },
        {
          questionText: 'Which approach to problem-solving is taught in this course?',
          questionType: 'mcq',
          options: [
            { id: 'h1', text: 'Trial and error only', isCorrect: false },
            { id: 'h2', text: 'Systematic decomposition and analysis', isCorrect: true },
            { id: 'h3', text: 'Copying solutions from the internet', isCorrect: false },
            { id: 'h4', text: 'Memorizing answers', isCorrect: false },
          ],
          marks: 4,
          order: 4,
          explanation: 'The course teaches systematic problem decomposition and analytical thinking.',
        },
      ],
    },
    {
      quiz: {
        courseId: usedCourses[Math.min(2, usedCourses.length - 1)].id,
        instructorId: getInstructor(2).id,
        title: 'Final Exam Prep Quiz (Draft)',
        description: 'Draft quiz for final exam preparation — not yet published.',
        status: 'draft',
        passingScore: 75,
        maxAttempts: 1,
        shuffleQuestions: true,
        shuffleOptions: true,
        showResultsToStudent: false,
        totalMarks: 12,
        questionCount: 3,
        createdAt: now - 1 * DAY,
        updatedAt: now - 1 * DAY,
      },
      questions: [
        {
          questionText: 'What is the most important factor when choosing a technology stack?',
          questionType: 'mcq',
          options: [
            { id: 'i1', text: 'Popularity on social media', isCorrect: false },
            { id: 'i2', text: 'Project requirements and team expertise', isCorrect: true },
            { id: 'i3', text: 'The newest technology available', isCorrect: false },
          ],
          marks: 4,
          order: 1,
          explanation: 'Technology choices should be driven by project needs and team capability.',
        },
        {
          questionText: 'True or False: Performance optimization should be done from the start.',
          questionType: 'true_false',
          options: [
            { id: 'j1', text: 'True', isCorrect: false },
            { id: 'j2', text: 'False', isCorrect: true },
          ],
          marks: 4,
          order: 2,
          explanation: 'Premature optimization is often counterproductive. Optimize based on measurements.',
        },
        {
          questionText: 'Describe the concept of separation of concerns in your own words.',
          questionType: 'short_answer',
          options: [],
          correctAnswer: 'Separation of concerns means organizing code so each module handles a distinct responsibility.',
          marks: 4,
          order: 3,
          explanation: 'Each part of a system should address a separate concern for clarity and maintainability.',
        },
      ],
    },
  ];

  const quizIds: string[] = [];
  const quizQuestionIds: string[][] = []; // quizQuestionIds[quizIdx][questionIdx]

  for (const qd of quizDefs) {
    const quizRef = await addDoc(collection(db, 'quizzes'), qd.quiz);
    quizIds.push(quizRef.id);
    created.quizzes++;

    const qIds: string[] = [];
    for (const question of qd.questions) {
      const qRef = await addDoc(collection(db, 'quizzes', quizRef.id, 'questions'), question);
      qIds.push(qRef.id);
      created.quizQuestions++;
    }
    quizQuestionIds.push(qIds);
  }

  // ── 8. QUIZ SUBMISSIONS ────────────────────────────────────────────────

  // Submissions for quiz 0 (Module 1 Assessment)
  if (usedStudents.length >= 2 && quizQuestionIds[0]?.length >= 5) {
    const q0qIds = quizQuestionIds[0];
    const q0Def = quizDefs[0];

    // Student 0: passed with 16/20
    const s0Answers = [
      { questionId: q0qIds[0], selectedOptionId: 'a2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[1], selectedOptionId: 'b2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[2], selectedOptionId: 'c2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[3], textAnswer: 'Practice helps build understanding.', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[4], selectedOptionId: 'e2', isCorrect: false, marksAwarded: 0 },
    ];
    const sub0: Omit<QuizSubmission, 'id'> = {
      quizId: quizIds[0],
      courseId: q0Def.quiz.courseId,
      userId: usedStudents[0].userId || usedStudents[0].id,
      studentId: usedStudents[0].id,
      answers: s0Answers,
      startedAt: now - 2 * DAY,
      submittedAt: now - 2 * DAY + 25 * 60000,
      totalMarks: 20,
      scoredMarks: 16,
      percentage: 80,
      passed: true,
      attemptNumber: 1,
      status: 'graded',
      gradedBy: getInstructor(0).id,
      gradedAt: now - 2 * DAY + 3 * HOUR,
    };
    await addDoc(collection(db, 'quizSubmissions'), sub0);
    created.quizSubmissions++;

    // Student 1: failed with 8/20, attempt 1
    const s1Answers = [
      { questionId: q0qIds[0], selectedOptionId: 'a1', isCorrect: false, marksAwarded: 0 },
      { questionId: q0qIds[1], selectedOptionId: 'b2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[2], selectedOptionId: 'c1', isCorrect: false, marksAwarded: 0 },
      { questionId: q0qIds[3], textAnswer: 'Not sure.', isCorrect: false, marksAwarded: 0 },
      { questionId: q0qIds[4], selectedOptionId: 'e1', isCorrect: true, marksAwarded: 4 },
    ];
    const sub1: Omit<QuizSubmission, 'id'> = {
      quizId: quizIds[0],
      courseId: q0Def.quiz.courseId,
      userId: usedStudents[1].userId || usedStudents[1].id,
      studentId: usedStudents[1].id,
      answers: s1Answers,
      startedAt: now - 1.5 * DAY,
      submittedAt: now - 1.5 * DAY + 18 * 60000,
      totalMarks: 20,
      scoredMarks: 8,
      percentage: 40,
      passed: false,
      attemptNumber: 1,
      status: 'graded',
      gradedBy: getInstructor(0).id,
      gradedAt: now - 1 * DAY,
    };
    await addDoc(collection(db, 'quizSubmissions'), sub1);
    created.quizSubmissions++;

    // Student 1: retry, attempt 2, passed with 14/20
    const s1RetryAnswers = [
      { questionId: q0qIds[0], selectedOptionId: 'a2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[1], selectedOptionId: 'b2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[2], selectedOptionId: 'c2', isCorrect: true, marksAwarded: 4 },
      { questionId: q0qIds[3], textAnswer: 'It helps reinforce concepts.', isCorrect: false, marksAwarded: 2 },
      { questionId: q0qIds[4], selectedOptionId: 'e2', isCorrect: false, marksAwarded: 0 },
    ];
    const sub1r: Omit<QuizSubmission, 'id'> = {
      quizId: quizIds[0],
      courseId: q0Def.quiz.courseId,
      userId: usedStudents[1].userId || usedStudents[1].id,
      studentId: usedStudents[1].id,
      answers: s1RetryAnswers,
      startedAt: now - 0.5 * DAY,
      submittedAt: now - 0.5 * DAY + 22 * 60000,
      totalMarks: 20,
      scoredMarks: 14,
      percentage: 70,
      passed: true,
      attemptNumber: 2,
      status: 'graded',
      gradedBy: getInstructor(0).id,
      gradedAt: now - 0.3 * DAY,
    };
    await addDoc(collection(db, 'quizSubmissions'), sub1r);
    created.quizSubmissions++;
  }

  // Submission for quiz 1 (Midterm) — student 0
  if (usedStudents.length >= 1 && quizQuestionIds[1]?.length >= 4) {
    const q1qIds = quizQuestionIds[1];
    const q1Def = quizDefs[1];
    const s0MidtermAnswers = [
      { questionId: q1qIds[0], selectedOptionId: 'f2', isCorrect: true, marksAwarded: 4 },
      { questionId: q1qIds[1], selectedOptionId: 'g2', isCorrect: true, marksAwarded: 3 },
      { questionId: q1qIds[2], textAnswer: 'They help catch bugs and share knowledge.', isCorrect: true, marksAwarded: 4 },
      { questionId: q1qIds[3], selectedOptionId: 'h2', isCorrect: true, marksAwarded: 4 },
    ];
    const subMid: Omit<QuizSubmission, 'id'> = {
      quizId: quizIds[1],
      courseId: q1Def.quiz.courseId,
      userId: usedStudents[0].userId || usedStudents[0].id,
      studentId: usedStudents[0].id,
      answers: s0MidtermAnswers,
      startedAt: now - 1 * DAY,
      submittedAt: now - 1 * DAY + 35 * 60000,
      totalMarks: 15,
      scoredMarks: 15,
      percentage: 100,
      passed: true,
      attemptNumber: 1,
      status: 'graded',
      gradedBy: getInstructor(1).id,
      gradedAt: now - 0.5 * DAY,
    };
    await addDoc(collection(db, 'quizSubmissions'), subMid);
    created.quizSubmissions++;
  }

  // ── 9. CAPSTONES ───────────────────────────────────────────────────────

  const capstoneDefs: Array<Omit<Capstone, 'id'>> = [
    {
      courseId: usedCourses[0].id,
      instructorId: getInstructor(0).id,
      title: 'Final Capstone Project: Real-World Application',
      instructions: 'Build a complete application that demonstrates your understanding of the course material. Your project should include:\n\n1. A clear problem statement\n2. A well-structured solution architecture\n3. Implementation with proper documentation\n4. A presentation summarizing your approach and findings\n\nSubmit your code repository link and a written summary.',
      dueDate: now + 21 * DAY,
      maxScore: 100,
      rubric: 'Problem Definition (20 points)\nSolution Design (25 points)\nImplementation Quality (30 points)\nDocumentation (15 points)\nPresentation (10 points)',
      status: 'published',
      allowLateSubmission: true,
      latePenaltyPercent: 10,
      allowedFileTypes: ['pdf', 'zip', 'docx'],
      maxFileSizeMB: 50,
      resources: [
        { type: 'link', name: 'Project Guidelines', url: 'https://docs.google.com/document/d/example1' },
        { type: 'link', name: 'Rubric Details', url: 'https://docs.google.com/document/d/example2' },
      ],
      publishedAt: now - 3 * DAY,
      createdAt: now - 5 * DAY,
      updatedAt: now - 3 * DAY,
    },
    {
      courseId: usedCourses[Math.min(1, usedCourses.length - 1)].id,
      instructorId: getInstructor(1).id,
      title: 'Mini Capstone: Case Study Analysis',
      instructions: 'Analyze the provided case study and write a comprehensive report. Your report should address:\n\n1. Summary of the case\n2. Identification of key challenges\n3. Proposed solutions with justification\n4. Reflection on lessons learned\n\nMinimum 1500 words.',
      dueDate: now + 10 * DAY,
      maxScore: 50,
      rubric: 'Summary (10 points)\nAnalysis (15 points)\nSolutions (15 points)\nReflection (10 points)',
      status: 'published',
      allowLateSubmission: false,
      resources: [
        { type: 'link', name: 'Case Study Document', url: 'https://docs.google.com/document/d/example3' },
      ],
      publishedAt: now - 7 * DAY,
      createdAt: now - 10 * DAY,
      updatedAt: now - 7 * DAY,
    },
    {
      courseId: usedCourses[Math.min(2, usedCourses.length - 1)].id,
      instructorId: getInstructor(2).id,
      title: 'Research Capstone (Draft)',
      instructions: 'This capstone will require students to conduct independent research on a topic of their choice within the course domain. Details to be finalized.',
      maxScore: 80,
      status: 'draft',
      allowLateSubmission: true,
      latePenaltyPercent: 15,
      resources: [],
      createdAt: now - 2 * DAY,
      updatedAt: now - 2 * DAY,
    },
  ];

  const capstoneIds: string[] = [];
  for (const c of capstoneDefs) {
    const ref = await addDoc(collection(db, 'capstones'), c);
    capstoneIds.push(ref.id);
    created.capstones++;
  }

  // ── 10. CAPSTONE SUBMISSIONS ───────────────────────────────────────────

  const capSubDefs: Array<Omit<CapstoneSubmission, 'id'>> = [];

  // Student 0: submitted and graded for capstone 0
  if (usedStudents.length >= 1) {
    capSubDefs.push({
      capstoneId: capstoneIds[0],
      courseId: capstoneDefs[0].courseId,
      userId: usedStudents[0].userId || usedStudents[0].id,
      studentId: usedStudents[0].id,
      textResponse: 'I built an e-commerce dashboard application that demonstrates full-stack development principles. The project uses React for the frontend and Firebase for the backend. I focused on clean architecture, reusable components, and responsive design. The application includes user authentication, product management, and analytics features.',
      links: ['https://github.com/example/capstone-project', 'https://capstone-demo.vercel.app'],
      files: [],
      status: 'graded',
      submittedAt: now - 2 * DAY,
      score: 88,
      maxScore: 100,
      feedback: 'Excellent work! Your application demonstrates a strong understanding of the course material. The architecture is well-thought-out and the documentation is thorough. Minor improvements could be made in the presentation section. Overall, a high-quality submission.',
      gradedBy: getInstructor(0).id,
      gradedAt: now - 1 * DAY,
      isLate: false,
      resubmissionCount: 0,
      createdAt: now - 2 * DAY,
      updatedAt: now - 1 * DAY,
    });
  }

  // Student 1: submitted, under review for capstone 0
  if (usedStudents.length >= 2) {
    capSubDefs.push({
      capstoneId: capstoneIds[0],
      courseId: capstoneDefs[0].courseId,
      userId: usedStudents[1].userId || usedStudents[1].id,
      studentId: usedStudents[1].id,
      textResponse: 'My capstone project is a task management application with real-time collaboration features. I used the MERN stack and implemented WebSocket connections for live updates.',
      links: ['https://github.com/example/task-manager-capstone'],
      files: [],
      status: 'under_review',
      submittedAt: now - 1 * DAY,
      maxScore: 100,
      isLate: false,
      resubmissionCount: 0,
      createdAt: now - 1 * DAY,
      updatedAt: now - 1 * DAY,
    });
  }

  // Student 2: resubmit requested for capstone 1
  if (usedStudents.length >= 3) {
    capSubDefs.push({
      capstoneId: capstoneIds[1],
      courseId: capstoneDefs[1].courseId,
      userId: usedStudents[2].userId || usedStudents[2].id,
      studentId: usedStudents[2].id,
      textResponse: 'The case study presents challenges in scaling operations. My initial analysis focused on the technical aspects but needs to be expanded to cover business strategy.',
      links: [],
      files: [],
      status: 'resubmit_requested',
      submittedAt: now - 4 * DAY,
      score: 22,
      maxScore: 50,
      feedback: 'Your analysis has a good start but lacks depth in the solutions section. Please expand your proposed solutions and add more evidence-based reasoning. Also include a proper reflection section.',
      gradedBy: getInstructor(1).id,
      gradedAt: now - 3 * DAY,
      isLate: false,
      resubmissionCount: 1,
      createdAt: now - 4 * DAY,
      updatedAt: now - 3 * DAY,
    });
  }

  // Student 3: submitted for capstone 1
  if (usedStudents.length >= 4) {
    capSubDefs.push({
      capstoneId: capstoneIds[1],
      courseId: capstoneDefs[1].courseId,
      userId: usedStudents[3].userId || usedStudents[3].id,
      studentId: usedStudents[3].id,
      textResponse: 'A thorough case study analysis with detailed examination of challenges and innovative solutions.',
      links: ['https://docs.google.com/document/d/example-student4'],
      files: [],
      status: 'submitted',
      submittedAt: now - 0.5 * DAY,
      maxScore: 50,
      isLate: false,
      resubmissionCount: 0,
      createdAt: now - 0.5 * DAY,
      updatedAt: now - 0.5 * DAY,
    });
  }

  for (const cs of capSubDefs) {
    await addDoc(collection(db, 'capstoneSubmissions'), cs);
    created.capstoneSubmissions++;
  }

  // ── 11. COURSE PROGRESS ────────────────────────────────────────────────

  // Generate progress for each student x each course they might be enrolled in
  const studentCourseProgress = [
    { studentIdx: 0, courseIdx: 0, data: { sessionsAttended: 2, totalSessions: 6, recordingsWatched: 2, totalRecordings: 3, recordingWatchPercent: 67, quizzesCompleted: 1, totalQuizzes: 2, quizAvgScore: 80, capstonesCompleted: 1, totalCapstones: 1, capstoneAvgScore: 88, overallCompletionPercent: 72 } },
    { studentIdx: 0, courseIdx: 1, data: { sessionsAttended: 1, totalSessions: 4, recordingsWatched: 1, totalRecordings: 2, recordingWatchPercent: 50, quizzesCompleted: 1, totalQuizzes: 1, quizAvgScore: 100, capstonesCompleted: 0, totalCapstones: 1, capstoneAvgScore: 0, overallCompletionPercent: 45 } },
    { studentIdx: 1, courseIdx: 0, data: { sessionsAttended: 2, totalSessions: 6, recordingsWatched: 1, totalRecordings: 3, recordingWatchPercent: 33, quizzesCompleted: 1, totalQuizzes: 2, quizAvgScore: 70, capstonesCompleted: 0, totalCapstones: 1, capstoneAvgScore: 0, overallCompletionPercent: 38 } },
    { studentIdx: 2, courseIdx: 0, data: { sessionsAttended: 1, totalSessions: 6, recordingsWatched: 1, totalRecordings: 3, recordingWatchPercent: 27, quizzesCompleted: 0, totalQuizzes: 2, quizAvgScore: 0, capstonesCompleted: 0, totalCapstones: 1, capstoneAvgScore: 0, overallCompletionPercent: 15 } },
    { studentIdx: 2, courseIdx: 1, data: { sessionsAttended: 0, totalSessions: 4, recordingsWatched: 0, totalRecordings: 2, recordingWatchPercent: 0, quizzesCompleted: 0, totalQuizzes: 1, quizAvgScore: 0, capstonesCompleted: 0, totalCapstones: 1, capstoneAvgScore: 0, overallCompletionPercent: 5 } },
    { studentIdx: 3, courseIdx: 1, data: { sessionsAttended: 1, totalSessions: 4, recordingsWatched: 2, totalRecordings: 2, recordingWatchPercent: 100, quizzesCompleted: 0, totalQuizzes: 1, quizAvgScore: 0, capstonesCompleted: 0, totalCapstones: 1, capstoneAvgScore: 0, overallCompletionPercent: 35 } },
  ];

  for (const sp of studentCourseProgress) {
    if (sp.studentIdx >= usedStudents.length || sp.courseIdx >= usedCourses.length) continue;
    const student = usedStudents[sp.studentIdx];
    const course = usedCourses[sp.courseIdx];
    const userId = student.userId || student.id;
    const compositeId = `${userId}_${course.id}`;

    const cp: Omit<CourseProgress, 'id'> = {
      userId,
      studentId: student.id,
      courseId: course.id,
      ...sp.data,
      lastActivityAt: now - Math.floor(Math.random() * 3) * DAY,
      updatedAt: now,
    };
    await setDoc(doc(db, 'courseProgress', compositeId), cp);
    created.courseProgress++;
  }

  return { created };
}

// ── Cleanup function (optional, for admin use) ───────────────────────────

export async function clearLearningData(): Promise<void> {
  const collections = [
    'liveSessions',
    'sessionAttendance',
    'recordings',
    'recordingProgress',
    'quizzes',
    'quizSubmissions',
    'capstones',
    'capstoneSubmissions',
    'courseProgress',
    'courses',
    'instructors',
    'students',
  ];

  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    const deletePromises: Promise<void>[] = [];
    for (const docSnap of snap.docs) {
      // For quizzes, also delete subcollection questions
      if (colName === 'quizzes') {
        const questionsSnap = await getDocs(collection(db, 'quizzes', docSnap.id, 'questions'));
        for (const qDoc of questionsSnap.docs) {
          deletePromises.push(deleteDoc(qDoc.ref));
        }
      }
      deletePromises.push(deleteDoc(docSnap.ref));
    }
    await Promise.all(deletePromises);
  }
}

// ── Seed a test student with full learning data ───────────────────────────

const TEST_STUDENT_EMAIL = 'student@elitelearning.com';
const TEST_STUDENT_PASSWORD = 'Student@2026';
const TEST_STUDENT_NAME = 'Ali Hassan';

export interface SeedTestStudentResult {
  email: string;
  password: string;
  created: Record<string, number>;
}

export async function seedTestStudent(): Promise<SeedTestStudentResult> {
  const created: Record<string, number> = {
    user: 0,
    student: 0,
    enrollments: 0,
    sessionAttendance: 0,
    recordingProgress: 0,
    quizSubmissions: 0,
    capstoneSubmissions: 0,
    courseProgress: 0,
  };

  // 1. Create Firebase Auth account + user profile
  let userId: string;
  try {
    const fbUser = await signUp(TEST_STUDENT_EMAIL, TEST_STUDENT_PASSWORD, TEST_STUDENT_NAME, 'student', {
      phone: '+201234567890',
      country: 'EG',
    });
    userId = fbUser.uid;
    created.user = 1;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      // Account exists — try to find the user doc
      const usersSnap = await getDocs(collection(db, 'users'));
      const existing = usersSnap.docs.find(d => d.data().email === TEST_STUDENT_EMAIL);
      if (!existing) {
        throw new Error(`Auth account exists for ${TEST_STUDENT_EMAIL} but no user profile found. Please delete the account from Firebase Console and try again.`);
      }
      userId = existing.id;
    } else {
      throw err;
    }
  }

  // 2. Create student record
  const existingStudentsSnap = await getDocs(collection(db, 'students'));
  let studentDocId: string;
  const existingStudent = existingStudentsSnap.docs.find(d => d.data().email === TEST_STUDENT_EMAIL);

  if (existingStudent) {
    studentDocId = existingStudent.id;
  } else {
    // Get courses to link enrollments
    const coursesSnap = await getDocs(collection(db, 'courses'));
    const courseIds = coursesSnap.docs.map(d => d.id);

    const studentData = {
      name: TEST_STUDENT_NAME,
      email: TEST_STUDENT_EMAIL,
      phone: '+201234567890',
      country: 'Egypt',
      groupIds: [],
      enrolledCourseIds: courseIds.slice(0, 3),
      level: 'intermediate' as const,
      lifecycleStage: 'active' as const,
      isActive: true,
      source: 'website' as const,
      preferredLanguage: 'en' as const,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    const studentRef = await addDoc(collection(db, 'students'), studentData);
    studentDocId = studentRef.id;
    created.student = 1;
  }

  // 3. Fetch courses, sessions, recordings, quizzes, capstones from Firestore
  const [coursesSnap, sessionsSnap, recordingsSnap, quizzesSnap, capstonesSnap] = await Promise.all([
    getDocs(collection(db, 'courses')),
    getDocs(collection(db, 'liveSessions')),
    getDocs(collection(db, 'recordings')),
    getDocs(collection(db, 'quizzes')),
    getDocs(collection(db, 'capstones')),
  ]);

  const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const sessions = sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; courseId: string; scheduledStartTime: number; instructorId: string; status: string; [k: string]: any }>;
  const recordings = recordingsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; courseId: string; durationSeconds: number; [k: string]: any }>;
  const quizzesList = quizzesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; courseId: string; instructorId: string; totalMarks: number; passingScore: number; status: string; [k: string]: any }>;
  const capstonesList = capstonesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; courseId: string; instructorId: string; maxScore: number; status: string; dueDate?: number; [k: string]: any }>;

  if (courses.length === 0) {
    throw new Error('No courses found. Please seed the main learning data first (click "Seed Learning Data").');
  }

  const enrolledCourseIds = courses.slice(0, 3).map(c => c.id);

  // 4. Create enrollments
  const existingEnrollmentsSnap = await getDocs(collection(db, 'enrollments'));
  const existingEnrollments = existingEnrollmentsSnap.docs.map(d => d.data());
  const alreadyEnrolled = new Set(
    existingEnrollments
      .filter(e => e.studentEmail === TEST_STUDENT_EMAIL || e.studentId === userId)
      .map(e => e.courseId)
  );

  for (const courseId of enrolledCourseIds) {
    if (alreadyEnrolled.has(courseId)) continue;
    const course = courses.find(c => c.id === courseId);
    await addDoc(collection(db, 'enrollments'), {
      studentId: userId,
      studentName: TEST_STUDENT_NAME,
      studentEmail: TEST_STUDENT_EMAIL,
      studentPhone: '+201234567890',
      courseId,
      courseTitle: (course as any)?.title || 'Course',
      status: 'active',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      paymentAmount: (course as any)?.price || 2000,
      paymentCurrency: 'EGP',
      enrolledAt: now - 14 * DAY,
      createdAt: now - 14 * DAY,
    });
    created.enrollments++;
  }

  // 5. Session attendance — attend past sessions for enrolled courses
  const enrolledSessions = sessions.filter(s => enrolledCourseIds.includes(s.courseId));
  const pastSessions = enrolledSessions.filter(s => s.status === 'ended');
  const liveSessions = enrolledSessions.filter(s => s.status === 'live');

  for (const session of pastSessions) {
    const joinTime = session.scheduledStartTime + 2 * 60000;
    const leftTime = joinTime + (60 + Math.floor(Math.random() * 40)) * 60000;
    const duration = Math.round((leftTime - joinTime) / 60000);
    const att: Record<string, any> = {
      sessionId: session.id,
      userId,
      studentId: studentDocId,
      courseId: session.courseId,
      joinedAt: joinTime,
      leftAt: leftTime,
      durationMinutes: duration,
      status: 'left',
    };
    await addDoc(collection(db, 'sessionAttendance'), att);
    created.sessionAttendance++;
  }

  // Join the live session too
  for (const session of liveSessions) {
    const att: Record<string, any> = {
      sessionId: session.id,
      userId,
      studentId: studentDocId,
      courseId: session.courseId,
      joinedAt: now - 20 * 60000,
      durationMinutes: 20,
      status: 'joined',
    };
    await addDoc(collection(db, 'sessionAttendance'), att);
    created.sessionAttendance++;
  }

  // 6. Recording progress — watch some recordings
  const enrolledRecordings = recordings.filter(r => enrolledCourseIds.includes(r.courseId));
  const progressPercents = [100, 75, 45, 20];

  for (let i = 0; i < Math.min(enrolledRecordings.length, progressPercents.length); i++) {
    const rec = enrolledRecordings[i];
    const percent = progressPercents[i];
    const totalSec = rec.durationSeconds || 3600;
    const watchedSec = Math.floor(totalSec * percent / 100);
    const rpId = `${userId}_${rec.id}`;

    await setDoc(doc(db, 'recordingProgress', rpId), {
      recordingId: rec.id,
      userId,
      courseId: rec.courseId,
      watchedSeconds: watchedSec,
      totalSeconds: totalSec,
      percentWatched: percent,
      completed: percent >= 95,
      lastWatchedAt: now - Math.floor(Math.random() * 3) * DAY,
      updatedAt: now,
    });
    created.recordingProgress++;
  }

  // 7. Quiz submissions — take published quizzes
  const publishedQuizzes = quizzesList.filter(q => enrolledCourseIds.includes(q.courseId) && q.status === 'published');

  for (const quiz of publishedQuizzes) {
    // Fetch questions for this quiz
    const questionsSnap = await getDocs(collection(db, 'quizzes', quiz.id, 'questions'));
    const questions = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Array<{ id: string; questionType: string; options?: Array<{ id: string; isCorrect: boolean }>; marks: number; [k: string]: any }>;

    if (questions.length === 0) continue;

    // Generate answers — get ~75% correct
    const answers = questions.map((q, idx) => {
      const isCorrect = idx % 4 !== 3; // 3 out of 4 correct
      if (q.questionType === 'short_answer') {
        return {
          questionId: q.id,
          textAnswer: isCorrect ? 'A well-reasoned answer demonstrating understanding.' : 'I am not sure about this one.',
          isCorrect,
          marksAwarded: isCorrect ? q.marks : Math.floor(q.marks * 0.3),
        };
      }
      const correctOpt = q.options?.find(o => o.isCorrect);
      const wrongOpt = q.options?.find(o => !o.isCorrect);
      return {
        questionId: q.id,
        selectedOptionId: isCorrect ? correctOpt?.id : wrongOpt?.id,
        isCorrect,
        marksAwarded: isCorrect ? q.marks : 0,
      };
    });

    const scoredMarks = answers.reduce((sum, a) => sum + a.marksAwarded, 0);
    const totalMarks = quiz.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = Math.round((scoredMarks / totalMarks) * 100);

    await addDoc(collection(db, 'quizSubmissions'), {
      quizId: quiz.id,
      courseId: quiz.courseId,
      userId,
      studentId: studentDocId,
      answers,
      startedAt: now - 2 * DAY + Math.floor(Math.random() * DAY),
      submittedAt: now - 2 * DAY + Math.floor(Math.random() * DAY) + 20 * 60000,
      totalMarks,
      scoredMarks,
      percentage,
      passed: percentage >= (quiz.passingScore || 60),
      attemptNumber: 1,
      status: 'graded',
      gradedBy: quiz.instructorId,
      gradedAt: now - 1 * DAY,
    });
    created.quizSubmissions++;
  }

  // 8. Capstone submissions — submit to published capstones
  const publishedCapstones = capstonesList.filter(c => enrolledCourseIds.includes(c.courseId) && c.status === 'published');

  for (let i = 0; i < publishedCapstones.length; i++) {
    const cap = publishedCapstones[i];
    // First capstone: graded; second: submitted (under_review)
    const isGraded = i === 0;

    const subData: Record<string, any> = {
      capstoneId: cap.id,
      courseId: cap.courseId,
      userId,
      studentId: studentDocId,
      textResponse: isGraded
        ? 'I developed a comprehensive project that addresses all the requirements outlined in the instructions. My approach focused on practical application of the concepts learned throughout the course. The project includes detailed documentation, well-structured code, and a thorough analysis of the problem domain.'
        : 'My project submission for this capstone covers the key concepts and applies them to a real-world scenario. I have included my code repository and a summary document.',
      links: isGraded
        ? ['https://github.com/alihassan/capstone-project', 'https://my-capstone-demo.vercel.app']
        : ['https://github.com/alihassan/capstone-v2'],
      files: [],
      status: isGraded ? 'graded' : 'under_review',
      submittedAt: isGraded ? now - 3 * DAY : now - 1 * DAY,
      maxScore: cap.maxScore,
      isLate: false,
      resubmissionCount: 0,
      createdAt: isGraded ? now - 3 * DAY : now - 1 * DAY,
      updatedAt: isGraded ? now - 1 * DAY : now - 1 * DAY,
    };

    if (isGraded) {
      subData.score = Math.round(cap.maxScore * 0.85);
      subData.feedback = 'Great work! Your project demonstrates solid understanding of the material. The implementation is clean and well-documented. Consider exploring edge cases more thoroughly in future work.';
      subData.gradedBy = cap.instructorId;
      subData.gradedAt = now - 1 * DAY;
    }

    await addDoc(collection(db, 'capstoneSubmissions'), subData);
    created.capstoneSubmissions++;
  }

  // 9. Course progress — for each enrolled course
  for (let i = 0; i < enrolledCourseIds.length; i++) {
    const courseId = enrolledCourseIds[i];
    const courseSessions = sessions.filter(s => s.courseId === courseId);
    const courseRecordings = recordings.filter(r => r.courseId === courseId);
    const courseQuizzes = quizzesList.filter(q => q.courseId === courseId && q.status === 'published');
    const courseCapstones = capstonesList.filter(c => c.courseId === courseId && c.status === 'published');

    const sessionsAttended = courseSessions.filter(s => s.status === 'ended' || s.status === 'live').length;
    const recordingsWatched = Math.min(courseRecordings.length, Math.ceil(courseRecordings.length * 0.7));
    const quizzesCompleted = courseQuizzes.length;
    const capstonesCompleted = courseCapstones.length > 0 && i === 0 ? 1 : 0;

    const totalItems = (courseSessions.length || 1) + (courseRecordings.length || 1) + (courseQuizzes.length || 1) + (courseCapstones.length || 1);
    const completedItems = sessionsAttended + recordingsWatched + quizzesCompleted + capstonesCompleted;
    const overallPercent = Math.round((completedItems / totalItems) * 100);

    const compositeId = `${userId}_${courseId}`;
    await setDoc(doc(db, 'courseProgress', compositeId), {
      userId,
      studentId: studentDocId,
      courseId,
      sessionsAttended,
      totalSessions: courseSessions.length,
      recordingsWatched,
      totalRecordings: courseRecordings.length,
      recordingWatchPercent: courseRecordings.length > 0 ? Math.round((recordingsWatched / courseRecordings.length) * 100) : 0,
      quizzesCompleted,
      totalQuizzes: courseQuizzes.length,
      quizAvgScore: 75,
      capstonesCompleted,
      totalCapstones: courseCapstones.length,
      capstoneAvgScore: capstonesCompleted > 0 ? 85 : 0,
      overallCompletionPercent: overallPercent,
      lastActivityAt: now - Math.floor(Math.random() * 2) * DAY,
      updatedAt: now,
    });
    created.courseProgress++;
  }

  return {
    email: TEST_STUDENT_EMAIL,
    password: TEST_STUDENT_PASSWORD,
    created,
  };
}

// ── Seed a test instructor with linked data ───────────────────────────────

const TEST_INSTRUCTOR_EMAIL = 'instructor@elitelearning.com';
const TEST_INSTRUCTOR_PASSWORD = 'Instructor@2026';
const TEST_INSTRUCTOR_NAME = 'Dr. Ahmed Hassan'; // Must match seed instructor name

export interface SeedTestInstructorResult {
  email: string;
  password: string;
  created: Record<string, number>;
}

export async function seedTestInstructor(): Promise<SeedTestInstructorResult> {
  const created: Record<string, number> = {
    user: 0,
    instructorLinked: 0,
    sessionsUpdated: 0,
    quizzesUpdated: 0,
    capstonesUpdated: 0,
  };

  // 1. Create Firebase Auth account + user profile with role 'instructor'
  let userId: string;
  try {
    const fbUser = await signUp(TEST_INSTRUCTOR_EMAIL, TEST_INSTRUCTOR_PASSWORD, TEST_INSTRUCTOR_NAME, 'instructor', {
      phone: '+201199887766',
      country: 'EG',
    });
    userId = fbUser.uid;
    created.user = 1;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      const usersSnap = await getDocs(collection(db, 'users'));
      const existing = usersSnap.docs.find(d => d.data().email === TEST_INSTRUCTOR_EMAIL);
      if (!existing) {
        throw new Error(`Auth account exists for ${TEST_INSTRUCTOR_EMAIL} but no user profile found. Please delete the account from Firebase Console and try again.`);
      }
      userId = existing.id;
      // Ensure role is instructor
      await setDoc(doc(db, 'users', userId), { role: 'instructor', updatedAt: Date.now() }, { merge: true });
    } else {
      throw err;
    }
  }

  // 2. Find the matching instructor doc and link userId
  const instructorsSnap = await getDocs(collection(db, 'instructors'));
  const matchingInstructor = instructorsSnap.docs.find(d => d.data().name === TEST_INSTRUCTOR_NAME);

  let instructorDocId: string | null = null;
  if (matchingInstructor) {
    instructorDocId = matchingInstructor.id;
    // Link the instructor doc to this user
    await setDoc(doc(db, 'instructors', instructorDocId), { userId, updatedAt: Date.now() }, { merge: true });
    created.instructorLinked = 1;
  }

  // 3. Update sessions, quizzes, capstones that reference the old instructor doc ID
  //    to also have the new user ID, so instructorId === user.id filtering works
  if (instructorDocId) {
    // Update sessions
    const sessionsSnap = await getDocs(collection(db, 'liveSessions'));
    for (const d of sessionsSnap.docs) {
      if (d.data().instructorId === instructorDocId) {
        await setDoc(doc(db, 'liveSessions', d.id), { instructorUserId: userId }, { merge: true });
        created.sessionsUpdated++;
      }
    }

    // Update quizzes
    const quizzesSnap = await getDocs(collection(db, 'quizzes'));
    for (const d of quizzesSnap.docs) {
      if (d.data().instructorId === instructorDocId) {
        await setDoc(doc(db, 'quizzes', d.id), { instructorUserId: userId }, { merge: true });
        created.quizzesUpdated++;
      }
    }

    // Update capstones
    const capstonesSnap = await getDocs(collection(db, 'capstones'));
    for (const d of capstonesSnap.docs) {
      if (d.data().instructorId === instructorDocId) {
        await setDoc(doc(db, 'capstones', d.id), { instructorUserId: userId }, { merge: true });
        created.capstonesUpdated++;
      }
    }
  }

  return {
    email: TEST_INSTRUCTOR_EMAIL,
    password: TEST_INSTRUCTOR_PASSWORD,
    created,
  };
}
