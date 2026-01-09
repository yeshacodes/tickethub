import { useState, useEffect } from "react";
import { ShowCard } from "./components/ShowCard";
import { TicketSelection } from "./components/TicketSelection";
import { CheckoutForm, CustomerInfo } from "./components/CheckoutForm";
import { ConfirmationScreen } from "./components/ConfirmationScreen";
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Loader2 } from "lucide-react";

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
  customerInfo: CustomerInfo;
  createdAt: string;
  status: string;
}

type Screen = "shows" | "tickets" | "checkout" | "confirmation";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("shows");
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-458470b3`;

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize shows data
      await fetch(`${baseUrl}/init-shows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      // Fetch shows
      const response = await fetch(`${baseUrl}/shows`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch shows: ${response.statusText}`);
      }

      const data = await response.json();
      setShows(data.shows || []);
    } catch (err) {
      console.error("Error initializing app:", err);
      setError(err instanceof Error ? err.message : "Failed to load shows");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    setCurrentScreen("tickets");
  };

  const handleContinueToCheckout = (tickets: number) => {
    setTicketCount(tickets);
    setCurrentScreen("checkout");
  };

  const handleBackToShows = () => {
    setCurrentScreen("shows");
    setSelectedShow(null);
  };

  const handleBackToTickets = () => {
    setCurrentScreen("tickets");
  };

  const handleSubmitOrder = async (customerInfo: CustomerInfo) => {
    if (!selectedShow) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(`${baseUrl}/make-server-458470b3/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          showId: selectedShow.id,
          tickets: ticketCount,
          customerInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Order failed: ${response.statusText}`);
      }

      const data = await response.json();
      setOrder(data.order);
      setCurrentScreen("confirmation");

      // Refresh shows to update availability
      const showsResponse = await fetch(`${baseUrl}/shows`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const showsData = await showsResponse.json();
      setShows(showsData.shows || []);
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err instanceof Error ? err.message : "Failed to complete order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen("shows");
    setSelectedShow(null);
    setOrder(null);
    setTicketCount(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading shows...</p>
        </div>
      </div>
    );
  }

  if (error && currentScreen === "shows") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={initializeApp}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-gray-900">TheaterHub</h1>
            <p className="text-gray-600">Book your favorite shows</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentScreen === "shows" && (
          <>
            <div className="mb-8">
              <h2 className="mb-2">Upcoming Shows</h2>
              <p className="text-gray-600">Select a show to purchase tickets</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} onSelectShow={handleSelectShow} />
              ))}
            </div>
          </>
        )}

        {currentScreen === "tickets" && selectedShow && (
          <TicketSelection
            show={selectedShow}
            onBack={handleBackToShows}
            onContinue={handleContinueToCheckout}
          />
        )}

        {currentScreen === "checkout" && selectedShow && (
          <>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            <CheckoutForm
              show={selectedShow}
              tickets={ticketCount}
              onBack={handleBackToTickets}
              onSubmit={handleSubmitOrder}
              isProcessing={isProcessing}
            />
          </>
        )}

        {currentScreen === "confirmation" && order && (
          <ConfirmationScreen order={order} onBackToHome={handleBackToHome} />
        )}
      </main>
    </div>
  );
}