// Sample data for AI responses

// Sports data
const sportsMatches = [
  { team1: "Man Utd", team2: "Arsenal", score: "2-1", status: "in progress" },
  {
    team1: "Liverpool",
    team2: "Man City",
    score: "0-0",
    status: "in progress",
  },
  { team1: "Chelsea", team2: "Tottenham", score: "1-0", status: "in progress" },
  {
    team1: "PSG ",
    team2: "Barca",
    score: "2-0",
    status: "in progress",
  },
];

// Kenyan slang and cultural references
const kenyanSlang = [
  "Sawa sawa, let me sort you out!",
  "Mambo vipi? Ready for some recommendations?",
  "Hii ni moto sana! This drink is fire!",
  "Usipanic, I've got the perfect drink for you!",
  "Leo sisi ndio ma prezo wa drinks! Today we're the presidents of drinks!",
  "Hii weekend itakuwa lit! This weekend will be lit!",
  "Wacha nikupee the best drinks in town!",
  "Hii ni kama sherehe ya Statehouse! Is vipi?",
  "Drink ikiisha wewe itisha! If your drink is finished, just order more!",
  "Ruto is out of the country, leo sisi ndio ma prezo!",
];

// Political references
const politicalJokes = [
  "Like our politicians promise development, I promise you'll love this drink!",
  "This whiskey is smoother than a politician's campaign speech!",
  "This drink has more kick than a parliamentary debate!",
  "Like the government collects taxes, this drink collects compliments!",
  "This cocktail has more flavor combinations than a coalition government!",
];

// Random responses for general conversation
export const getRandomResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();

  // Check for greetings
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey") ||
    lowerMessage.includes("mambo") ||
    lowerMessage.includes("sasa")
  ) {
    return "Mambo! How can I help you today? Need drink recommendations, event planning, or just want to chat about ⚽⚽ and weekend vibes?";
  }

  // Check for affirmative responses
  if (
    lowerMessage === "yes" ||
    lowerMessage === "yeah" ||
    lowerMessage === "sure" ||
    lowerMessage === "ok" ||
    lowerMessage === "okay" ||
    lowerMessage === "sawa"
  ) {
    return "Great! What specifically are you interested in? We have premium whiskeys, local beers, and some amazing cocktails. Or are you planning an event?";
  }

  // Check for music requests
  if (
    lowerMessage.includes("music") ||
    lowerMessage.includes("song") ||
    lowerMessage.includes("ngoma") ||
    lowerMessage.includes("dj")
  ) {
    return "Ah, you want to request some music! Our DJ is taking requests for tonight. What would you like to hear? We're playing a mix of Gengetone, Afrobeats, and international hits.";
  }

  // Check for specific keywords
  if (lowerMessage.includes("whiskey") || lowerMessage.includes("whisky")) {
    return "We have several premium whiskeys in stock! Our most popular are Jameson (KSh 2,500), Jack Daniel's (KSh 3,200), and Johnnie Walker Black (KSh 3,500). Would you like me to recommend one based on your taste preferences?";
  }

  if (lowerMessage.includes("beer") || lowerMessage.includes("tusker")) {
    return "Ah, a beer person! We have Tusker, Tusker Malt, Heineken, and White Cap in stock. Tusker is going for KSh 250 per bottle. How many would you like? Baridi sana! (Very cold!)";
  }

  if (
    lowerMessage.includes("football") ||
    lowerMessage.includes("game") ||
    lowerMessage.includes("match") ||
    lowerMessage.includes("score")
  ) {
    const randomMatch =
      sportsMatches[Math.floor(Math.random() * sportsMatches.length)];
    return `The ${randomMatch.team1} vs ${randomMatch.team2} game is currently ${randomMatch.score}. We're showing it on our big screens tonight. Would you like to reserve a table?`;
  }

  if (lowerMessage.includes("joke") || lowerMessage.includes("funny")) {
    return politicalJokes[Math.floor(Math.random() * politicalJokes.length)];
  }

  // Default to random Kenyan slang
  if (Math.random() < 0.3) {
    return kenyanSlang[Math.floor(Math.random() * kenyanSlang.length)];
  }

  // Generic responses
  const genericResponses = [
    "How can I help you with drinks or event planning today?",
    "Would you like some recommendations based on what's popular right now?",
    "We have some great specials this weekend. Would you like to hear about them?",
    "Is there a specific type of drink you're looking for?",
    "Are you planning an event or just looking for personal recommendations?",
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};

