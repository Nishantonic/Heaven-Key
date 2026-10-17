/* =====================================================================
   ALL SITE CONTENT LIVES HERE. Edit this file, replace the photos in
   /images/<slug>/ and you are done. The text below is demo content.
   Run `node build.js` after every change to this file.
   ===================================================================== */
window.SITE = {
  name: "Haven & Key",
  // Your live address, no trailing slash. REQUIRED before deploying so shared links show the right photo and title.
  url: "https://haven-and-key-rho.vercel.app/",   // e.g. "https://www.havenandkey.com"
  tagline: "No brokers. Buy direct from the owner.",
  accentWord: "direct",            // the word shown in gold italics in the big headline
  eyebrow: "Exceptional homes. Authentic owners.",
  heroImage: "images/hero.jpg",
  intro: "Private homes, listed and sold directly by the people who own them.",
  email: "contact@example.com",
  phone: "+33 0 00 00 00 00",
  address: "Côte d'Azur, France",
  // Small pills at the bottom of the hero
  chips: ["Côte d'Azur, France", "No commission", "Reply within one working day"],
  // Scrolling phrase strip under the hero
  marquee: ["No brokers", "Buy direct from the owner", "Private homes", "Personal viewings", "Côte d'Azur", "No commission"],
  // Big numbers under the photos. The photo count and film length are added automatically per property.
  stats: [
    { n: 0, u: "%", l: "Agent commission" },
    { n: 1, u: "day", l: "To reply to your enquiry" }
  ],
  // ENQUIRIES BY EMAIL (free, 2 minutes):
  // 1. Open https://web3forms.com, type the CLIENT's email address and press "Create Access Key".
  // 2. The key arrives in the client's inbox. Paste it below. Every enquiry is then emailed to that address.
  web3formsKey: "ce157bea-51ab-488a-a3f8-c0b22b4a79c4",
  // Optional alternative: a Formspree URL (leave "" if you use Web3Forms)
  formEndpoint: "",
  about: [
    "Haven & Key is a small collection of privately owned homes. We keep the list short so every buyer gets personal attention from the owner, from the first viewing to the final signature.",
    "There are no agents and no commission between you and the property. Send an enquiry with your questions and we will reply within one working day."
  ]
};

/* Maximum 3 properties. The FIRST one is shown in full on the home page.
   Photos: images/<slug>/1.jpg, 2.jpg ... (1.jpg is the cover). One caption per photo.
   Video (optional): "video/file.mp4", a YouTube link or a Vimeo link. Remove the line for no video.
   tour (optional): up to 4-5 steps for the scrolling "inside the home" section. photo = the number of the photo to show.
   If you remove `tour`, the feature list is used instead. */
window.PROPERTIES = [
  {
    slug: "rooftop-apartment",
    name: "Rooftop Apartment",
    place: "Location to be confirmed",
    status: "For sale",
    price: "Price on request",
    beds: "—", baths: "—", area: "—", plot: "—",
    summary: "A bright top-floor home with floor-to-ceiling windows and a large terrace with open views.",
    blurb: "A bright top-floor home with floor-to-ceiling windows and a large terrace with open views over the rooftops and hills.",
    photos: ["Living area", "Terrace", "Bedroom", "City views", "Bedroom with terrace access", "Terrace walkway"],
    // Plays automatically (muted) when the visitor reaches it. Use an mp4 in /video, or a YouTube / Vimeo link.
    video: "video/rooftop-apartment.mp4",
    videoSeconds: 41,           // optional, shown as a big number. Remove if unknown.
    detailPhoto: 3,             // photo shown beside the description
    desc: [
      "Full property description to be added. Describe the setting, the views and what makes the home special in two or three short paragraphs.",
      "Mention what is nearby: shops, beaches, transport and any local highlights."
    ],
    specs: [
      ["Property type", "—"], ["Living area", "—"], ["Terrace", "—"],
      ["Bedrooms", "—"], ["Bathrooms", "—"], ["Parking", "—"],
      ["Year built", "—"], ["Floor", "—"],
      ["Heating / cooling", "—"], ["Ownership", "—"]
    ],
    features: ["Large terrace with open views", "Floor-to-ceiling windows with terrace access", "Open-plan living and dining area", "Views over the city and hills"],
    tourTitle: "Light, glass and a terrace that goes on.",
    tour: [
      { label: "Terrace", title: "Large terrace with open views", text: "Open views over the rooftops and hills, with planters running the length of the walkway.", photo: 6 },
      { label: "Windows", title: "Floor-to-ceiling windows with terrace access", text: "A bright top-floor home. The bedroom opens straight onto the terrace.", photo: 5 },
      { label: "Living", title: "Open-plan living and dining area", text: "One generous room that looks out through the glass to the terrace.", photo: 1 },
      { label: "Views", title: "Views over the city and hills", text: "Red-tiled roofs, green hills and the sea on the horizon.", photo: 4 }
    ]
  }
];
