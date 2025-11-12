import { CheckCircle, Calendar, MapPin, Clock, Mail, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import jsPDF from "jspdf";

interface Order {
  id: string;
  showId: string;
  showTitle: string;
  showDate: string;
  showTime: string;
  venue: string;
  tickets: number;
  subtotal: number;
  serviceTax: number;
  totalPrice: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  status: string;
}

interface ConfirmationScreenProps {
  order: Order;
  onBackToHome: () => void;
}

export function ConfirmationScreen({ order, onBackToHome }: ConfirmationScreenProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Set colors and fonts
    const primaryColor = [79, 70, 229]; // Indigo
    const textColor = [31, 41, 55]; // Gray-800
    const lightGray = [156, 163, 175]; // Gray-400
    
    // Header background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('TheaterHub', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Your Ticket Confirmation', 105, 30, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    // Confirmation badge
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74); // Green
    doc.text('ORDER CONFIRMED', 105, 50, { align: 'center' });
    
    // Order number
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.text(`Order Number: ${order.id}`, 20, 65);
    
    // Show title
    doc.setFontSize(18);
    doc.text(order.showTitle, 20, 80);
    
    // Line separator
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.line(20, 85, 190, 85);
    
    // Event details
    doc.setFontSize(11);
    let yPosition = 100;
    
    // Date
    doc.text('Date:', 20, yPosition);
    doc.text(
      new Date(order.showDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), 
      60, 
      yPosition
    );
    yPosition += 10;
    
    // Time
    doc.text('Time:', 20, yPosition);
    doc.text(order.showTime, 60, yPosition);
    yPosition += 10;
    
    // Venue
    doc.text('Venue:', 20, yPosition);
    doc.text(order.venue, 60, yPosition);
    yPosition += 15;
    
    // Line separator
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Ticket information
    doc.setFontSize(12);
    doc.text('Ticket Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text('Number of Tickets:', 20, yPosition);
    doc.text(order.tickets.toString(), 70, yPosition);
    yPosition += 8;
    
    doc.text('Subtotal:', 20, yPosition);
    doc.text(`$${order.subtotal.toFixed(2)}`, 70, yPosition);
    yPosition += 8;
    
    doc.text('Service Tax (10%):', 20, yPosition);
    doc.text(`$${order.serviceTax.toFixed(2)}`, 70, yPosition);
    yPosition += 8;
    
    doc.text('Total Paid:', 20, yPosition);
    doc.text(`$${order.totalPrice.toFixed(2)}`, 70, yPosition);
    yPosition += 15;
    
    // Line separator
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Customer information
    doc.setFontSize(12);
    doc.text('Customer Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text('Name:', 20, yPosition);
    doc.text(order.customerInfo.name, 70, yPosition);
    yPosition += 8;
    
    doc.text('Email:', 20, yPosition);
    doc.text(order.customerInfo.email, 70, yPosition);
    yPosition += 8;
    
    doc.text('Phone:', 20, yPosition);
    doc.text(order.customerInfo.phone, 70, yPosition);
    yPosition += 15;
    
    // Important notice box
    doc.setFillColor(219, 234, 254); // Light blue background
    doc.rect(20, yPosition, 170, 25, 'F');
    
    doc.setFontSize(10);
    doc.text('IMPORTANT:', 25, yPosition + 7);
    doc.setFontSize(9);
    const noticeText = `Please bring a valid ID to the venue. Your tickets will be available at the box office under the name "${order.customerInfo.name}".`;
    const splitNotice = doc.splitTextToSize(noticeText, 160);
    doc.text(splitNotice, 25, yPosition + 13);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Thank you for choosing TheaterHub!', 105, 280, { align: 'center' });
    doc.text(`Booking Date: ${new Date(order.createdAt).toLocaleString('en-US')}`, 105, 285, { align: 'center' });
    
    // Save the PDF
    doc.save(`TheaterHub-Ticket-${order.id}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">
          Your tickets have been confirmed and sent to your email.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-gray-600 mb-1">Order Number</p>
                <p className="text-gray-900">{order.id}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Confirmed
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4">Event Details</h3>
            <div className="space-y-4">
              <div>
                <h2>{order.showTitle}</h2>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="text-gray-900">
                      {new Date(order.showDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="text-gray-900">{order.showTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">Venue</p>
                    <p className="text-gray-900">{order.venue}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b">
            <h3 className="mb-4">Ticket Information</h3>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Tickets</span>
                <span className="text-gray-900">{order.tickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Tax (10%)</span>
                <span className="text-gray-900">${order.serviceTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-900">Total Paid</span>
                <span className="text-gray-900">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-600">Email confirmation sent to</p>
                  <p className="text-gray-900">{order.customerInfo.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">
              <strong>Important:</strong> Please bring a valid ID and this confirmation to the venue. 
              Your tickets will also be available at the box office under the name "{order.customerInfo.name}".
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download Tickets
        </Button>
        <Button onClick={onBackToHome} className="flex-1">
          Browse More Shows
        </Button>
      </div>
    </div>
  );
}