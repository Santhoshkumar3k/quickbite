// QuickBite Restaurant Reviews Service

const DEFAULT_REVIEWS = {
  // 1: Mudde Mane & Naati Oota
  1: [
    { id: 'rev_1_1', userName: 'Ananya Deshmukh', rating: 5, date: 'Yesterday', comment: 'Authentic Karnataka feast! The Ragi Mudde was piping hot and soft, and the Bassaru had just the right punch of dill leaves and spices.', verified: true },
    { id: 'rev_1_2', userName: 'Karthik Gowda', rating: 5, date: '3 days ago', comment: 'Best naati style food in Bangalore! Country chicken saaru was packed with flavour. Packaging was completely leak-proof.', verified: true },
    { id: 'rev_1_3', userName: 'Deepak Rao', rating: 4.5, date: '1 week ago', comment: 'Super healthy and filling meal. Pure desi ghee aroma on the mudde was heavenly. Will definitely reorder.', verified: true },
    { id: 'rev_1_4', userName: 'Sneha Murthy', rating: 5, date: '2 weeks ago', comment: 'Loved the soppina palya and roasted papad combo. Truly authentic taste that reminded me of home cooking!', verified: true },
    { id: 'rev_1_5', userName: 'Vikram Joshi', rating: 4, date: '3 weeks ago', comment: 'Very fast delivery and portions were generous. Highly recommend their special ragi combo.', verified: true },
  ],
  // 2: Truffles
  2: [
    { id: 'rev_2_1', userName: 'Rohan Mehta', rating: 5, date: '2 days ago', comment: 'Truffles never disappoints! All American Burger was juicy, perfectly seasoned, and fries stayed crisp.', verified: true },
    { id: 'rev_2_2', userName: 'Pooja Hegde', rating: 5, date: '5 days ago', comment: 'Ferrero Rocher shake is pure bliss. Thick, chocolatey, and delivered ice-cold.', verified: true },
    { id: 'rev_2_3', userName: 'Akash Nair', rating: 4.5, date: '1 week ago', comment: 'Peri Peri chicken burger with extra cheese slice is legendary. Great value for money.', verified: true },
    { id: 'rev_2_4', userName: 'Divya S.', rating: 5, date: '2 weeks ago', comment: 'Quick delivery to Koramangala. Packaging kept the burgers hot and fresh.', verified: true },
    { id: 'rev_2_5', userName: 'Tanmay Roy', rating: 4.5, date: '3 weeks ago', comment: 'One of the best burger joints in Bangalore for over a decade. Top tier quality every time.', verified: true },
  ],
  // 3: MTR - Mavalli Tiffin Room
  3: [
    { id: 'rev_3_1', userName: 'Suresh Kumar', rating: 5, date: 'Yesterday', comment: 'Gold standard of South Indian breakfast. Masala Dosa roasted in pure ghee and filter coffee was perfection.', verified: true },
    { id: 'rev_3_2', userName: 'Meera Venkat', rating: 5, date: '4 days ago', comment: 'The Rava Idli with potato saagu and fresh coconut chutney took me straight to Lalbagh heritage!', verified: true },
    { id: 'rev_3_3', userName: 'Naveen Swamy', rating: 4.5, date: '1 week ago', comment: 'Timeless taste. Chutneys were fresh and spicy. Safe and neat packaging.', verified: true },
    { id: 'rev_3_4', userName: 'Pratibha R.', rating: 5, date: '2 weeks ago', comment: 'Crispy vadas and piping hot sambar. MTR consistency is unbeatable.', verified: true },
    { id: 'rev_3_5', userName: 'Raghavan B.', rating: 5, date: '3 weeks ago', comment: 'Best filter coffee delivery in Indiranagar. Arrived hot in thermal flask cup.', verified: true },
  ],
  // 4: Meghana Foods
  4: [
    { id: 'rev_4_1', userName: 'Harish Reddy', rating: 5, date: 'Yesterday', comment: 'The Meghana Special Biryani is unmatched! Spicy, aromatic, and loaded with boneless chicken pieces.', verified: true },
    { id: 'rev_4_2', userName: 'Swati Kulkarni', rating: 4.5, date: '3 days ago', comment: 'Spicy Andhra style Biryani. The salan and raita balanced the fiery spice perfectly.', verified: true },
    { id: 'rev_4_3', userName: 'Vikas Sharma', rating: 5, date: '6 days ago', comment: 'Chicken 65 starter was crunchy and succulent. Always my first choice for weekend cravings.', verified: true },
    { id: 'rev_4_4', userName: 'Lakshmi Narayan', rating: 4, date: '1 week ago', comment: 'Huge portion size! One biryani easily serves two hungry people.', verified: true },
    { id: 'rev_4_5', userName: 'Arjun Prasad', rating: 5, date: '2 weeks ago', comment: 'Consistently delicious. Delivered within 25 minutes hot and fresh.', verified: true },
  ],
  // 5: Vidyarthi Bhavan
  5: [
    { id: 'rev_5_1', userName: 'Chandan Gowda', rating: 5, date: '2 days ago', comment: 'Thick, crispy golden brown Masala Dosa with generous dollop of butter. Classic Gandhi Bazaar taste!', verified: true },
    { id: 'rev_5_2', userName: 'Nandini Rao', rating: 5, date: '5 days ago', comment: 'The iconic green chutney is so addictive. Hot kesari bath was the sweet ending we needed.', verified: true },
    { id: 'rev_5_3', userName: 'Girish K.', rating: 4.5, date: '1 week ago', comment: 'Super nostalgic breakfast. Great to enjoy VB dosas right at home.', verified: true },
    { id: 'rev_5_4', userName: 'Aarti Menon', rating: 5, date: '2 weeks ago', comment: 'Khara Bath and Filter Kaapi was outstanding. 10/10 heritage experience.', verified: true },
    { id: 'rev_5_5', userName: 'Santosh Kumar', rating: 4, date: '3 weeks ago', comment: 'Packed really well with foil lining so the dosas retained their crisp edges.', verified: true },
  ],
  // 6: Corner House Ice Creams
  6: [
    { id: 'rev_6_1', userName: 'Aishwarya Roy', rating: 5, date: 'Yesterday', comment: 'DBC (Death By Chocolate) is an emotional feeling in Bangalore! Warm cake, vanilla scoops, chocolate fudge sauce.', verified: true },
    { id: 'rev_6_2', userName: 'Varun Nair', rating: 5, date: '3 days ago', comment: 'Hot Chocolate Fudge with roasted peanuts was heaven. Packaging with dry ice kept it rock solid.', verified: true },
    { id: 'rev_6_3', userName: 'Shalini P.', rating: 5, date: '1 week ago', comment: 'Best sundaes in town without question. Generous nuts and thick fudge sauce.', verified: true },
    { id: 'rev_6_4', userName: 'Kiran Dev', rating: 4.5, date: '2 weeks ago', comment: 'Trilogy sundae was delicious. Corner House quality remains legendary.', verified: true },
    { id: 'rev_6_5', userName: 'Radhika S.', rating: 5, date: '3 weeks ago', comment: 'Ordered for midnight party cravings, arrived super fast and completely frozen.', verified: true },
  ],
};

