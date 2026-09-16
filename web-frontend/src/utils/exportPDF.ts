import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportUserDataPDF = (user: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Styling (Brand Color Dark Teal #0f3f33)
  doc.setFillColor(15, 63, 51);
  doc.rect(0, 0, 210, 36, 'F');

  // App Title & Badge
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('EMPLOYEE TASK MANAGER', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DPDP Act 2023 - Official Personal Data Export Report (PDF)', 14, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 31);

  // Section 1: Account Identification
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ACCOUNT HOLDER IDENTIFICATION', 14, 46);

  autoTable(doc, {
    startY: 50,
    head: [['Account Record Field', 'User Information']],
    body: [
      ['Full Name', user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A'],
      ['Email Address', user?.email || 'N/A'],
      ['System Role', user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Employee'],
      ['Verification Status', user?.isVerified ? 'Verified Account' : 'Unverified Account'],
      ['Account Database ID', user?.id || user?._id || 'N/A']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 63, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9.5, cellPadding: 3 }
  });

  // Section 2: Detailed Personal Records
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PERSONAL & PROFESSIONAL PROFILE RECORDS', 14, finalY);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Profile Attribute', 'Recorded Information']],
    body: [
      ['First Name', user?.firstName || 'N/A'],
      ['Last Name', user?.lastName || 'N/A'],
      ['Country', user?.country || 'India'],
      ['Mobile Number', user?.mobileNumber ? (user.mobileNumber.startsWith('+') ? user.mobileNumber : `+91 ${user.mobileNumber}`) : 'N/A'],
      ['Gender', user?.gender || 'N/A'],
      ['Qualification', user?.qualification || 'Bachelor'],
      ['Permanent Address', user?.permanentAddress || 'N/A'],
      ['Current Address', user?.currentAddress || 'N/A'],
      ['Biography', user?.biography || 'No biography provided.']
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 63, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9.5, cellPadding: 3 }
  });

  // Compliance Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Confidential Personal Data Document generated under Section 12 (Data Portability) of the Digital Personal Data Protection Act (2023).',
    14,
    pageHeight - 10
  );

  // Save PDF File
  const fileName = `DPDP_Personal_Data_${(user?.name || 'User').replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
