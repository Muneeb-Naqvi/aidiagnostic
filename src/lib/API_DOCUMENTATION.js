/**
 * Medical Diagnostic System - Appointment Booking API Reference
 * 
 * This document outlines the complete API flow for the appointment booking system
 * which connects patients, doctors, and medical reports through AI-powered disease detection.
 */

// ============================================================================
// 1. DOCTOR REGISTRATION & APPROVAL (Backend Admin)
// ============================================================================
/*
POST /api/doctors/register
- Doctor fills signup form
- Password is hashed with bcryptjs
- Initial status: "pending" 

Admin approval at /api/admin/approve-doctor
- Changes status to "approved"
- Doctor can now appear in suggested doctors list

Fields stored in MongoDB 'doctors' collection:
{
  doctorId: string,
  email: string (unique),
  name: string,
  specialization: string,           // e.g., "Cardiologist"
  degree: string,                   // e.g., "MBBS", "BDS", "FCPS", "MD"
  experience: number,               // years
  gender: string,                   // "male", "female", "other"
  phoneNumber: string,
  whatsappNumber: string,
  profileImage: string,             // URL to cloudinary
  website: string,
  consultationFee: number,
  qualifications: [string],         // Array of additional qualifications
  ratings: {
    average: number,
    count: number,
    reviews: [array]
  },
  status: string,                   // "pending", "approved", "rejected", "suspended"
  appointments: [array],            // Embedded appointments
  createdAt: Date,
  updatedAt: Date
}
*/

// ============================================================================
// 2. PATIENT UPLOADS & REPORT ANALYSIS
// ============================================================================
/*
POST /api/lab-reports
- Patient uploads medical report (PDF/JPG/PNG)
- File stored in Cloudinary
- Report stored in MongoDB 'labReports' collection
- Initial status: "uploaded"

Flow:
1. Upload → Gets reportId
2. Patient clicks "Analyze" button
3. System extracts text using OCRSpace API
4. Sends to Fireworks AI for disease detection
5. Uses Google Generative AI for detailed analysis
6. Updates report.status to "analyzed"
7. Stores analysis results:
   {
     disease: string,                  // Primary detected disease
     severity: string,                 // "low", "medium", "high"
     details: string,                  // Detailed analysis text
     suggestedSpecializations: [string], // e.g., ["Cardiologist", "Internist"]
     recommendedDoctor: string,        // Doctor name (deprecated - use specialization)
     ranges: [                         // For blood test results
       {
         name: string,
         value: string,
         status: string               // "high", "normal", "low"
       }
     ]
   }
*/

// ============================================================================
// 3. DISEASE TO DOCTOR MAPPING
// ============================================================================
/*
File: src/lib/diseaseMap.js

Maps detected diseases to specialized doctors:

Diabetes → Endocrinologist
Heart Disease → Cardiologist
Asthma → Pulmonologist
Depression → Psychiatrist
Anemia → Hematologist
... (70+ disease mappings)

Function: getSpecializationForDisease(disease) → returns specialization
*/

// ============================================================================
// 4. SUGGESTED DOCTORS FETCHING (Patient Dashboard)
// ============================================================================
/*
GET /api/patients/[patientId]/suggested-doctors

Flow:
1. Patient opens "Suggested Doctors" tab
2. System fetches patient's analyzed reports
3. Extracts all detected diseases from analysis
4. Maps diseases to specializations using diseaseMap
5. Queries MongoDB 'doctors' collection with:
   - status: "approved"
   - specialization matches extracted specializations
6. Returns array of deserving doctors with full details:
   {
     doctorId: string,
     name: string,
     email: string,
     specialization: string,
     degree: string,
     experience: number,
     gender: string,
     phoneNumber: string,
     whatsappNumber: string,
     profileImage: string,
     website: string,
     consultationFee: number,
     ratings: {...},
     qualifications: [string],
     totalConsultations: number
   }

Response includes:
{
  success: boolean,
  data: [array of doctors],
  meta: {
    detectedDiseases: [array],
    matchingSpecializations: [array],
    totalDoctorsFound: number
  }
}
*/

// ============================================================================
// 5. ALTERNATIVE: GET DOCTORS BY SPECIALIZATION
// ============================================================================
/*
GET /api/doctors/by-specialization?specialization=Cardiologist&limit=10

Direct query to find doctors by specialization
- Useful for advanced filtering
- Returns paginated results
- Only approved doctors
*/

