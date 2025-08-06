import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Utility function to export data (issues or staff) as PDF with property branding and title
export const exportToPDF = async ({ 
  title = "Issue Report", 
  data = [], 
  type = "issues",
  property = null // Pass the property object from usePropertyStore
}) => {
  const doc = new jsPDF();
  
  // Get property logo and name from the property store (same as ITDashboard)
  const propertyLogo = property?.logoUrl || null;
  const propertyName = property?.name || "IT Management Portal";

  try {
    let startY = 20; // Starting Y position for content

    // Add logo if available (same logic as ITDashboard)
    if (propertyLogo) {
      try {
        const logoData = await getImageBase64(propertyLogo);
        doc.addImage(logoData, "PNG", 10, 10, 30, 30);
        
        // Add property name next to logo
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text(propertyName, 50, 20);
        doc.setFontSize(12);
        doc.setTextColor(60);
        doc.text(title, 50, 30);
        
        startY = 45; // Start content below logo and headers
      } catch (logoError) {
        console.warn("Failed to load logo, continuing without it:", logoError);
        
        // Fallback: no logo, just text headers
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text(propertyName, 10, 20);
        doc.setFontSize(14);
        doc.setTextColor(60);
        doc.text(title, 10, 30);
        
        startY = 40;
      }
    } else {
      // No logo available, just add text headers
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(propertyName, 10, 20);
      doc.setFontSize(14);
      doc.setTextColor(60);
      doc.text(title, 10, 30);
      
      startY = 40;
    }

    // Prepare table data based on type
    let headers = [];
    let rows = [];

    if (type === "staff") {
      headers = ["Full Name", "Username", "Email", "Phone", "Role", "Department"];
      rows = data.map((staff) => [
        staff.fullName,
        staff.username,
        staff.email,
        staff.phone,
        staff.role,
        staff.department?.name || "None",
      ]);
    } else {
      headers = ["Title", "Room/Location", "Status", "Department"];
      rows = data.map((issue) => [
        issue.title,
        issue.roomNumber || issue.location || "—",
        issue.status,
        issue.department?.name || "Unassigned",
      ]);
    }

    // Generate table
    autoTable(doc, {
      startY: startY,
      head: [headers],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [34, 139, 34], // Green color similar to ITDashboard
        textColor: 255,
      },
    });

    // Save PDF with clean filename
    const cleanTitle = title.toLowerCase().replace(/\s+/g, "-");
    doc.save(`${cleanTitle}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF.");
  }
};

// Helper: convert image URL to base64 (same as before but with better error handling)
const getImageBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      } catch (canvasError) {
        reject(canvasError);
      }
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${url}`));
    };
  });
};