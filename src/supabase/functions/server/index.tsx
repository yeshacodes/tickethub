import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { Resend } from "npm:resend";

const app = new Hono();
const resendApiKey = Deno.env.get('RESEND_API_KEY');
console.log('=== SERVER STARTING ===');
console.log('Resend API Key present:', resendApiKey ? 'YES' : 'NO');
console.log('Resend API Key length:', resendApiKey?.length || 0);
const resend = new Resend(resendApiKey);

// Configure the sender email - change this after verifying your domain
// After domain verification, change to: 'TheaterHub <noreply@yourdomain.com>'
const SENDER_EMAIL = 'TheaterHub <onboarding@resend.dev>';

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-458470b3/health", (c) => {
  return c.json({ status: "ok" });
});

// Test email endpoint
app.post("/make-server-458470b3/test-email", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    console.log('=== TEST EMAIL REQUEST ===');
    console.log('Sending test email to:', email);
    
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [email],
      subject: 'Test Email from TheaterHub',
      html: '<h1>Test Email</h1><p>If you received this, email is working!</p>',
    });
    
    console.log('Test email result:', JSON.stringify(result));
    
    return c.json({ success: true, result });
  } catch (error) {
    console.error('Test email error:', error);
    return c.json({ 
      success: false, 
      error: String(error),
      errorDetails: JSON.stringify(error, null, 2)
    }, 500);
  }
});

// Initialize sample shows data
app.post("/make-server-458470b3/init-shows", async (c) => {
  try {
    const shows = [
      {
        id: "show-1",
        title: "The Phantom of the Opera",
        description: "The timeless story of the Phantom and Christine",
        date: "2025-12-15",
        time: "19:30",
        venue: "Grand Theater",
        price: 85,
        availableTickets: 150,
        imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800"
      },
      {
        id: "show-2",
        title: "Hamilton",
        description: "The revolutionary story of America's founding father",
        date: "2025-12-20",
        time: "20:00",
        venue: "Broadway Theater",
        price: 120,
        availableTickets: 200,
        imageUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800"
      },
      {
        id: "show-3",
        title: "Les Misérables",
        description: "An epic tale of broken dreams, passion and redemption",
        date: "2025-12-22",
        time: "19:00",
        venue: "Royal Opera House",
        price: 95,
        availableTickets: 180,
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800"
      },
      {
        id: "show-4",
        title: "Wicked",
        description: "The untold story of the Witches of Oz",
        date: "2025-12-25",
        time: "18:00",
        venue: "Apollo Theater",
        price: 110,
        availableTickets: 220,
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800"
      },
      {
        id: "show-5",
        title: "Harry Potter and the Cursed Child",
        description: "The eighth story. Nineteen years later. Experience the magic on stage.",
        date: "2025-12-28",
        time: "19:30",
        venue: "Palace Theatre",
        price: 135,
        availableTickets: 240,
        imageUrl: "https://images.unsplash.com/photo-1633856364580-97698963b68b?w=800"
      }
    ];

    for (const show of shows) {
      await kv.set(`show:${show.id}`, show);
    }

    return c.json({ success: true, message: "Shows initialized" });
  } catch (error) {
    console.log(`Error initializing shows: ${error}`);
    return c.json({ error: "Failed to initialize shows", details: String(error) }, 500);
  }
});

// Get all shows
app.get("/make-server-458470b3/shows", async (c) => {
  try {
    const shows = await kv.getByPrefix("show:");
    return c.json({ shows: shows || [] });
  } catch (error) {
    console.log(`Error fetching shows: ${error}`);
    return c.json({ error: "Failed to fetch shows", details: String(error) }, 500);
  }
});

// Get single show
app.get("/make-server-458470b3/shows/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const show = await kv.get(`show:${id}`);
    
    if (!show) {
      return c.json({ error: "Show not found" }, 404);
    }
    
    return c.json({ show });
  } catch (error) {
    console.log(`Error fetching show: ${error}`);
    return c.json({ error: "Failed to fetch show", details: String(error) }, 500);
  }
});