// Event planning responses
export const getEventResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();
  const isLargeEvent =
    lowerMessage.includes("corporate") ||
    lowerMessage.includes("wedding") ||
    lowerMessage.includes("large");
  const isBudgetFocused =
    lowerMessage.includes("budget") ||
    lowerMessage.includes("cheap") ||
    lowerMessage.includes("affordable");

  const guestCount = isLargeEvent ? 50 : 30;
  const duration = 4;
  const eventType = isLargeEvent ? "Corporate Party" : "Birthday Party";
  const discount = isBudgetFocused ? "10%" : undefined;

  const response = {
    intro: `Based on your ${eventType.toLowerCase()} needs, here's a customized drink package I've put together for you:`,
    plan: {
      eventDetails: {
        guestCount,
        duration,
        eventType,
        location: "Your Venue",
        date: "Saturday, May 4, 2025",
        discount,
      },
      recommendations: [
        {
          category: "Beer",
          items: [
            {
              name: "Tusker Lager",
              quantity: isLargeEvent ? 40 : 16,
              unit: "bottles",
              price: isLargeEvent
                ? isBudgetFocused
                  ? 12000
                  : 8000
                : isBudgetFocused
                ? 6000
                : 9800,
            },
            {
              name: isBudgetFocused ? "Balozi" : "Heineken",
              quantity: isLargeEvent ? 10 : 6,
              unit: "bottles",
              price: isBudgetFocused
                ? isLargeEvent
                  ? 5060
                  : 2080
                : isLargeEvent
                ? 8000
                : 4000,
            },
          ],
        },
        {
          category: "Spirits",
          items: [
            {
              name: "Jameson Irish Whiskey",
              quantity: isLargeEvent
                ? isBudgetFocused
                  ? 2
                  : 3
                : isBudgetFocused
                ? 1
                : 2,
              unit: "bottles",
              price: isBudgetFocused
                ? isLargeEvent
                  ? 5000
                  : 2500
                : isLargeEvent
                ? 7500
                : 5000,
            },
            {
              name: isBudgetFocused ? "Smirnoff Vodka" : "Absolut Vodka",
              quantity: isLargeEvent ? 3 : 2,
              unit: "bottles",
              price: isBudgetFocused
                ? isLargeEvent
                  ? 5400
                  : 360_0
                : isLargeEvent
                ? 6600
                : 4400,
            },
            {
              name: isBudgetFocused ? "Gilbey's Gin" : "Bombay Sapphire Gin",
              quantity: isLargeEvent ? 2 : 1,
              unit: "bottles",
              price: isBudgetFocused
                ? isLargeEvent
                  ? 360_0
                  : 1800
                : isLargeEvent
                ? 5000
                : 2500,
            },
          ],
        },
        {
          category: "Mixers & Soft Drinks",
          items: [
            {
              name: "Coca-Cola",
              quantity: isLargeEvent ? 20 : 10,
              unit: "cans",
              price: isLargeEvent ? 2400 : 1200,
            },
            {
              name: "Tonic Water",
              quantity: isLargeEvent ? 12 : 6,
              unit: "bottles",
              price: isLargeEvent ? 1800 : 900,
            },
            {
              name: "Soda Water",
              quantity: isLargeEvent ? 12 : 6,
              unit: "bottles",
              price: isLargeEvent ? 1200 : 600,
            },
          ],
        },
      ],
      totalPrice: isBudgetFocused
        ? isLargeEvent
          ? 41600
          : 23320
        : isLargeEvent
        ? 50900
        : 29600,
    },
  };

  return response;
};

