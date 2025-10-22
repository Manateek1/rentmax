export default async function handler(req, res) {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  // Mock example data — later we’ll connect this to AI or Zillow
  const demoData = {
    "1015 Hoedel Ct, Lafayette, CA 94549": {
      beds: 5,
      baths: 5,
      sqft: 3537,
      estRent: 13500
    }
  };

  const estimate = demoData[address] || {
    beds: 3,
    baths: 2,
    sqft: 2000,
    estRent: 3500
  };

  res.status(200).json(estimate);
}