// Generic generator for any restaurant not explicitly hardcoded above
function generateDefaultReviews(restaurant) {
  const name = restaurant?.name || 'this restaurant';
  const cuisine = restaurant?.cuisine || 'food';
  return [
    {
      id: `gen_${restaurant?.id || 1}_1`,
      userName: 'Rahul Subramanian',
      rating: 5,
      date: '2 days ago',
      comment: `Exceptional taste and preparation! Ordered signature ${cuisine} dishes from ${name} and everything was bursting with flavour.`,
      verified: true,
    },
    {
      id: `gen_${restaurant?.id || 1}_2`,
      userName: 'Priya Nambiar',
      rating: 5,
      date: '4 days ago',
      comment: `Hot and fresh delivery! Packaging was neat, portion sizes were great, and the spice level was spot on.`,
      verified: true,
    },
    {
      id: `gen_${restaurant?.id || 1}_3`,
      userName: 'Aditya Sen',
      rating: 4.5,
      date: '1 week ago',
      comment: `Very reliable restaurant on QuickBite. High hygiene standards and delicious quality every single time.`,
      verified: true,
    },
    {
      id: `gen_${restaurant?.id || 1}_4`,
      userName: 'Monika K.',
      rating: 5,
      date: '2 weeks ago',
      comment: `Ordered for family dinner and everyone loved it. The ingredients felt very fresh and authentic.`,
      verified: true,
    },
    {
      id: `gen_${restaurant?.id || 1}_5`,
      userName: 'Nitin Bharadwaj',
      rating: 4,
      date: '3 weeks ago',
      comment: `Fast preparation and prompt rider delivery. Will definitely be ordering from ${name} again soon.`,
      verified: true,
    },
  ];
}

const STORAGE_KEY = 'quickbite_restaurant_reviews';
const ORDER_REVIEWS_KEY = 'quickbite_order_reviews';

/**
 * Retrieve all reviews for a specific restaurant (combines default + user reviews)
 */
export function getRestaurantReviews(restaurant) {
  if (!restaurant) return [];
  const restId = restaurant.id;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allReviews = stored ? JSON.parse(stored) : {};

    if (allReviews[restId] && allReviews[restId].length > 0) {
      return allReviews[restId];
    }

    // Initialize defaults
    const defaults = DEFAULT_REVIEWS[restId] || generateDefaultReviews(restaurant);
    allReviews[restId] = defaults;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
    return defaults;
  } catch (e) {
    return DEFAULT_REVIEWS[restId] || generateDefaultReviews(restaurant);
  }
}

/**
 * Add a new user review to a restaurant
 */
export function addRestaurantReview(restaurantId, reviewData) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allReviews = stored ? JSON.parse(stored) : {};

    const currentList = allReviews[restaurantId] || DEFAULT_REVIEWS[restaurantId] || [];

    const newReview = {
      id: 'usr_rev_' + Date.now(),
      restaurantId,
      userName: reviewData.userName || 'Verified Foodie',
      rating: Number(reviewData.rating) || 5,
      date: 'Just now',
      comment: reviewData.comment || 'Delicious food! Loved the order.',
      verified: true,
      isUserReview: true,
      orderNumber: reviewData.orderNumber,
    };

    // Prepend user review to the top of the list
    allReviews[restaurantId] = [newReview, ...currentList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));

    // Notify active listeners
    window.dispatchEvent(new CustomEvent('quickbite_reviews_updated', { detail: { restaurantId } }));
    return newReview;
  } catch (e) {
    console.error('Failed to save review:', e);
    return null;
  }
}

/**
 * Get review saved for a specific order (if any)
 */
export function getOrderReview(orderId) {
  try {
    const stored = localStorage.getItem(ORDER_REVIEWS_KEY);
    const map = stored ? JSON.parse(stored) : {};
    return map[orderId] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save review linked to an order
 */
export function saveOrderReview(orderId, reviewData) {
  try {
    const stored = localStorage.getItem(ORDER_REVIEWS_KEY);
    const map = stored ? JSON.parse(stored) : {};
    map[orderId] = reviewData;
    localStorage.setItem(ORDER_REVIEWS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to map order review:', e);
  }
}
