import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface WeddingPlannerData {
  couple_names: string;
  wedding_date: string;
  venue_name: string;
  guests_count: number;
  tables_count: number;
  room_decorations?: string;
  entertainment?: { name: string; time?: string }[];
  schedule?: { time: string; event: string }[];
  food_options?: { item: string; quantity: number }[];
  kids_meals?: string;
  welcome_drinks?: string;
  color_theme: string;
  font_style: string;
  logo_url?: string;
}

export const generateWeddingPlannerPDF = async (data: WeddingPlannerData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Color themes
  const themes: Record<string, string> = {
    blush: '#F8B4B4',
    ivory: '#FFFFF0',
    navy: '#1E3A8A',
    sage: '#9CA986',
  };

  const themeColor = themes[data.color_theme] || '#F8B4B4';

  // Font styles
  const fonts: Record<string, string> = {
    romantic: 'times',
    modern: 'helvetica',
    classic: 'courier',
  };

  const selectedFont = fonts[data.font_style] || 'times';

  // Header
  pdf.setFont(selectedFont, 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Celebrating the wedding of', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(28);
  pdf.text(data.couple_names, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  pdf.setFontSize(14);
  pdf.text(new Date(data.wedding_date).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }), pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Setup Details Section
  pdf.setFont(selectedFont, 'bold');
  pdf.setFontSize(16);
  pdf.text('Setup Details', 20, yPosition);
  yPosition += 8;

  pdf.setFont(selectedFont, 'normal');
  pdf.setFontSize(11);
  pdf.text(`Venue: ${data.venue_name}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Guests: ${data.guests_count}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Tables: ${data.tables_count}`, 20, yPosition);
  yPosition += 6;

  if (data.room_decorations) {
    pdf.text('Room Decorations:', 20, yPosition);
    yPosition += 6;
    const decorLines = pdf.splitTextToSize(data.room_decorations, pageWidth - 40);
    pdf.text(decorLines, 25, yPosition);
    yPosition += decorLines.length * 6;
  }

  if (data.entertainment && data.entertainment.length > 0) {
    yPosition += 5;
    pdf.setFont(selectedFont, 'bold');
    pdf.text('Entertainment:', 20, yPosition);
    yPosition += 6;
    pdf.setFont(selectedFont, 'normal');
    data.entertainment.forEach((item) => {
      pdf.text(`• ${item.name}${item.time ? ` (${item.time})` : ''}`, 25, yPosition);
      yPosition += 6;
    });
  }

  // Schedule Section
  if (data.schedule && data.schedule.length > 0) {
    yPosition += 10;
    pdf.setFont(selectedFont, 'bold');
    pdf.setFontSize(16);
    pdf.text('Schedule', 20, yPosition);
    yPosition += 8;

    pdf.setFont(selectedFont, 'normal');
    pdf.setFontSize(11);
    data.schedule.forEach((item) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(`${item.time}`, 20, yPosition);
      pdf.text(`${item.event}`, 50, yPosition);
      yPosition += 7;
    });
  }

  // Food & Drinks Section
  yPosition += 10;
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFont(selectedFont, 'bold');
  pdf.setFontSize(16);
  pdf.text('Food & Drinks', 20, yPosition);
  yPosition += 8;

  if (data.food_options && data.food_options.length > 0) {
    pdf.setFont(selectedFont, 'normal');
    pdf.setFontSize(11);
    data.food_options.forEach((item) => {
      pdf.text(`• ${item.item} (${item.quantity})`, 25, yPosition);
      yPosition += 6;
    });
  }

  if (data.kids_meals) {
    yPosition += 3;
    pdf.text(`Kids Meals: ${data.kids_meals}`, 20, yPosition);
    yPosition += 6;
  }

  if (data.welcome_drinks) {
    pdf.text(`Welcome Drinks: ${data.welcome_drinks}`, 20, yPosition);
    yPosition += 6;
  }

  // Footer with venue name
  pdf.setFont(selectedFont, 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(data.venue_name, pageWidth / 2, pageHeight - 10, { align: 'center' });

  return pdf;
};

export const downloadWeddingPlannerPDF = async (data: WeddingPlannerData, filename?: string) => {
  const pdf = await generateWeddingPlannerPDF(data);
  pdf.save(filename || `wedding-planner-${data.couple_names.replace(/\s+/g, '-').toLowerCase()}.pdf`);
};
