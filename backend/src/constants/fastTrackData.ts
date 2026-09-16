export interface FastTrackEntry {
  id: string;
  intentKeywords: string[];
  canonicalQuestion: string;
  answer: string;
  requiresRole?: 'admin' | 'employee' | 'any';
  lastUpdated: Date;
}

export const FAST_TRACK_DATA: FastTrackEntry[] = [
  {
    id: 'leave_policy',
    intentKeywords: ['leave', 'policy', 'apply', 'sick', 'casual', 'rules'],
    canonicalQuestion: 'What is the leave policy and how do I apply?',
    answer: `**Leave Policy & Application Guide** 🌴

We value your work-life balance! Here is your annual leave quota:
- 🟢 **Casual Leaves (CL):** 12 days/year
- 🔵 **Sick Leaves (SL):** 10 days/year
- 🟣 **Earned Leaves (EL):** 15 days/year

*💡 How to apply:* Simply navigate to your **Leave Dashboard**, select your dates, and submit the request for your manager's approval.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'payslip_download',
    intentKeywords: ['payslip', 'salary', 'download', 'pay', 'slip', 'slip'],
    canonicalQuestion: 'How can I download my payslip?',
    answer: `**Your Salary Payslips** 💰

Your monthly payslips are automatically generated and securely stored in our system on the **1st of every month**.

*📥 How to download:* Go to the **Payroll Section** on your dashboard and click the PDF icon next to the relevant month.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'holiday_calendar',
    intentKeywords: ['holiday', 'calendar', 'public', 'holidays', 'list', 'off'],
    canonicalQuestion: 'What are the upcoming public holidays?',
    answer: `**Upcoming Public Holidays** 🗓️

Looking forward to a break? You can view the complete list of mandatory and restricted holidays for this year under the **Company Documents** section.

*Note:* The very next upcoming holiday will always be pinned to the top of your main dashboard!`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'it_support_contact',
    intentKeywords: ['it', 'support', 'helpdesk', 'laptop', 'hardware', 'issue', 'network'],
    canonicalQuestion: 'How do I contact IT support?',
    answer: `**IT Support & Helpdesk** 💻

Having hardware or network trouble? We've got you covered!
- 🎫 **Raise a Ticket:** Use the internal IT Helpdesk portal (Recommended).
- 📧 **Email:** Drop a message to **it-support@company.com**.
Our tech team typically responds within 2 hours.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'working_hours',
    intentKeywords: ['working', 'hours', 'office', 'timing', 'time', 'shift'],
    canonicalQuestion: 'What are the standard office timings?',
    answer: `**Standard Office Timings** 🕒

Our standard operating hours are **9:30 AM to 6:30 PM (Monday to Friday)**.
If your role requires a specific shift or roster, please sync with your Reporting Manager for exact timings.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'wfh_policy',
    intentKeywords: ['wfh', 'work', 'from', 'home', 'remote', 'policy'],
    canonicalQuestion: 'What is the Work From Home (WFH) policy?',
    answer: `**Work From Home (WFH) Policy** 🏠

We offer a flexible hybrid model! You are eligible to take up to **2 days of WFH per month**.

*Please ensure:*
1. You get prior approval from your manager.
2. You have a stable internet connection.
3. You remain actively available during core working hours.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'admin_dashboard_help',
    intentKeywords: ['admin', 'panel', 'manage', 'all', 'users', 'broadcast', 'announcement'],
    canonicalQuestion: 'How do I broadcast an announcement?',
    answer: `**Admin Announcement Protocol:**\nAs an admin, you can broadcast announcements to the entire company using the "Communication" module in your admin dashboard. These will appear instantly for all users.`,
    requiresRole: 'admin',
    lastUpdated: new Date()
  },
  {
    id: 'forgot_password',
    intentKeywords: ['forgot', 'password', 'reset', 'change', 'unlock', 'account'],
    canonicalQuestion: 'How do I reset my password?',
    answer: `**Password Reset:**\nIf you forgot your password, please go to the Login screen and click "Forgot Password". You will receive an email with a secure reset link. If your account is locked, please contact IT Support.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'expense_reimbursement',
    intentKeywords: ['expense', 'claim', 'reimbursement', 'bill', 'submit', 'money'],
    canonicalQuestion: 'How do I claim expenses or reimbursements?',
    answer: `**Expense Claims:**\nYou can submit expense claims via the "Finance" tab on your dashboard. Please upload clear images of your bills. Claims submitted before the 20th are processed in the current month\'s payroll.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'health_insurance',
    intentKeywords: ['health', 'insurance', 'medical', 'policy', 'mediclaim', 'hospital'],
    canonicalQuestion: 'What are the health insurance details?',
    answer: `**Corporate Health Insurance** 🏥

Your health is our priority! All full-time employees are covered under our premium group health insurance policy (Coverage: **₹5,000,000**).

*💳 E-Card:* You can download your insurance E-Card and check network hospitals directly from the **HR Portal**.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'parental_leave',
    intentKeywords: ['maternity', 'paternity', 'leave', 'parental', 'baby', 'child'],
    canonicalQuestion: 'What is the maternity/paternity leave policy?',
    answer: `**Maternity & Paternity Leave** 👶

Congratulations on the new addition to your family!
- 🌸 **Maternity Leave:** 26 weeks of fully paid leave.
- 🍼 **Paternity Leave:** 15 days of fully paid leave.
*Please inform HR at least 30 days in advance so we can ensure a smooth transition.*`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'notice_period',
    intentKeywords: ['notice', 'period', 'resign', 'resignation', 'quit', 'leave', 'company'],
    canonicalQuestion: 'What is the notice period policy?',
    answer: `**Notice Period Policy** ⏳

If you decide to move on, our standard notice period is:
- **60 Days** (Post-confirmation)
- **30 Days** (During probation)

All resignation requests must be formally submitted via the HR portal and acknowledged by your manager.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'performance_review',
    intentKeywords: ['performance', 'review', 'appraisal', 'promotion', 'cycle', 'rating'],
    canonicalQuestion: 'When is the performance review cycle?',
    answer: `**Performance Appraisals:**\nOur company follows an annual performance review cycle conducted in **April**. Mid-year check-ins are conducted in October. Promotions and salary revisions are strictly tied to your April appraisal rating.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'it_equipment',
    intentKeywords: ['laptop', 'upgrade', 'equipment', 'mouse', 'keyboard', 'monitor', 'request'],
    canonicalQuestion: 'How do I request a new laptop or IT equipment?',
    answer: `**IT Equipment Request:**\nTo request new hardware (monitor, keyboard, mouse) or a laptop upgrade, please raise a ticket in the IT Helpdesk. Hardware upgrades require approval from your Reporting Manager.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'office_wifi',
    intentKeywords: ['wifi', 'password', 'internet', 'network', 'connect', 'office'],
    canonicalQuestion: 'What is the office WiFi password?',
    answer: `**Office Network:**\n- **Network Name (SSID):** Company_Corp_5G\n- **Password:** You must use your unique Employee ID and Windows Password to authenticate to the corporate WiFi. Guest WiFi details are available at the reception.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'dress_code',
    intentKeywords: ['dress', 'code', 'wear', 'clothes', 'attire', 'casual', 'friday'],
    canonicalQuestion: 'What is the office dress code?',
    answer: `**Office Dress Code** 👔

We maintain a **Smart Casual** environment from Monday to Thursday. 
Fridays are **Casual Fridays**! 🎉

*Please note:* Ripped jeans, flip-flops, and overly casual gym wear are not permitted in the office.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'update_bank_details',
    intentKeywords: ['bank', 'account', 'details', 'update', 'change', 'salary', 'account'],
    canonicalQuestion: 'How do I update my salary bank account details?',
    answer: `**Updating Bank Details:**\nYou can change your salary bank account by navigating to **Profile Settings -> Financial Info**. You will need to upload a cancelled cheque or bank statement as proof. Changes take 7 working days to reflect.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'salary_slip_password',
    intentKeywords: ['password', 'open', 'unlock', 'payslip', 'salary', 'slip', 'pdf'],
    canonicalQuestion: 'What is the password to open my payslip PDF?',
    answer: `**Payslip Password:**\nYour payslip PDF is password protected. The password is your **PAN card number in uppercase** followed by your **Date of Birth in DDMMYYYY format**. (Example: ABCDE1234F01011990)`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'company_address',
    intentKeywords: ['address', 'location', 'office', 'where', 'situated', 'headquarters', 'hq'],
    canonicalQuestion: 'What is the office address?',
    answer: `**Office Location:**\nOur Headquarters is located at:\n*Tech Park, Building 3, Floor 4, Silicon Avenue.*\nPlease carry your ID card for building entry.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'tax_declaration',
    intentKeywords: ['tax', 'declaration', 'tds', 'form', '16', 'save', 'investment'],
    canonicalQuestion: 'How do I submit my tax declaration (IT Declaration)?',
    answer: `**Tax Declarations:**\nInvestment Proofs and Tax Declarations can be submitted via the **Finance -> Tax Portal**. The window for submitting proofs opens every year in January. Please ensure you upload clear PDFs of your investments.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'referral_policy',
    intentKeywords: ['refer', 'referral', 'bonus', 'friend', 'job', 'hire', 'vacancy'],
    canonicalQuestion: 'What is the employee referral policy?',
    answer: `**Employee Referral Program:**\nWe encourage you to refer friends for open positions! You can earn a referral bonus of **₹15,000** if your referred candidate is hired and completes their 3-month probation. Check the "Careers" tab for open roles.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'gym_allowance',
    intentKeywords: ['gym', 'wellness', 'allowance', 'health', 'fitness', 'reimburse'],
    canonicalQuestion: 'Can I claim gym or wellness allowance?',
    answer: `**Wellness Allowance:**\nEmployees are eligible for a wellness allowance of up to **₹2,000 per month** for gym memberships or fitness classes. Submit your monthly receipts in the Expense section under the "Wellness" category.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'overtime_policy',
    intentKeywords: ['overtime', 'ot', 'extra', 'hours', 'weekend', 'work', 'pay'],
    canonicalQuestion: 'What is the overtime policy?',
    answer: `**Overtime Policy:**\nOvertime pay is applicable for employees working beyond 45 hours a week, subject to prior manager approval. Weekend shifts authorized by managers are eligible for compensatory off (Comp-Off) days.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'business_travel',
    intentKeywords: ['travel', 'business', 'flight', 'ticket', 'hotel', 'booking', 'trip'],
    canonicalQuestion: 'How do I book business travel?',
    answer: `**Business Travel:**\nAll corporate travel (flights, hotels) must be booked via our internal Travel Portal at least 14 days in advance. Ensure your Reporting Manager has approved your travel request on the system first.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'id_card_replacement',
    intentKeywords: ['id', 'card', 'lost', 'stolen', 'replace', 'new', 'badge'],
    canonicalQuestion: 'How do I get a new ID card if I lost mine?',
    answer: `**ID Card Replacement:**\nIf you lose your ID badge, please report it immediately to HR and IT security to deactivate the old one. A replacement fee of ₹500 will be deducted from your next payroll, and a new card will be issued in 2 days.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'training_reimbursement',
    intentKeywords: ['training', 'course', 'learn', 'certify', 'certification', 'udemy', 'reimburse'],
    canonicalQuestion: 'Will the company pay for my courses and certifications?',
    answer: `**Learning & Development:**\nThe company provides an L&D budget of **₹10,000 per year** per employee for professional courses (Udemy, AWS certifications, etc.). You must get manager approval before purchasing the course to claim reimbursement.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'emergency_contacts',
    intentKeywords: ['emergency', 'contact', 'hr', 'admin', 'help', 'urgent', 'phone'],
    canonicalQuestion: 'Who do I contact in an emergency?',
    answer: `**Emergency Contacts:**\n- **HR Head:** hr-emergency@company.com\n- **IT Security:** 1800-IT-HELP\n- **Office Admin:** admin-desk@company.com\n*If you are facing a medical emergency, please inform your manager as soon as possible.*`,
    lastUpdated: new Date()
  },
  {
    id: 'onboarding_process',
    intentKeywords: ['onboarding', 'new', 'joiner', 'induction', 'orientation', 'start'],
    canonicalQuestion: 'What is the onboarding process for new joiners?',
    answer: `**Onboarding:**\nNew joiners must attend the 2-day orientation program starting at 10:00 AM on their first Monday. HR will send a welcome email with the detailed schedule and introductory documents.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'probation_period',
    intentKeywords: ['probation', 'confirmation', 'confirm', 'duration', 'months'],
    canonicalQuestion: 'How long is the probation period?',
    answer: `**Probation Period:**\nAll new employees have a standard probation period of **6 months**. Upon successful completion, a formal confirmation letter is issued following a review with your manager.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'cafeteria_food',
    intentKeywords: ['food', 'cafeteria', 'lunch', 'canteen', 'meal', 'coupon', 'dining'],
    canonicalQuestion: 'Is food provided in the office cafeteria?',
    answer: `**Cafeteria:**\nThe office cafeteria serves subsidized breakfast and lunch. You can load money onto your ID card at the reception or use UPI to pay at the food counters. Free snacks and beverages are available in the pantry on every floor.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'parking_facility',
    intentKeywords: ['parking', 'vehicle', 'car', 'bike', 'slot', 'park'],
    canonicalQuestion: 'How do I get a parking slot?',
    answer: `**Parking:**\nEmployees can register their vehicles (two-wheelers and four-wheelers) on the Admin portal to get a parking sticker. Parking is on a first-come, first-served basis in the basement parking lot.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'office_transport',
    intentKeywords: ['transport', 'cab', 'bus', 'shuttle', 'commute', 'pickup', 'drop'],
    canonicalQuestion: 'Does the company provide transport or cab facilities?',
    answer: `**Office Transport:**\nWe offer a free shuttle service from the nearest Metro station every 30 minutes during peak hours. For employees working late (post 9:00 PM), a drop facility can be requested via the Transport Helpdesk.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'final_settlement',
    intentKeywords: ['fnf', 'settlement', 'clearance', 'exit', 'interview', 'dues'],
    canonicalQuestion: 'When is the Full & Final (FnF) settlement processed?',
    answer: `**Final Settlement (FnF):**\nThe Full & Final settlement is processed within **45 days** of your last working day, provided all clearances (IT, Finance, Admin) are completed. Exit interviews are mandatory.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'meeting_room_booking',
    intentKeywords: ['meeting', 'room', 'book', 'conference', 'reserve'],
    canonicalQuestion: 'How do I book a meeting room?',
    answer: `**Meeting Rooms:**\nYou can book conference rooms via the integrated Office Calendar or the internal Meeting Room app. Please cancel your booking if the meeting is rescheduled to free up the room.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'posh_policy',
    intentKeywords: ['posh', 'harassment', 'ethics', 'conduct', 'complaint', 'committee'],
    canonicalQuestion: 'What is the POSH policy and how do I report an issue?',
    answer: `**POSH & Ethics:**\nWe maintain a zero-tolerance policy against workplace harassment. You can report any grievances anonymously or directly to the Internal Complaints Committee (ICC) at icc@company.com.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'variable_pay',
    intentKeywords: ['bonus', 'variable', 'pay', 'payout', 'performance', 'incentive'],
    canonicalQuestion: 'When is the variable pay or performance bonus paid?',
    answer: `**Variable Pay:**\nPerformance bonuses and variable pay are disbursed annually with the **May payroll**, based on the individual rating received during the April appraisal cycle and company performance.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'provident_fund',
    intentKeywords: ['pf', 'provident', 'fund', 'uan', 'transfer', 'epfo'],
    canonicalQuestion: 'Where can I find my UAN or PF details?',
    answer: `**Provident Fund (PF):**\nYour UAN (Universal Account Number) is mentioned on your payslip. You can manage your PF transfers or withdrawals directly on the EPFO portal using your UAN.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'leave_encashment',
    intentKeywords: ['encash', 'encashment', 'pending', 'leaves', 'balance', 'carry', 'forward'],
    canonicalQuestion: 'Can I encash my unused leaves?',
    answer: `**Leave Encashment:**\nEarned Leaves (EL) can be carried forward up to a maximum of 45 days. Any excess EL at the end of the year can be encashed. Casual and Sick leaves lapse at the end of the calendar year.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'marriage_leave',
    intentKeywords: ['marriage', 'wedding', 'special', 'leave'],
    canonicalQuestion: 'Is there any special leave for marriage?',
    answer: `**Marriage Leave:**\nEmployees are entitled to **5 days of special paid leave** for their own wedding. Please apply for this under the "Special Leave" category on the Leave Dashboard with your manager\'s approval.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'relocation_policy',
    intentKeywords: ['relocation', 'move', 'transfer', 'expenses', 'shifting', 'reimburse'],
    canonicalQuestion: 'What is the relocation policy?',
    answer: `**Relocation Policy:**\nIf you are transferring to a different office branch at the company\'s request, relocation expenses (flight tickets, initial 15-day accommodation, and goods transportation) are covered up to your grade limit.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  },
  {
    id: 'corporate_discounts',
    intentKeywords: ['discount', 'corporate', 'offer', 'perk', 'gym', 'brand'],
    canonicalQuestion: 'What corporate discounts do we have?',
    answer: `**Corporate Perks:**\nEmployees can avail exclusive discounts on various brands (electronics, gyms, flight bookings) via the Employee Perks portal using their corporate email address.`,
    requiresRole: 'any',
    lastUpdated: new Date()
  }
];
