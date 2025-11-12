import { Calendar, MapPin, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

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

interface ShowCardProps {
  show: Show;
  onSelectShow: (show: Show) => void;
}

export function ShowCard({ show, onSelectShow }: ShowCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] overflow-hidden">
        <ImageWithFallback
          src={show.imageUrl}
          alt={show.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="mb-2">{show.title}</h3>
        <p className="text-gray-600 mb-4">{show.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>{new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>{show.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>{show.venue}</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-gray-900">${show.price}</span>
          <span className="text-gray-500">per ticket</span>
        </div>
        <div className="mt-2">
          <span className="text-gray-600">{show.availableTickets} tickets available</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => onSelectShow(show)}
          className="w-full"
          disabled={show.availableTickets === 0}
        >
          {show.availableTickets === 0 ? "Sold Out" : "Buy Tickets"}
        </Button>
      </CardFooter>
    </Card>
  );
}
