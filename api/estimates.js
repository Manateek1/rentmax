// /api/estimates.js
export default async function handler(req, res) {
  try {
    const { address = "" } = req.query;
    const a = String(address).toLowerCase();

    let subject = { sqft: 2000, beds: 3, baths: 2 };
    let estRent = 3200;

    if (a.includes("lafayette") || a.includes("94549")) {
      subject = { sqft: 3500, beds: 5, baths: 5 };
      estRent = 13250;
    } else if (a.includes("walnut creek") || a.includes("94596") || a.includes("94597")) {
      subject = { sqft: 2800, beds: 4, baths: 3 };
      estRent = 6200;
    } else if (a.includes("oakland") || a.includes("946")) {
      subject = { sqft: 2200, beds: 3, baths: 2 };
      estRent = 4200;
    }

    const comps = [
      { rent: Math.round(estRent * 0.97), beds: subject.beds, baths: subject.baths, sqft: Math.round(subject.sqft * 0.97), distance: 0.6 },
      { rent: Math.round(estRent * 1.02), beds: subject.beds, baths: subject.baths, sqft: Math.round(subject.sqft * 1.01), distance: 0.8 },
      { rent: Math.round(estRent * 1.01), beds: subject.beds - 1, baths: subject.baths - 1, sqft: Math.round(subject.sqft * 0.95), distance: 1.2 },
    ];

    res.status(200).json({ sqft: subject.sqft, beds: subject.beds, baths: subject.baths, estRent, comps });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch estimate" });
  }
}
