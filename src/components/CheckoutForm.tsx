import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Show {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
}

interface CheckoutFormProps {
  show: Show;
  tickets: number;
  onBack: () => void;
  onSubmit: (customerInfo: CustomerInfo) => void;
  isProcessing: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export function CheckoutForm({ show, tickets, onBack, onSubmit, isProcessing }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const SERVICE_TAX_RATE = 0.10; // 10% service tax
  const subtotal = show.price * tickets;
  const serviceTax = subtotal * SERVICE_TAX_RATE;
  const totalPrice = subtotal + serviceTax;

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back
      </Button>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <h2>Order Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">{show.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="text-gray-900">{new Date(show.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {show.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Venue</span>
                <span className="text-gray-900">{show.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tickets</span>
                <span className="text-gray-900">{tickets} × ${show.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Tax (10%)</span>
                <span className="text-gray-900">${serviceTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2>Contact Information</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                  placeholder="john.doe@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  required
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Complete Purchase - $${totalPrice.toFixed(2)}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}