// Create order and send confirmation email
app.post("/make-server-458470b3/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { showId, tickets, customerInfo } = body;

    // Get show details
    const show = await kv.get(`show:${showId}`);
    if (!show) {
      return c.json({ error: "Show not found" }, 404);
    }

    // Check ticket availability
    if (show.availableTickets < tickets) {
      return c.json({ error: "Not enough tickets available" }, 400);
    }

    // Calculate prices with service tax
    const SERVICE_TAX_RATE = 0.10; // 10% service tax
    const subtotal = show.price * tickets;
    const serviceTax = subtotal * SERVICE_TAX_RATE;
    const totalPrice = subtotal + serviceTax;

    // Create order with numeric-only ID
    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const order = {
      id: orderId,
      showId,
      showTitle: show.title,
      showDate: show.date,
      showTime: show.time,
      venue: show.venue,
      tickets,
      subtotal: Math.round(subtotal * 100) / 100,
      serviceTax: Math.round(serviceTax * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      customerInfo,
      createdAt: new Date().toISOString(),
      status: "confirmed"
    };

    // Save order
    await kv.set(`order:${orderId}`, order);

    // Update show availability
    show.availableTickets -= tickets;
    await kv.set(`show:${showId}`, show);

    // Send email confirmation
    console.log('=== SENDING ORDER CONFIRMATION EMAIL ===');
    console.log('Customer email:', customerInfo.email);
    console.log('Order ID:', orderId);
    
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
            .ticket-details { background-color: white; padding: 20px; margin-top: 20px; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total { font-size: 18px; font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎭 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Thank you for your purchase, ${customerInfo.name}!</h2>
              <p>Your tickets have been confirmed. Here are your booking details:</p>
              
              <div class="ticket-details">
                <h3>${show.title}</h3>
                <div class="detail-row">
                  <span>Order Number:</span>
                  <strong>${orderId}</strong>
                </div>
                <div class="detail-row">
                  <span>Date:</span>
                  <strong>${new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
                <div class="detail-row">
                  <span>Time:</span>
                  <strong>${show.time}</strong>
                </div>
                <div class="detail-row">
                  <span>Venue:</span>
                  <strong>${show.venue}</strong>
                </div>
                <div class="detail-row">
                  <span>Number of Tickets:</span>
                  <strong>${tickets}</strong>
                </div>
                <div class="detail-row">
                  <span>Subtotal:</span>
                  <strong>$${order.subtotal}</strong>
                </div>
                <div class="detail-row">
                  <span>Service Tax (10%):</span>
                  <strong>$${order.serviceTax}</strong>
                </div>
                <div class="detail-row total">
                  <span>Total Paid:</span>
                  <strong>$${order.totalPrice}</strong>
                </div>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6;">
                <strong>Important:</strong> Please bring a valid ID to the venue. Your tickets will be available at the box office under the name "${customerInfo.name}".
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing TheaterHub!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log('About to call resend.emails.send...');
      
      const emailResult = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [customerInfo.email],
        subject: `Booking Confirmation - ${show.title}`,
        html: emailHtml,
      });

      console.log('✅ Email sent successfully!');
      console.log('Email result:', JSON.stringify(emailResult, null, 2));
    } catch (emailError) {
      console.error('❌ ERROR SENDING EMAIL:');
      console.error('Error type:', typeof emailError);
      console.error('Error message:', emailError);
      console.error('Error stack:', emailError instanceof Error ? emailError.stack : 'No stack');
      console.error('Full error object:', JSON.stringify(emailError, null, 2));
      // Don't fail the order if email fails, just log it
    }
    
    console.log('=== EMAIL SECTION COMPLETED ===');

    return c.json({ 
      success: true, 
      order,
      message: "Order created successfully. Confirmation email sent."
    });
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: "Failed to create order", details: String(error) }, 500);
  }
});

// Get order by ID
app.get("/make-server-458470b3/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error fetching order: ${error}`);
    return c.json({ error: "Failed to fetch order", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);