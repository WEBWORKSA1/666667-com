/* ============================================================
   666667.com — SITE CONFIG (edit this one file to go live)
   ============================================================ */
window.SITE = {
  name: "666667",
  url: "https://666667.com",
  interestUrl: "https://web.works/contact",

  /* Google AdSense: paste your publisher id (ca-pub-XXXXXXXXXXXXXXXX).
     While empty, ad slots render as labelled placeholders and no ad script loads. */
  adsenseClient: "",
  adSlots: { header: "", inContent: "", sidebar: "", footer: "" },

  /* Google Analytics 4 measurement id (G-XXXXXXX). Optional. */
  ga4: "",

  /* Form delivery. The destination inbox is stored encoded (never in plain text).
     After the first submission, FormSubmit sends an activation email to the inbox.
     Once activated, FormSubmit shows a random alias string — paste it into
     formAlias to stop using the encoded address entirely. */
  formAlias: "",
  _k: [116,118,106,53,115,112,104,116,110,71,56,104,122,114,121,118,126,105,108,126],

  /* Donation / payment links. Leave empty to hide a button.
     Pledges submitted through the on-site form always work. */
  donate: {
    paypal: "",        // e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX
    buymeacoffee: "",  // e.g. https://buymeacoffee.com/yourname
    kofi: "",          // e.g. https://ko-fi.com/yourname
    stripe: "",        // e.g. https://donate.stripe.com/XXXX
    goal: 8888, raised: 0, currency: "USD"
  },

  /* YouTube: your channel + featured videos (IDs only). Third-party videos
     are embedded with YouTube's standard player (their owners keep all rights). */
  youtubeChannel: "https://www.youtube.com/results?search_query=chinese+lucky+numbers",
  videos: [
    { id: "pT52hREAf18", title: "Chinese Lucky Numbers", by: "Numberphile" },
    { id: "wf13M4MoHS4", title: "Chinese Lucky and Unlucky Numbers Explained", by: "Learn Chinese Now" },
    { id: "sr673iAqLZY", title: "Meanings behind Chinese numbers", by: "YouTube creator" }
  ],

  /* Monthly contest */
  contest: { title: "Luckiest Number Story — Monthly Contest", endsISO: "", prize: "US$168 prize pool + featured spot" },

  social: { youtube: "", x: "", instagram: "", tiktok: "", weibo: "", wechat: "" }
};
