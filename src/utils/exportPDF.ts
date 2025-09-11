import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Application = {
  student_name: string;
  year: string;
  branch: string;
  from_station: string;
  to_station: string;
  class_type: string;
  railway_type: string;
  pass_type: string;
  concession_form_no: string;
  created_at: string;
};

export const ExportPDF = (applications: Application[]) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Datta Meghe College of Engineering', 14, 22);
  
  doc.setFontSize(16);
  doc.text('Approved Train Concession Applications', 14, 32);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);
  doc.text(`Total Applications: ${applications.length}`, 14, 48);
  
  // Prepare data for table
  const tableData = applications.map((app, index) => [
    index + 1,
    app.student_name,
    app.concession_form_no,
    `${app.year} ${app.branch}`,
    `${app.from_station} - ${app.to_station}`,
    app.class_type,
    app.railway_type,
    app.pass_type,
    new Date(app.created_at).toLocaleDateString()
  ]);
  
  // Add table
  autoTable(doc, {
    head: [[
      'S.No.',
      'Student Name',
      'Form No.',
      'Year & Branch',
      'Route',
      'Class',
      'Railway',
      'Pass Type',
      'Applied Date'
    ]],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 22 },
      4: { cellWidth: 30 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 18 },
      8: { cellWidth: 20 }
    }
  });
  
  // Save the PDF
  doc.save(`DMCE_Approved_Concessions_${new Date().toISOString().split('T')[0]}.pdf`);
};