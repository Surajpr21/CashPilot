const domainMap = {
  // Streaming (Global)
  netflix: "netflix.com",
  "prime video": "primevideo.com",
  amazon: "amazon.com",
  disney: "disneyplus.com",
  "disney+": "disneyplus.com",
  hulu: "hulu.com",
  hbo: "hbomax.com",
  "hbo max": "hbomax.com",
  apple: "apple.com",
  "apple tv": "apple.com",
  "apple tv+": "apple.com",
  peacock: "peacocktv.com",
  paramount: "paramountplus.com",
  "paramount+": "paramountplus.com",
  crunchyroll: "crunchyroll.com",

  // Indian Streaming
  hotstar: "hotstar.com",
  jiocinema: "jiocinema.com",
  sony: "sonyliv.com",
  sonyliv: "sonyliv.com",
  zee5: "zee5.com",
  voot: "voot.com",
  aha: "aha.video",
  sunnxt: "sunnxt.com",

  // Music
  spotify: "spotify.com",
  "apple music": "apple.com",
  youtube: "youtube.com",
  "youtube premium": "youtube.com",
  gaana: "gaana.com",
  wynk: "wynk.in",
  jiosaavn: "jiosaavn.com",
  tidal: "tidal.com",
  deezer: "deezer.com",

  // Cloud & Storage
  google: "google.com",
  "google one": "google.com",
  icloud: "icloud.com",
  dropbox: "dropbox.com",
  onedrive: "onedrive.live.com",
  box: "box.com",
  mega: "mega.nz",

  // SaaS / Productivity
  adobe: "adobe.com",
  figma: "figma.com",
  canva: "canva.com",
  notion: "notion.so",
  slack: "slack.com",
  zoom: "zoom.us",
  chatgpt: "openai.com",
  openai: "openai.com",
  grammarly: "grammarly.com",
  trello: "trello.com",
  asana: "asana.com",
  jira: "atlassian.com",
  github: "github.com",
  bitbucket: "bitbucket.org",
  microsoft: "microsoft.com",
  office: "microsoft.com",

  // Shopping / Delivery (India + Global)
  flipkart: "flipkart.com",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  blinkit: "blinkit.com",
  instamart: "swiggy.com",
  bigbasket: "bigbasket.com",
  dunzo: "dunzo.com",
  myntra: "myntra.com",
  meesho: "meesho.com",
  "country delight": "countrydelight.in",
  jio: "jio.com",

  // Finance / Subscriptions
  paypal: "paypal.com",
  stripe: "stripe.com",
  razorpay: "razorpay.com",
  phonepe: "phonepe.com",
  gpay: "pay.google.com",
  paytm: "paytm.com",
  zerodha: "zerodha.com",
  groww: "groww.in",
  upstox: "upstox.com",

  // News & Media
  nytimes: "nytimes.com",
  "new york times": "nytimes.com",
  medium: "medium.com",
  substack: "substack.com",
  economist: "economist.com",
  washingtonpost: "washingtonpost.com",

  // Fitness
  cult: "cult.fit",
  cultfit: "cult.fit",
  nike: "nike.com",
  peloton: "onepeloton.com",

  // Gaming
  xbox: "xbox.com",
  playstation: "playstation.com",
  steam: "steampowered.com",
  epic: "epicgames.com",
  nintendo: "nintendo.com",

  // AI Tools
  midjourney: "midjourney.com",
  claude: "anthropic.com",
  gemini: "google.com",
  copilot: "microsoft.com",

  // Misc
  linkedin: "linkedin.com",
  x: "twitter.com",
  twitter: "twitter.com",
  snapchat: "snapchat.com",
  tinder: "tinder.com",
  bumble: "bumble.com",
};

export const resolveDomain = (name) => {
  if (!name) return null;
  const key = name.toString().toLowerCase().trim();
  return domainMap[key] || null;
};

export default domainMap;
