# Security Specification: Zero-Trust Attribute-Based Access Control (ABAC)

This specification defines the strict invariant patterns, malicious testing payloads, and automated test-suite structures designed to harden the Delhi University study resource archive.

---

## 1. Data Invariants

### Courses (`/courses/{courseId}`)
- **Read**: Globally accessible (public).
- **Write**: Strict administrator-only write privilege (only `request.auth.token.email == 'pk950364@gmail.com'` is permitted to create, update, or delete).
- **Structure**: Title/name must be between 1 and 200 characters. `level` must strictly belong to the set `['UG', 'PG']`.

### Subjects (`/subjects/{subjectId}`)
- **Read**: Globally accessible (public).
- **Write**: Strict administrator-only write privilege.
- **Reference Integrity**: Must verify that the referenced `courseId` physically exists upon subject model addition.

### Materials (`/materials/{materialId}`)
- **Read**: Globally accessible (public).
- **Create**: Allowed for any authenticated and verified academic student (`request.auth.token.email_verified == true`). Field `submittedBy` must match the authenticated user's email.
- **Update**: Highly restricted. Normal students can *only* affect `upvotes` or `downvotes` counter fields. Normal users can never modify the resource `url`, the material name, or overwrite general keys. Admins have complete update privilege.
- **Delete**: Strict administrator-only privilege.

### Votes (`/materials/{materialId}/votes/{userId}`)
- **Read**: Globally accessible.
- **Write**: Allowed if authenticated, where `userId` strictly matches `request.auth.uid`. Type must strictly be either `'UP'` or `'DOWN'`.

### Submissions (`/submissions/{submissionId}`)
- **Read**: Restricted to administrators, or the original submitter (`resource.data.submittedByEmail == request.auth.token.email`), or documents whose active status becomes `'PUBLISHED'`.
- **Create**: Allowed for authenticated users. The `submittedByEmail` field must strictly match the authenticated user's token email.
- **Update**: Restricted to administrators (for status moderation updates like `'APPROVED'` or `'REJECTED'`). Ordinary users cannot tamper with status fields.
- **Delete**: Restricted to administrators.

### User Proﬁles (`/users/{userId}`)
- **Read**: Restricted to the owner (`request.auth.uid == userId`) or administrators. No anonymous profile scraping.
- **Write**: Restricted to the owner (`request.auth.uid == userId`) on create & update. Admin has write override.
- **Fields**: No privilege escalation or self-assignment of roles inside user profiles.

### Automated System Logs (`/ai_automation_logs/{logId}` & `/user_behavior_logs/{logId}`)
- **Read**: Administrator only.
- **Write**: Restricted to system accounts or authenticated users (for creation of behavioral event logs to track interaction telemetry). No update/delete permitted.

### Feature Proposals (`/feature_proposals/{proposalId}`)
- **Read**: Globally accessible to view the community roadmap.
- **Create**: Authenticated users who submit a feature proposal can create a record. Field `submittedBy` must match the user's authentic token email.
- **Update**: Restricted to counter value increments (`votes: increment(1)`) or complete admin state alterations. ordinary users cannot change proposal names or description fields after registration.
- **Delete**: Restricted to administrators.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

The following 12 attack vectors represent the strict test suite payloads that must be rejected.

