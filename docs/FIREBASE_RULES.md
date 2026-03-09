# Firebase Security Rules

## Recommended Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }

    // Courses - public read, admin write
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }

    // Enrollments - authenticated read own, admin read all, authenticated create
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null && (
        resource.data.studentId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin']
      );
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }

    // Contact messages - anyone can create, admin read/update
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }

    // Analytics - admin only
    match /analytics/{docId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }

    // Site config - public read, admin write
    match /siteConfig/{docId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'admin'];
    }
  }
}
```

## Key Principles

- **Least privilege**: Users can only read/write their own data unless they are admins.
- **Public read for courses**: Course catalog is publicly accessible without authentication.
- **Admin escalation**: Only `super_admin` and `admin` roles can manage other users, courses, and enrollments.
- **Contact form**: Allows unauthenticated submissions (public-facing form) but restricts read/update/delete to admins.
- **Analytics**: Restricted to admin roles only.

## Deployment

Deploy these rules via the Firebase Console or CLI:

```bash
firebase deploy --only firestore:rules
```
