
/*
Lugvia Rate Calculator API (starter)
Usage:
- Install: npm install
- Run: GOOGLE_API_KEY=your_key node server.js
Endpoints:
- POST /api/calculate
  Body: { pickup: "addr or zip", dropoff: "addr or zip", distance_miles: optional number, size: "studio|1br|2br|3br", extras: { packing: bool, heavy_items: number } }
  Returns estimate breakdown and partner payout with platform fee.
- POST /api/leads
  Body: { lead: {...}, chosen_partner_id, pricing }
- POST /api/partners
  Body: { name, city, base_rate_hour, per_mile, hourly_rate_per_mover, contact }
*/

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData(){
  if(!fs.existsSync(DATA_FILE)){
    fs.writeFileSync(DATA_FILE, JSON.stringify({partners:[],leads:[]},null,2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function saveData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2)); }

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files if needed

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || null;
// Default pricing model (can be overridden per-partner)
const DEFAULT = {
  base_fee: 100,           // flat base fee
  per_mile: 2.0,           // per mile travel cost
  hourly_base: 120,        // local move per hour (2 movers + truck)
  extra_mover_per_hour: 40,
  packing_per_hour_per_person: 35,
  heavy_item_flat: 200,
  long_distance_mile_threshold: 50,
  long_distance_per_mile: 2.0, // per mile for long distance
  platform_fee_percent: 0.12  // 12% commission by default
};

// Utility: call Google Distance Matrix if API key present and distance not provided
async function getDistanceMiles(orig, dest){
  if(!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY not set and distance_miles not provided');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(orig)}&destinations=${encodeURIComponent(dest)}&key=${GOOGLE_API_KEY}`;
  const res = await axios.get(url);
  if(res.data && res.data.rows && res.data.rows[0] && res.data.rows[0].elements[0] && res.data.rows[0].elements[0].distance){
    const meters = res.data.rows[0].elements[0].distance.value;
    return meters / 1609.34;
  }
  throw new Error('Could not determine distance from Google API');
}

// Main calculate endpoint
app.post('/api/calculate', async (req, res) => {
  try{
    const body = req.body || {};
    const pickup = body.pickup;
    const dropoff = body.dropoff;
    const distance_miles = body.distance_miles;
    const size = body.size || '1br'; // studio,1br,2br,3br
    const extras = body.extras || {}; // { packing: true, heavy_items: 1 }
    const partner_id = body.partner_id || null;

    // Load partner rates if partner_id provided
    const data = loadData();
    let partnerRates = null;
    if(partner_id){
      partnerRates = data.partners.find(p=>p.id === partner_id);
    }

    const cfg = partnerRates ? {
      base_fee: partnerRates.base_fee || DEFAULT.base_fee,
      per_mile: partnerRates.per_mile || DEFAULT.per_mile,
      hourly_base: partnerRates.hourly_base || DEFAULT.hourly_base,
      extra_mover_per_hour: partnerRates.extra_mover_per_hour || DEFAULT.extra_mover_per_hour,
      packing_per_hour_per_person: partnerRates.packing_per_hour_per_person || DEFAULT.packing_per_hour_per_person,
      heavy_item_flat: partnerRates.heavy_item_flat || DEFAULT.heavy_item_flat,
      long_distance_mile_threshold: partnerRates.long_distance_mile_threshold || DEFAULT.long_distance_mile_threshold,
      long_distance_per_mile: partnerRates.long_distance_per_mile || DEFAULT.long_distance_per_mile,
      platform_fee_percent: partnerRates.platform_fee_percent || DEFAULT.platform_fee_percent
    } : DEFAULT;

    // determine distance
    let miles = null;
    if(typeof distance_miles === 'number' && !isNaN(distance_miles)){
      miles = distance_miles;
    } else if(pickup && dropoff){
      miles = await getDistanceMiles(pickup, dropoff);
    } else {
      return res.status(400).json({error:'Provide either distance_miles or pickup and dropoff addresses'});
    }

    // estimate hours by size (simple heuristic)
    const size_hours_map = { 'studio':2, '1br':3, '2br':5, '3br':7 };
    const est_hours = size_hours_map[size] || 3;

    // Pricing logic
    let base_price = cfg.base_fee;
    let travel_cost = 0;
    if(miles <= cfg.long_distance_mile_threshold){
      travel_cost = miles * cfg.per_mile;
    } else {
      travel_cost = miles * cfg.long_distance_per_mile;
    }
    let labor_cost = est_hours * cfg.hourly_base;
    // simple assumption: hourly_base already includes 2 movers; if user asks extra movers, it can be added
    // Extras
    let packing_cost = 0;
    if(extras.packing){
      const packers = extras.packers || 1;
      const pack_hours = extras.pack_hours || Math.max(1, Math.floor(est_hours/2));
      packing_cost = packers * pack_hours * cfg.packing_per_hour_per_person;
    }
    let heavy_cost = 0;
    if(extras.heavy_items && Number(extras.heavy_items) > 0){
      heavy_cost = Number(extras.heavy_items) * cfg.heavy_item_flat;
    }

    const subtotal = Math.max(0, base_price + travel_cost + labor_cost + packing_cost + heavy_cost);
    const platform_fee = subtotal * cfg.platform_fee_percent;
    const customer_price = subtotal + platform_fee;
    const partner_payout = subtotal; // how much the moving company receives (before any taxes)
    // You could choose to deduct fee from partner instead: partner_payout = subtotal * (1 - cfg.platform_fee_percent); customer_price = subtotal;

    const breakdown = {
      miles: Number(miles.toFixed(2)),
      est_hours,
      base_price: Number(base_price.toFixed(2)),
      travel_cost: Number(travel_cost.toFixed(2)),
      labor_cost: Number(labor_cost.toFixed(2)),
      packing_cost: Number(packing_cost.toFixed(2)),
      heavy_cost: Number(heavy_cost.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      platform_fee_percent: Number((cfg.platform_fee_percent*100).toFixed(2)),
      platform_fee: Number(platform_fee.toFixed(2)),
      customer_price: Number(customer_price.toFixed(2)),
      partner_payout: Number(partner_payout.toFixed(2))
    };

    res.json({ok:true, breakdown});
  }catch(err){
    console.error(err);
    res.status(500).json({error: err.message || 'server error'});
  }
});

// Partners endpoints (register/list)
app.post('/api/partners', (req,res)=>{
  const data = loadData();
  const body = req.body || {};
  const partner = {
    id: Date.now(),
    name: body.name || 'Unnamed Partner',
    city: body.city || '',
    contact: body.contact || '',
    // optional rate overrides
    base_fee: body.base_fee,
    per_mile: body.per_mile,
    hourly_base: body.hourly_base,
    extra_mover_per_hour: body.extra_mover_per_hour,
    packing_per_hour_per_person: body.packing_per_hour_per_person,
    heavy_item_flat: body.heavy_item_flat,
    long_distance_mile_threshold: body.long_distance_mile_threshold,
    long_distance_per_mile: body.long_distance_per_mile,
    platform_fee_percent: body.platform_fee_percent || DEFAULT.platform_fee_percent,
    created: new Date().toISOString()
  };
  data.partners.push(partner);
  saveData(data);
  res.json({ok:true, partner});
});

app.get('/api/partners', (req,res)=>{
  const data = loadData();
  res.json({ok:true, partners: data.partners});
});

// Store leads from frontend form
app.post('/api/leads', (req,res)=>{
  const data = loadData();
  const body = req.body || {};
  const lead = {
    id: Date.now(),
    firstName: body.firstName || '',
    lastName: body.lastName || '',
    email: body.email || '',
    phone: body.phone || '',
    preferredContact: body.preferredContact || 'phone',
    bestTime: body.bestTime || 'anytime',
    additionalInfo: body.additionalInfo || '',
    selectedService: body.selectedService || '',
    estimatedPrice: body.estimatedPrice || 0,
    serviceId: body.serviceId || '',
    // Original quote data
    pickup: body.pickup || '',
    dropoff: body.dropoff || '',
    size: body.size || '',
    extras: body.extras || {},
    status: 'new',
    created: new Date().toISOString(),
    timestamp: body.timestamp || new Date().toISOString()
  };
  data.leads.push(lead);
  saveData(data);
  res.json({ok:true, lead, message: 'Lead captured successfully'});
});

// Generate multiple service quotes for frontend
app.post('/api/quotes', async (req, res) => {
  try {
    const body = req.body || {};
    const pickup = body.pickup;
    const dropoff = body.dropoff;
    const distance_miles = body.distance_miles;
    const size = body.size || '1br';
    const extras = body.extras || {};

    // Define service types with different pricing strategies
    const serviceTypes = [
      {
        id: 'premium',
        name: 'Premium Service',
        description: 'Full-service moving with premium care',
        multiplier: 1.3,
        features: ['White-glove service', 'Premium packing materials', 'Furniture assembly', 'Insurance included']
      },
      {
        id: 'standard',
        name: 'Standard Service', 
        description: 'Professional moving service',
        multiplier: 1.0,
        features: ['Professional movers', 'Basic packing supplies', 'Furniture protection', 'Standard insurance']
      },
      {
        id: 'economy',
        name: 'Economy Service',
        description: 'Budget-friendly moving option',
        multiplier: 0.8,
        features: ['Experienced movers', 'Basic protection', 'Flexible scheduling']
      },
      {
        id: 'full-service',
        name: 'Full Service Package',
        description: 'Complete moving solution',
        multiplier: 1.5,
        features: ['Complete packing/unpacking', 'Storage options', 'Cleaning service', 'Setup assistance']
      },
      {
        id: 'express',
        name: 'Express Service',
        description: 'Fast and efficient moving',
        multiplier: 1.2,
        features: ['Priority scheduling', 'Expedited service', 'Real-time tracking', 'Dedicated team']
      }
    ];

    // Calculate base quote
    const baseQuoteReq = {
      pickup,
      dropoff,
      distance_miles,
      size,
      extras
    };

    // Get base calculation
    const baseResponse = await new Promise((resolve, reject) => {
      // Simulate internal API call
      const mockReq = { body: baseQuoteReq };
      const mockRes = {
        json: (data) => resolve(data),
        status: (code) => ({ json: (data) => reject(data) })
      };
      
      // Use existing calculate logic
      calculateQuote(mockReq, mockRes);
    });

    if (!baseResponse.ok) {
      return res.status(400).json(baseResponse);
    }

    // Generate quotes for each service type
    const quotes = serviceTypes.map(service => {
      const basePrice = baseResponse.breakdown.customer_price;
      const adjustedPrice = Math.round(basePrice * service.multiplier);
      
      // Add some randomization for realism (±5%)
      const randomFactor = 0.95 + (Math.random() * 0.1);
      const finalPrice = Math.round(adjustedPrice * randomFactor);
      
      return {
        serviceId: service.id,
        serviceName: service.name,
        description: service.description,
        price: finalPrice,
        features: service.features,
        breakdown: {
          ...baseResponse.breakdown,
          customer_price: finalPrice,
          service_type: service.name
        }
      };
    });

    res.json({
      ok: true,
      quotes,
      baseBreakdown: baseResponse.breakdown
    });

  } catch (err) {
    console.error('Quote generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quotes' });
  }
});

// Helper function to extract calculate logic
function calculateQuote(req, res) {
  // This would contain the existing calculate logic
  // For now, we'll use a simplified version
  const body = req.body || {};
  const size = body.size || '1br';
  const distance_miles = body.distance_miles || 10;
  
  const size_hours_map = { 'studio':2, '1br':3, '2br':5, '3br':7 };
  const est_hours = size_hours_map[size] || 3;
  
  const base_price = DEFAULT.base_fee;
  const travel_cost = distance_miles * DEFAULT.per_mile;
  const labor_cost = est_hours * DEFAULT.hourly_base;
  
  const subtotal = base_price + travel_cost + labor_cost;
  const platform_fee = subtotal * DEFAULT.platform_fee_percent;
  const customer_price = subtotal + platform_fee;
  
  const breakdown = {
    miles: Number(distance_miles.toFixed(2)),
    est_hours,
    base_price: Number(base_price.toFixed(2)),
    travel_cost: Number(travel_cost.toFixed(2)),
    labor_cost: Number(labor_cost.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    platform_fee: Number(platform_fee.toFixed(2)),
    customer_price: Number(customer_price.toFixed(2))
  };
  
  res.json({ok: true, breakdown});
}

app.get('/api/leads', (req,res)=>{
  const data = loadData();
  res.json({ok:true, leads: data.leads});
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, ()=> console.log('Lugvia Rate API listening on', PORT));
