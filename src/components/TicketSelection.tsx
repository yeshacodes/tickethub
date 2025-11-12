import { useState } from "react";
import { Calendar, MapPin, Clock, Minus, Plus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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

interface TicketSelectionProps {
  show: Show;
  onBack: () => void;
  onContinue: (tickets: number) => void;
}

export function TicketSelection({ show, onBack, onContinue }: TicketSelectionProps) {
  const [ticketCount, setTicketCount] = useState(1);

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handleIncrease = () => {
    if (ticketCount < Math.min(show.availableTickets, 10)) {
      setTicketCount(ticketCount + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back to Shows
      </Button>
      
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] overflow-hidden">
            <ImageWithFallback
              src={show.imageUrl}
              alt={show.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <CardContent className="p-6 flex flex-col justify-between">
            <div>
              <h2 className="mb-4">{show.title}</h2>
              <p className="text-gray-600 mb-6">{show.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span>{show.time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5" />
                  <span>{show.venue}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block mb-3 text-gray-700">Number of Tickets</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrease}
                    disabled={ticketCount <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-900 w-12 text-center">{ticketCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrease}
                    disabled={ticketCount >= Math.min(show.availableTickets, 10)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-500 mt-2">
                  Maximum 10 tickets per order
                </p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-baseline mb-4 pb-4 border-t pt-4">
                <span className="text-gray-700">Total</span>
                <div className="text-right">
                  <div className="text-gray-900">${show.price * ticketCount}</div>
                  <div className="text-gray-500">{ticketCount} × ${show.price}</div>
                </div>
              </div>
              
              <Button onClick={() => onContinue(ticketCount)} className="w-full">
                Continue to Checkout
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