// Music request handling
export const handleMusicRequest = (message: string) => {
  const lowerMessage = message.toLowerCase();

  // Popular music genres and artists in Kenya
  const gengetone = [
    "Sailors Gang",
    "Ethic Entertainment",
    "Ochungulo Family",
    "Boondocks Gang",
  ];
  const afrobeats = [
    "Diamond Platnumz",
    "Sauti Sol",
    "Otile Brown",
    "Nyashinski",
    "Burna Boy",
    "Wizkid",
  ];
  const international = [
    "Drake",
    "Beyoncé",
    "Ed Sheeran",
    "The Weeknd",
    "Rihanna",
  ];

  let response = "";

  if (
    lowerMessage.includes("gengetone") ||
    gengetone.some((artist) => lowerMessage.includes(artist.toLowerCase()))
  ) {
    const artist = gengetone[Math.floor(Math.random() * gengetone.length)];
    response = `Sawa! I've added your Gengetone request to the queue. The DJ will play some ${artist} soon. Anything else you'd like?`;
  } else if (
    lowerMessage.includes("afrobeat") ||
    afrobeats.some((artist) => lowerMessage.includes(artist.toLowerCase()))
  ) {
    const artist = afrobeats[Math.floor(Math.random() * afrobeats.length)];
    response = `Nice choice! I've added your Afrobeats request to the queue. The DJ will play some ${artist} soon. Anything else you'd like?`;
  } else if (
    international.some((artist) => lowerMessage.includes(artist.toLowerCase()))
  ) {
    const artist =
      international.find((a) => lowerMessage.includes(a.toLowerCase())) ||
      international[0];
    response = `Great taste! I've added your request for ${artist} to the queue. The DJ will play it soon. Anything else you'd like?`;
  } else {
    response =
      "I've added your music request to the queue! The DJ will try to play it soon. Is there anything specific you'd like to drink while you wait?";
  }

  return {
    intro: response,
    songRequested: true,
  };
};

// Drink recommendations
export const getRecommendationResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();

  // Handle music requests
  if (
    lowerMessage.includes("music") ||
    lowerMessage.includes("song") ||
    lowerMessage.includes("ngoma") ||
    lowerMessage.includes("dj") ||
    lowerMessage.includes("request")
  ) {
    return handleMusicRequest(message);
  }

  // Determine what kind of recommendations to provide
  const isWhiskey =
    lowerMessage.includes("whiskey") || lowerMessage.includes("whisky");
  const isGin = lowerMessage.includes("gin");
  const isBeer = lowerMessage.includes("beer");
  const isVodka = lowerMessage.includes("vodka");
  const isWine = lowerMessage.includes("wine");
  const isCocktail =
    lowerMessage.includes("cocktail") || lowerMessage.includes("mix");

  let intro =
    "Based on your preferences, here are some recommendations I think you'll enjoy:";
  let items = [];

  if (isWhiskey) {
    intro =
      "For whiskey lovers, I recommend these premium options that are popular in Nairobi right now:";
    items = [
      {
        name: "Jameson Black Barrel",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description:
          "A special blend with notes of spice, nutty notes and vanilla",
        price: "KSh 4,200",
      },
      {
        name: "Jack Daniel's Single Barrel",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Bold, full-bodied flavor with a smooth finish",
        price: "KSh 6,500",
      },
      {
        name: "Johnnie Walker Double Black",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Intense smoky character and layers of spice",
        price: "KSh 5,200",
      },
    ];
  } else if (isGin) {
    intro = "Gin is trending right now! Here are some excellent options:";
    items = [
      {
        name: "Hendrick's Gin",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Infused with rose and cucumber for a unique flavor",
        price: "KSh 3,800",
      },
      {
        name: "Bombay Sapphire",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Bright, fresh flavor with 10 exotic botanicals",
        price: "KSh 2,500",
      },
      {
        name: "Tanqueray No. Ten",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Small batch gin with fresh citrus fruits",
        price: "KSh 4,200",
      },
    ];
  } else if (isBeer) {
    intro = "For beer enthusiasts, these are flying off our shelves:";
    items = [
      {
        name: "Tusker Lager",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Kenya's favorite beer with a crisp, refreshing taste",
        price: "KSh 250",
      },
      {
        name: "Tusker Malt",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Rich, full-bodied lager with a distinctive taste",
        price: "KSh 280",
      },
      {
        name: "White Cap Lager",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Smooth, premium lager with a clean finish",
        price: "KSh 300",
      },
    ];
  } else if (isVodka) {
    intro = "These premium vodkas are perfect for your collection:";
    items = [
      {
        name: "Grey Goose",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Ultra-premium French vodka, exceptionally smooth",
        price: "KSh 4,500",
      },
      {
        name: "Absolut Elyx",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Luxury vodka with silky texture and nutty flavor",
        price: "KSh 3,800",
      },
      {
        name: "Ketel One",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Crisp, clear taste with hints of citrus and honey",
        price: "KSh 3,200",
      },
    ];
  } else if (isWine) {
    intro = "For wine lovers, I recommend these excellent selections:";
    items = [
      {
        name: "Nederburg Cabernet Sauvignon",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Full-bodied red with rich berry flavors",
        price: "KSh 1,800",
      },
      {
        name: "Four Cousins Sweet White",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Sweet, fruity white wine, perfect for celebrations",
        price: "KSh 1,200",
      },
      {
        name: "Robertson Winery Sauvignon Blanc",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Crisp white with tropical fruit notes",
        price: "KSh 1,500",
      },
    ];
  } else if (isCocktail) {
    intro = "These cocktail ingredients will help you create amazing drinks:";
    items = [
      {
        name: "Cocktail Mixer Set",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Premium mixers for classic cocktails",
        price: "KSh 2,200",
      },
      {
        name: "Angostura Bitters",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Essential for Old Fashioneds and many classics",
        price: "KSh 1,500",
      },
      {
        name: "Monin Syrup Collection",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Set of 3 premium flavored syrups",
        price: "KSh 1,800",
      },
    ];
  } else {
    // Default recommendations
    intro = "Here are some popular items our customers are loving right now:";
    items = [
      {
        name: "Jameson Irish Whiskey",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Smooth and versatile, perfect for any occasion",
        price: "KSh 2,500",
      },
      {
        name: "Hendrick's Gin",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Perfect for gin cocktails with a unique flavor",
        price: "KSh 3,800",
      },
      {
        name: "Premium Mixer Pack",
        image: "/guiness-defaultimg.webp?height=64&width=64",
        description: "Assorted mixers that pair well with our spirits",
        price: "KSh 1,200",
      },
    ];
  }

  return {
    intro,
    items,
  };
};

