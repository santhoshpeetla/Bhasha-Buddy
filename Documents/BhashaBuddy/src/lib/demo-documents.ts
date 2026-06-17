export interface DemoDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  rawText: string;
}

export const demoDocuments: Record<string, DemoDocument> = {
  scholarship: {
    id: "scholarship",
    title: "Pragati Scholarship Scheme 2026",
    description: "All India Council for Technical Education (AICTE) scholarship notification for girl students pursuing technical degrees.",
    fileName: "aicte_pragati_scholarship_2026.txt",
    rawText: `
ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
NOTIFICATION: PRAGATI SCHOLARSHIP SCHEME FOR GIRL STUDENTS (DEGREE & DIPLOMA) - A.Y. 2026-27

1. OBJECTIVE: 
To provide assistance and encouragement to meritorious girl students to pursue technical education. A total of 10,000 scholarships will be awarded annually.

2. ELIGIBILITY CRITERIA:
- The candidate should be a girl student admitted to 1st year of Degree/Diploma level course or 2nd year of Degree/Diploma level course through lateral entry in any of the AICTE approved Institution of respective year.
- Maximum of two girl children per family are eligible.
- Family income from all sources should not be more than Rs. 8.00 Lakh per annum during the current financial year. A valid income certificate issued by a competent State/UT Government authority must be provided.

3. AMOUNT OF SCHOLARSHIP:
- Rs. 50,000/- per annum for every year of study (maximum 4 years for first-year admitted degree and 3 years for lateral entry) as a lump sum amount towards payment of college fee, purchase of books, equipment, softwre, laptop, desktop, vehicle, and fees paid for competitive examinations.
- No other additional grants will be payable.

4. REQUIRED DOCUMENTS (TO BE UPLOADED ON NATIONAL SCHOLARSHIP PORTAL):
- Mark Sheet of SSC/10th class or equivalent examination.
- Mark Sheet of HSC/12th class or equivalent examination (for degree admission).
- Income Certificate issued by State/UT Government authority (not below Tehsildar rank) showing annual family income less than Rs. 8 Lakhs.
- Admission Letter issued by the Centralized Admission Authority for the course.
- Certificate issued by the Director/Principal/Head of the Institute confirming current enrollment.
- Tuition fee receipt showing payment.
- Aadhaar-seeded Bank Passbook page showing Account Number, IFSC code, and Photo.

5. DEADLINE:
The last date for submission of online applications on the National Scholarship Portal (NSP) is November 30, 2026. Late submissions will not be considered under any circumstances.

6. CRITICAL COMPLIANCE AND RISKS:
- Students must maintain minimum 75% attendance in each semester. Fall in attendance below 75% will lead to immediate cancellation of scholarship for the respective semester/year.
- Any discrepancy, false declaration, or double-dipping (receiving another scholarship from State or Central Government) will result in immediate cancellation, blacklisting, and retrieval of the disbursed amount.
    `
  },
  circular: {
    id: "circular",
    title: "VNRVJIET Tuition Fee Circular",
    description: "Tuition fee payment circular for the academic year 2026-2027 with deadline and fine details.",
    fileName: "vnrvjiet_tuition_fee_circular_2026.txt",
    rawText: `
VALLURUPALLI NAGESWARA RAO VIGNANA JYOTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY
An Autonomous Institute under JNTUH. Approved by AICTE, Accredited by NBA & NAAC
Bachupally, Nizampet (S.O), Hyderabad - 500090, Telangana State, India.

Ref: VNRVJIET/ACAD/2026/C-42
Date: June 15, 2026

CIRCULAR: PAYMENT OF TUITION FEE & OTHER FEES FOR ACADEMIC YEAR 2026-2027

All students of B.Tech (II, III, and IV Years) and M.Tech/MCA (II Year) are hereby informed that they must pay their annual Tuition Fee and other administrative fees for the academic year 2026-27 as per the schedule below.

1. FEE STRUCTURE:
- Tuition Fee (General/Convenor Category): Rs. 1,35,000/- per annum
- Tuition Fee (NRI/Management Category): Rs. 2,70,000/- per annum
- Administrative & University Common Services Fee: Rs. 8,500/- per annum

2. PAYMENT MODE:
All payments must be made online through the college portal (https://www.vnrvjiet.ac.in) via NetBanking, Credit Card, Debit Card, or UPI. Demand Drafts (DD) should be drawn in favor of "VNR Vignana Jyothi Institute of Engineering and Technology" payable at Hyderabad, and submitted at the accounts block counter.

3. SCHEDULE OF DEADLINES & LATE FEES:
- Last date for payment without fine: August 15, 2026.
- Payment with a fine of Rs. 100/- per day: From August 16, 2026 to August 31, 2026.
- Payment with a fine of Rs. 500/- per day + Discontinuation Warning: From September 1, 2026 onwards.

4. REQUIRED COMPLIANCE:
- Students who fail to pay the fees on or before August 31, 2026 will have their names removed from the class attendance registers. They will not be allowed to attend classes or lab sessions, and their attendance during this period will be marked as absent.
- Scholarship/Fee Reimbursement (RTF) eligible students must submit their updated Income Certificate (issued after April 1, 2026) and Aadhaar card at the scholarship counter (Room No. A-102) before August 10, 2026 to claim fee deduction.

5. CONTACT:
For any issues regarding fee structure or online payment receipts, please email accounts@vnrvjiet.ac.in or contact the Accounts Section at 040-23042758 (Ext: 1003).

By Order,
Principal, VNRVJIET
    `
  },
  government: {
    id: "government",
    title: "PM-KISAN Samman Nidhi e-KYC",
    description: "Ministry of Agriculture notification on mandatory e-KYC for landholding farmers to receive the next installment.",
    fileName: "pm_kisan_ekyc_notice_2026.txt",
    rawText: `
GOVERNMENT OF INDIA
MINISTRY OF AGRICULTURE AND FARMERS WELFARE
DEPARTMENT OF AGRICULTURE, COOPERATION AND FARMERS WELFARE
PUBLIC NOTICE: MANDATORY E-KYC AND LAND LINKING FOR PM-KISAN BENEFICIARIES

Date: May 20, 2026

Under the Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) scheme, landholding farmer families receive an income support of Rs. 6,000/- per year in three equal installments of Rs. 2,000/- each, directly into their bank accounts.

1. NEW MANDATE FOR 18TH INSTALLMENT:
To ensure the benefits reach the authentic and active farmers only, the Ministry has made e-KYC and Land Records linking mandatory for all beneficiaries. 

2. ELIGIBILITY RE-VERIFICATION:
- The beneficiary must be a farmer owning cultivable land in their own name.
- Institutional landholders, taxpayers in the last assessment year, and retired pensioners drawing Rs. 10,000/- or more per month are excluded from this scheme.

3. METHODS TO COMPLETE E-KYC:
Beneficiaries can perform e-KYC through one of the following methods:
- OTP Based e-KYC: Available free of cost on the PM-KISAN Portal (pmkisan.gov.in) and mobile app. Requires an Aadhaar-linked mobile number.
- Biometric e-KYC: Available at any Common Service Center (CSC) across India. A nominal fee of Rs. 15/- is charged by CSC operators.
- Face Auth App: Download PMKISAN GoI App from Google Play Store for face-recognition based e-KYC.

4. SUBMISSION OF DOCUMENTS FOR LAND LINKING:
For farmers whose land records are not updated on the portal:
- Submit a copy of the Land Revenue Document (Patta/Passbook/Jamabandi) along with Aadhaar Card copy to the local Agriculture Extension Officer (AEO) or Tehsildar's office.

5. CRITICAL DEADLINE:
The absolute deadline to complete e-KYC and land linking is July 31, 2026. Failure to do so will result in the suspension of the upcoming 18th installment and subsequent payments. Accounts that remain unverified after July 31, 2026 will be flagged as inactive, requiring physical verification to re-activate.

6. CITATION & DETAILS:
Reference: Circular PMK-2026/04. For complaints, call Toll-Free Helpline: 155261 or 1800115526.
    `
  },
  bank: {
    id: "bank",
    title: "SBI PAN & KYC Compliance Notice",
    description: "State Bank of India notification regarding mandatory KYC verification and PAN linking to keep accounts active.",
    fileName: "sbi_kyc_pan_compliance_2026.txt",
    rawText: `
STATE BANK OF INDIA
RETAIL ASSETS & SMALL BUSINESSES DIVISION
LOCAL HEAD OFFICE, HYDERABAD - 500001
NOTICE: MANDATORY UPDATION OF PAN AND KYC DETAILS FOR RETAIL ACCOUNTS

Date: May 12, 2026

Dear Customer,

As per the Reserve Bank of India (RBI) Master Direction on Know Your Customer (KYC), State Bank of India (SBI) is required to periodically update the KYC details of its customers. To ensure compliance and safeguard your account against unauthorized usage, please read this notification carefully.

1. REQUIREMENT:
All savings and current account holders who have received a notification/SMS must submit their latest KYC documents and link their Permanent Account Number (PAN) or Form 60 (if PAN is not available) with their account.

2. CONSEQUENCE OF NON-COMPLIANCE:
If PAN/Form 60 and KYC updates are not completed on or before September 30, 2026:
- The account will be put under "Total Freeze" mode. No withdrawals or credits (including government subsidies, salary, or pension) will be allowed.
- Transactions via UPI, Debit Card, and NetBanking will be suspended.

3. DOCUMENTS REQUIRED FOR KYC UPDATION:
Please submit self-attested copies of the following documents:
- Identity and Address Proof (any one Officially Valid Document - OVD): Aadhaar Card, Passport, Voter ID Card, Driving License, or NREGA Card.
- Copy of PAN Card (mandatory for transactions exceeding Rs. 50,000/-).
- Recent passport size photograph.
- For address changes, submit a recent utility bill (Electricity, Water, Gas, or Landline Telephone bill) not older than 2 months.

4. HOW TO SUBMIT:
- In-Person: Visit your SBI home branch and submit the KYC Update Form along with self-attested copies of documents. Carry original documents for verification.
- Online (Only for accounts with no change in address/details): Log in to SBI Internet Banking (onlinesbi.sbi) -> Profile -> Update KYC, upload PDF scans of Aadhaar and PAN.

5. DEADLINE:
The deadline for updating KYC and PAN is September 30, 2026.

Yours faithfully,
General Manager (Retail Banking)
    `
  }
};