// ============================================================================
// 6. APPOINTMENT BOOKING (Patient Action)
// ============================================================================
/*
POST /api/appointments

Patient clicks "Book Appointment" on doctor card or hover popup

Request Body:
{
  doctorId: string,             // Selected doctor's ID
  patientId: string,            // Current patient's ID
  reportId: string,             // Report being consulted (nullable)
  scheduledDate: Date,          // Optional appointment time
  notes: string                 // Reason for appointment
}

System Actions:
1. Fetches patient details from MongoDB 'patients' collection
2. Fetches doctor details from MongoDB 'doctors' collection
3. Fetches report details (if reportId provided) from 'labReports' collection
4. Creates appointment object:
   {
     appointmentId: string,         // APT-{timestamp}-{random}
     patientId: string,
     patientName: string,
     patientEmail: string,
     patientPhone: string,
     doctorId: string,
     reportId: string (nullable),
     disease: string,               // From report analysis
     reportName: string,            // From report
     reportAnalysis: {...},         // Full AI analysis object
     status: "pending",             // Doctor must accept
     scheduledDate: Date (nullable),
     notes: string,
     createdAt: Date,
     updatedAt: Date
   }

5. Adds appointment to doctor's embedded appointments array:
   db.collection("doctors").updateOne(
     { doctorId },
     { $push: { appointments: appointmentObject } }
   )

6. Also adds to patient's embedded appointments array:
   db.collection("patients").updateOne(
     { patientId },
     { $push: { appointments: appointmentObject } }
   )

Response:
{
  success: true,
  message: "Appointment booked successfully",
  data: {
    appointmentId: string,
    doctorName: string,
    doctorSpecialization: string,
    patientName: string,
    status: "pending"
  }
}

UX: SweetAlert2 confirmation dialog shows:
- Doctor name, specialization, degree, experience, gender
- Doctor's consultation fee
- Patient's report name and detected disease
- Clear "Yes, Book Appointment" and "Cancel" options
*/

// ============================================================================
// 7. DOCTOR VIEWS APPOINTMENTS (Doctor Dashboard)
// ============================================================================
/*
GET /api/appointments?doctorId={doctorId}

Flow:
1. Doctor logs in and opens appointments tab
2. System fetches doctor's embedded appointments array
3. Displays appointments in card format with:
   - Patient name (at top of card)
   - Appointment status badge
   - Disease detected (if available)
   - Report name (clickable to view details)

Clicking appointment card opens modal showing:
- Patient information (name, email, phone)
- Medical information section with:
  * Disease detected
  * Report name
  * AI Analysis with:
    - Analysis details
    - Severity level
    - Recommended specializations
    - Blood test ranges (if applicable)
- Appointment notes
- Action buttons:
  * If status="pending": "Accept Appointment" or "Reject"
  * If status="confirmed": "Mark as Completed"
- Quick actions: Email, Call patient
*/

// ============================================================================
// 8. DOCTOR UPDATES APPOINTMENT STATUS
// ============================================================================
/*
PATCH /api/appointments/[appointmentId]/status

Request Body:
{
  status: string  // "confirmed", "completed", "cancelled", etc.
}

Updates appointment in both collections:
- db.collection("doctors").updateOne(
    { "appointments.appointmentId": appointmentId },
    { $set: { "appointments.$.status": status } }
  )
- db.collection("patients").updateOne(
    { "appointments.appointmentId": appointmentId },
    { $set: { "appointments.$.status": status } }
  )

Appointment statuses:
- "pending": Awaiting doctor acceptance
- "confirmed": Doctor accepted, ready for consultation
- "completed": Consultation finished
- "cancelled": Either party cancelled
*/

// ============================================================================
// 9. SECURITY & BEST PRACTICES
// ============================================================================
/*
✅ IMPLEMENTED:
- Password hashing with bcryptjs before DB storage
- Password excluded from GET responses (password: 0 in projection)
- Status filtering: Only "approved" doctors shown to patients
- Validation of required fields
- Error handling with appropriate HTTP status codes

✅ API SECURITY:
- Doctor password never returned in any response
- Sensitive info (licenseNumber) can be excluded if needed
- Appointment details include only necessary patient info
- Email/Phone available only to relevant parties

✅ DATA CONSISTENCY:
- Appointments stored in both doctor and patient records
- Single source of truth pattern: Updates happen in both places
- Atomic operations prevent data inconsistency
- CreatedAt/UpdatedAt timestamps for audit trail

✅ ARCHITECTURE:
- Clean separation of concerns
- Modular API endpoints
- Consistent response format
- Comprehensive error messages
*/

// ============================================================================
// 10. CLIENT-SIDE WORKFLOW (Patient)
// ============================================================================
/*
1. Patient Dashboard Load
   - Fetches patient's lab reports
   - For each analyzed report, extracts diseases
   - Calls GET /api/patients/[patientId]/suggested-doctors
   - Maps diseases to doctors using diseaseMap

2. Suggested Doctors Tab
   - Displays all suggested doctors in grid
   - Shows hover card with full profile on mouse enter
   - Displays all analyzed reports in separate section
   - Each report shows relevant doctors for that specific disease

3. Book Appointment
   - Patient hovers over or clicks doctor card
   - Sees detailed profile with all qualifications
   - Clicks "Book Appointment"
   - SweetAlert2 shows confirmation modal with:
     * Doctor details
     * Patient report info
     * "Yes, Book Appointment" button
   - On confirm: POST /api/appointments
   - Success: Toast notification + appointment created

4. Appointment Confirmation
   - Doctor receives appointment in dashboard
   - Sees patient's full medical report and AI analysis
   - Can accept, reject, or complete appointment
*/