// Sports updates
export const getSportsUpdate = () => {
  const teams = [
    "Man Utd",
    "Arsenal",
    "Liverpool",
    "Man City",
    "Chelsea",
    "Tottenham",
    "PSG",
    "Newcastle",
    "Real Madrid",
    "Barcelona",
    // TODO: Local teams + [Tell me Your bet slip I keep you engaged!]
  ];

  // Randomly select teams
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index = Math.floor(Math.random() * teams.length);
  while (team2Index === team1Index) {
    team2Index = Math.floor(Math.random() * teams.length);
  }

  const team1 = teams[team1Index];
  const team2 = teams[team2Index];

  // Generate random score
  const score1 = Math.floor(Math.random() * 4);
  const score2 = Math.floor(Math.random() * 4);

  // Generate update content
  let content = "";
  const updateType = Math.floor(Math.random() * 5);

  switch (updateType) {
    case 0: // Goal
      content = `GOAL!!! ${team1} has just scored! It's now ${team1} ${
        score1 + 1
      }-${score2} ${team2}! The crowd is going wild! How about ordering a round to celebrate?`;
      break;
    case 1: // Match starting
      content = `The ${team1} vs ${team2} match is about to begin! We're showing it on our big screens. Come through or order your drinks now to enjoy the game!`;
      break;
    case 2: // Half time
      content = `Half time in the ${team1} vs ${team2} game. Current score: ${score1}-${score2}. Perfect time to refresh your drinks! What can I get you?`;
      break;
    case 3: // Close match
      content = `It's a tight game between ${team1} and ${team2}! Score is ${score1}-${score2} with 10 minutes to go. The tension calls for a special drink - how about our match day special?`;
      break;
    case 4: // Match ended
      content = `Full time: ${team1} ${score1}-${score2} ${team2}. ${
        score1 > score2 ? team1 : score2 > score1 ? team2 : "Both teams"
      } ${
        score1 === score2 ? "share the points" : "takes all 3 points"
      }! Time to ${
        score1 === score2
          ? "contemplate"
          : team1 === "Man Utd" || team2 === "Man Utd"
          ? "celebrate"
          : "drown your sorrows"
      }?`;
      break;
  }

  return {
    role: "assistant",
    type: "sports-update",
    match: `${team1} vs ${team2}`,
    content,
  };
};