| Payload ID | Targeted Collection | Exploitation Intent | Expected Result |
| :--- | :--- | :--- | :--- |
| **PAYLOAD_01** | `courses` | Write spoof course data as an authenticated non-admin user. | `PERMISSION_DENIED` |
| **PAYLOAD_02** | `subjects` | Reference a garbage course ID to poison the database schema. | `PERMISSION_DENIED` |
| **PAYLOAD_03** | `materials` | Insert unsolicited auxiliary fields (shadow keys like `isApproved: true`) upon material submission. | `PERMISSION_DENIED` |
| **PAYLOAD_04** | `materials` | Ordinary user attempts to modify the `url` field of an approved study resource. | `PERMISSION_DENIED` |
| **PAYLOAD_05** | `votes` | Authenticated user `user_A` attempts to record or overwrite a vote under the ID of `user_B`. | `PERMISSION_DENIED` |
| **PAYLOAD_06** | `submissions` | Student attempts to self-approve a pending document submission by pushing `status: "APPROVED"`. | `PERMISSION_DENIED` |
| **PAYLOAD_07** | `submissions` | Authenticated user `user_X` attempts to scrape/read a pending submission created by `user_Y`. | `PERMISSION_DENIED` |
| **PAYLOAD_08** | `users` | Unauthenticated attacker attempts to execute a blanket read (query scraping) on `/users/` directory. | `PERMISSION_DENIED` |
| **PAYLOAD_09** | `users` | Authenticated user `user_Z` attempts to set `isAdmin: true` or write privilege escalation flags to their profile. | `PERMISSION_DENIED` |
| **PAYLOAD_10** | `ai_automation_logs` | Ordinary user attempts to read, delete, or wipe automation audit logs. | `PERMISSION_DENIED` |
| **PAYLOAD_11** | `feature_proposals` | Ordinary user attempts to modify a feature proposal's title or phase description. | `PERMISSION_DENIED` |
| **PAYLOAD_12** | `feature_proposals` | Malicious entity attempts to down-vote or decrease current vote counters using arbitrary or negative decrements. | `PERMISSION_DENIED` |

---

## 3. The Test Runner Suite

```typescript
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'du-study-library-security',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8')
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Zero-Trust ABAC Security Validation Suite', () => {
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  test('Payload_01: Block course creation by non-admin', async () => {
    const context = testEnv.authenticatedContext('student_uid', { email: 'student@du.in' });
    const db = context.firestore();
    await expect(
      setDoc(doc(db, 'courses/bsc_hons_physics'), {
        name: 'B.Sc. (Hons) Physics (Poisoned)',
        level: 'UG',
        nepBased: true
      })
    ).rejects.toThrow();
  });

  test('Payload_03: Reject creation of materials with shadow key modifications', async () => {
    const context = testEnv.authenticatedContext('student_uid', { email: 'student@du.in', email_verified: true });
    const db = context.firestore();
    await expect(
      setDoc(doc(db, 'materials/math_paper_01'), {
        subjectId: 'calculus_101',
        title: 'Bypassed Calculus Notes',
        url: 'https://unsafe-link.example.com',
        type: 'PDF',
        isApproved: true, // Maliciously setting shadow field to auto-approve
        submittedBy: 'student@du.in'
      })
    ).rejects.toThrow();
  });

  test('Payload_05: Reject voting as another user', async () => {
    const context = testEnv.authenticatedContext('hacker_uid', { email: 'hacker@du.in' });
    const db = context.firestore();
    await expect(
      setDoc(doc(db, 'materials/mat_1/votes/student_uid'), {
        userId: 'student_uid', // Spoofing student UID
        type: 'UP'
      })
    ).rejects.toThrow();
  });

  test('Payload_06: Block self-approval of student submissions', async () => {
    const context = testEnv.authenticatedContext('student_uid', { email: 'student@du.in' });
    const db = context.firestore();
    await expect(
      setDoc(doc(db, 'submissions/sub_99'), {
        submissionType: 'MATERIAL',
        courseName: 'BSC Computer Science',
        subjectName: 'Data Structures',
        semester: 3,
        status: 'APPROVED', // Spoofed approval
        submittedByEmail: 'student@du.in'
      })
    ).rejects.toThrow();
  });

  test('Payload_09: Repel student profile privilege escalation', async () => {
    const context = testEnv.authenticatedContext('student_uid', { email: 'student@du.in' });
    const db = context.firestore();
    await expect(
      setDoc(doc(db, 'users/student_uid'), {
        fullName: 'Hacker Student',
        email: 'student@du.in',
        isAdmin: true // Malicious role injection
      })
    ).rejects.toThrow();
  });
});
```