// ============================================================================
// 11. CLIENT-SIDE WORKFLOW (Doctor)
// ============================================================================
/*
1. Doctor Login → Doctor Dashboard
   - Sidebar shows "Appointments" tab

2. Appointments Tab
   - Fetches GET /api/appointments?doctorId={doctorId}
   - Displays appointments in cards
   - Shows status badge and disease info

3. Click Appointment Card
   - Opens modal with full medical details:
     * Patient information
     * Detected disease
     * AI analysis with severity and ranges
     * All relevant medical data
   - Shows action buttons based on status:
     * Pending: Accept/Reject
     * Confirmed: Mark as Completed

4. Accept/Reject/Complete
   - PATCH /api/appointments/[appointmentId]/status
   - Updates status in both doctor and patient records
   - Toast notification of successful update
*/

// ============================================================================
// 12. FRAMER MOTION ANIMATIONS
// ============================================================================
/*
Patient Dashboard Animations:
✅ Doctor cards fade in with stagger effect
✅ On hover: cards lift up with shadow increase
✅ Hover overlay appears with opacity animation
✅ Disease summary section fades in
✅ Report section animates on tab switch

Doctor Dashboard Animations:
✅ Appointments list animates on load
✅ Selected appointment modal fades in
✅ Status updates trigger smooth transition
✅ Patient names and details fly in

UI Polish:
✅ Framer Motion AnimatePresence for list items
✅ whileHover={{ y: -4 }} for card lift effect
✅ Smooth transitions on all state changes
✅ Custom scrollbar styling in modals
*/

// ============================================================================
// 13. ERROR HANDLING
// ============================================================================
/*
All endpoints return consistent error format:
{
  success: false,
  error: "Descriptive error message"
}

Common errors:
- 400: Missing required parameters
- 404: Resource not found (patient, doctor, appointment)
- 500: Server error (database, AI service failure)

Client-side handling:
- toast.error(error.message) for user feedback
- SweetAlert for booking confirmation with error fallback
- Network retry logic for critical operations
*/

// ============================================================================
// 14. EXAMPLE: COMPLETE BOOKING FLOW
// ============================================================================
/*
STEP 1: Patient uploads lab report
POST /api/lab-reports
{
  patientId: "PAT-123",
  name: "Blood Test Report",
  type: "blood-test",
  file: <binary>
}
→ Stored with status: "uploaded", reportId: "REP-456"

STEP 2: Patient analyzes report
POST /api/lab-reports/REP-456/analyze
→ Extract text with OCRSpace
→ Analyze with Fireworks AI (e.g., "Diabetes detected")
→ Generate details with Google Generative AI
→ Update report with analysis + status: "analyzed"

STEP 3: Patient opens "Suggested Doctors" tab
GET /api/patients/PAT-123/suggested-doctors
→ Maps "Diabetes" → "Endocrinologist" using diseaseMap
→ Queries approved doctors with specialization="Endocrinologist"
→ Returns array of endocrinologists with full profiles
→ UI displays doctors in grid format

STEP 4: Patient hovers doctor card
→ Hover overlay appears showing all details

STEP 5: Patient clicks "Book Appointment"
→ SweetAlert shows confirmation with:
   - Dr. Sarah Ahmed, Endocrinologist, MBBS, 8 years exp
   - Report: Blood Test Report
   - Disease: Diabetes
   - "Yes, Book Appointment" button

STEP 6: Patient confirms
POST /api/appointments
{
  doctorId: "DOC-789",
  patientId: "PAT-123",
  reportId: "REP-456",
  notes: "Diabetes consultation"
}
→ Creates appointment in both databases
→ Appointment status: "pending"
→ Toast: "Appointment booked with Dr. Sarah Ahmed!"

STEP 7: Doctor receives appointment
GET /api/appointments?doctorId=DOC-789
→ Shows new appointment in dashboard

STEP 8: Doctor clicks appointment
→ Modal opens showing:
   - Patient: Sarah Johnson
   - Disease: Diabetes
   - Report: Blood Test Report
   - AI Analysis: [detailed results]
   - Options: Accept / Reject

STEP 9: Doctor accepts
PATCH /api/appointments/APT-ID/status
{
  status: "confirmed"
}
→ Updates in both databases
→ Toast: "Appointment confirmed"

FLOW COMPLETE ✓
*/

export const API_ENDPOINTS = {
  // Patient Endpoints
  PATIENT_SUGGESTED_DOCTORS: '/api/patients/[patientId]/suggested-doctors',
  
  // Doctor Endpoints
  DOCTORS_BY_SPECIALIZATION: '/api/doctors/by-specialization',
  
  // Report Endpoints
  UPLOAD_REPORT: '/api/lab-reports',
  ANALYZE_REPORT: '/api/lab-reports/[reportId]/analyze',
  
  // Appointment Endpoints
  CREATE_APPOINTMENT: '/api/appointments',
  GET_APPOINTMENTS: '/api/appointments',
  UPDATE_APPOINTMENT_STATUS: '/api/appointments/[appointmentId]/status',
};
