import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CategoryFilter from './components/CategoryFilter';
import RestaurantCard from './components/RestaurantCard';
import MenuModal from './components/MenuModal';
import ModifierModal from './components/ModifierModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import OrderHistory from './components/OrderHistory';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import AddressAlertModal from './components/AddressAlertModal';
import AddressSavedModal from './components/AddressSavedModal';
import RestaurantConflictModal from './components/RestaurantConflictModal';
import OfferCarousel from './components/OfferCarousel';
import {
  fetchRestaurants,
  fetchRestaurant,
  fetchCategories,
  createOrder,
  fetchOrders,
  fetchOrder,
  advanceOrderStatus,
  fetchHealth,
  fetchUser
} from './services/api';
import { socketService } from './services/socketService';

export default function App() {
  // User Onboarding Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('quickbite_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    try {
      return !localStorage.getItem('quickbite_user');
    } catch (e) {
      return true;
    }
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressAlertOpen, setIsAddressAlertOpen] = useState(false);
  const [isAddressSavedOpen, setIsAddressSavedOpen] = useState(false);
  const [savedAddressData, setSavedAddressData] = useState(null);
  const [dietFilter, setDietFilter] = useState('BOTH'); // 'VEG' (Left - Green) | 'BOTH' (Mid - Default) | 'NON_VEG' (Right - Red)

  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Modifiers Modal State
  const [modifierItem, setModifierItem] = useState(null);
  const [modifierRestaurant, setModifierRestaurant] = useState(null);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingConflict, setPendingConflict] = useState(null);

  // Modals & Tracking
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Start WebSockets connection on app startup
  useEffect(() => {
    socketService.startConnection();
  }, []);

  // Keep user profile synced initially when phone changes
  const refreshCurrentUser = async () => {
    if (!currentUser?.phone) return;
    try {
      const freshUser = await fetchUser(currentUser.phone);
      if (freshUser) {
        if (
          freshUser.walletBalance !== currentUser.walletBalance ||
          freshUser.referralCode !== currentUser.referralCode ||
          freshUser.name !== currentUser.name
        ) {
          setCurrentUser(freshUser);
          localStorage.setItem('quickbite_user', JSON.stringify(freshUser));
        }
      }
    } catch (e) {
      // ignore network blips
    }
  };

  // Real-time WebSockets synchronization: Automatically reflects changes without browser refresh
  useEffect(() => {
    if (currentUser?.phone) {
      refreshCurrentUser();
      socketService.joinCustomerRoom(currentUser.phone);
    }

    // 1. Live User Profile / Wallet Updates via WebSocket
    const unsubUser = socketService.onUserUpdated((updatedUser) => {
      if (updatedUser && currentUser?.phone) {
        const cleanUpdated = (updatedUser.phone || '').replace(/\D/g, '');
        const cleanCurrent = (currentUser.phone || '').replace(/\D/g, '');
        if (cleanUpdated === cleanCurrent || updatedUser.id === currentUser.id) {
          setCurrentUser(updatedUser);
          localStorage.setItem('quickbite_user', JSON.stringify(updatedUser));
        }
      }
    });

    // 2. Live Order Status Updates via WebSocket
    const unsubOrder = socketService.onOrderUpdated((updatedOrder) => {
      if (!updatedOrder) return;
      setActiveOrder((prev) => {
        if (prev && (prev.id === updatedOrder.id || prev.orderNumber === updatedOrder.orderNumber)) {
          return updatedOrder;
        }
        return prev;
      });
      setPastOrders((prev) => {
        const exists = prev.some((o) => o.id === updatedOrder.id);
        if (exists) {
          return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        }
        return [updatedOrder, ...prev];
      });
    });

    // 3. Live Menu Updates via WebSocket
    const unsubMenu = socketService.onMenuUpdated(() => {
      loadData();
    });

    return () => {
      unsubUser();
      unsubOrder();
      unsubMenu();
    };
  }, [currentUser?.phone, currentUser?.id]);

  // Initial load
  useEffect(() => {
    loadData();
    loadHealth();
    loadPastOrders();
  }, [selectedCategory]);

  const loadPastOrders = async () => {
    try {
      const orders = await fetchOrders();
      setPastOrders(orders || []);
    } catch (err) {
      console.error('Failed to load past orders:', err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRestaurants(selectedCategory);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to check health:', err);
    }
  };

  const handleOpenRestaurant = async (restaurant) => {
    try {
      const details = await fetchRestaurant(restaurant.id);
      setSelectedRestaurant(details);
    } catch (err) {
      setSelectedRestaurant(restaurant);
    }
  };

  const handleAddToCart = (restaurant, item, modifierData = null) => {
    // If cart has items from another restaurant, show custom in-window conflict popup
    if (cartRestaurant && cartRestaurant.id !== restaurant.id && cartItems.length > 0) {
      setPendingConflict({ restaurant, item, modifierData });
      return;
    }

    setCartRestaurant(restaurant);
    const cartId = `${item.id}-${modifierData?.selectedModifiers || 'default'}`;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) => (i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          selectedModifiers: modifierData?.selectedModifiers || '',
          modifierAdditionalPrice: modifierData?.modifierAdditionalPrice || 0,
          price: modifierData?.unitPrice || item.price,
          cartId
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleConfirmReplaceCart = () => {
    if (!pendingConflict) return;
    const { restaurant, item, modifierData } = pendingConflict;
    const newItem = {
      ...item,
      quantity: 1,
      selectedModifiers: modifierData?.selectedModifiers || '',
      modifierAdditionalPrice: modifierData?.modifierAdditionalPrice || 0,
      price: modifierData?.unitPrice || item.price,
      cartId: `${item.id}-${modifierData?.selectedModifiers || 'default'}`
    };
    setCartItems([newItem]);
    setCartRestaurant(restaurant);
    setPendingConflict(null);
  };

  const handleOpenModifiers = (item, restaurant) => {
    setModifierItem(item);
    setModifierRestaurant(restaurant);
  };

  const handleUpdateQuantity = (cartIdOrItemId, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) => {
        const updated = prev.filter((i) => {
          const matchCartId = i.cartId && String(i.cartId) === String(cartIdOrItemId);
          const matchId = String(i.id) === String(cartIdOrItemId);
          return !(matchCartId || matchId);
        });
        if (updated.length === 0) setCartRestaurant(null);
        return updated;
      });
    } else {
      setCartItems((prev) =>
        prev.map((i) => {
          const matchCartId = i.cartId && String(i.cartId) === String(cartIdOrItemId);
          const matchId = String(i.id) === String(cartIdOrItemId);
          if (matchCartId || matchId) {
            return { ...i, quantity: newQty };
          }
          return i;
        })
      );
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
  };

  const handleOpenCheckout = () => {
    const hasAddress = Boolean(
      (currentUser?.address && currentUser.address.trim()) ||
      (currentUser?.homeAddress && currentUser.homeAddress.trim()) ||
      (currentUser?.workAddress && currentUser.workAddress.trim())
    );

    if (!hasAddress) {
      setIsCartOpen(false);
      setIsAddressAlertOpen(true);
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (orderPayload) => {
    try {
      setIsPlacingOrder(true);
      const newOrder = await createOrder(orderPayload);
      
      // Clear cart
      setCartItems([]);
      setCartRestaurant(null);
      setIsCheckoutOpen(false);
      
      // Open Live Tracker
      setActiveOrder(newOrder);
      setSelectedRestaurant(null);
      loadHealth(); // update order counts
      loadPastOrders(); // update past orders list
    } catch (err) {
      alert(`Order placement failed: ${err.message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleAdvanceStatus = async (orderId) => {
    try {
      const updated = await advanceOrderStatus(orderId);
      setActiveOrder(updated);
    } catch (err) {
      alert(`Failed to advance status: ${err.message}`);
    }
  };

  const handleOpenHistory = async () => {
    try {
      const orders = await fetchOrders();
      setPastOrders(orders);
      setIsHistoryOpen(true);
    } catch (err) {
      alert('Failed to load past orders');
    }
  };

  const handleCompleteLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoginOpen(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('quickbite_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
    setIsLoginOpen(true);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem('quickbite_user');
    setCurrentUser(null);
    setPastOrders([]);
    setIsProfileOpen(false);
    setIsLoginOpen(true);
  };

  const filteredRestaurants = restaurants.filter((r) => {
    // 1. Text Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.menuItems?.some((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 2. Veg / Both / Non-Veg Diet Filter
    if (dietFilter === 'VEG') {
      // Swiggy & Zomato logic: A restaurant is Pure Veg ONLY if it serves ZERO non-veg items
      if (!r.menuItems || r.menuItems.length === 0) return false;
      const hasNonVegItem = r.menuItems.some((m) => !m.isVeg);
      if (hasNonVegItem) return false; // Excludes Meghana Foods, Al Nahdi Mandi, etc.
      const hasVegItem = r.menuItems.some((m) => m.isVeg);
      if (!hasVegItem) return false;
    } else if (dietFilter === 'NON_VEG') {
      // Non-Veg filter: Restaurant must serve non-veg items
      if (!r.menuItems || r.menuItems.length === 0) return false;
      const hasNonVegItem = r.menuItems.some((m) => !m.isVeg);
      if (!hasNonVegItem) return false; // Excludes pure veg tiffin/dessert places
    }

    return true;
  });

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenHistory={handleOpenHistory}
        onResetView={() => {
          setActiveOrder(null);
          setSelectedRestaurant(null);
          setSearchQuery('');
          setSelectedCategory('All');
          setDietFilter('BOTH');
          setIsHistoryOpen(false);
          setIsCartOpen(false);
          setIsProfileOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      {activeOrder ? (
        <OrderTracker
          order={activeOrder}
          onAdvanceStatus={handleAdvanceStatus}
          onClose={() => setActiveOrder(null)}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Subtle Ambient Background QuickBite Logo Watermark */}
          <div className="home-bg-watermark" aria-hidden="true">
            <img
              src="/logo.jpg"
              alt=""
              className="home-bg-watermark-logo"
            />
          </div>

          {/* Top Promotional Offer Banner Carousel (Responsive) */}
          <OfferCarousel currentUser={currentUser} />

          {/* Cuisines Filter with Veg / Both / Non-Veg Slider */}
          <CategoryFilter
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            dietFilter={dietFilter}
            onDietChange={setDietFilter}
          />

          {/* Restaurant Grid */}
          <main className="main-container">
            <div className="section-title-wrap">
              <div>
                <h2 className="section-title">
                  {selectedCategory === 'All' ? 'Top Bengaluru Restaurants' : `${selectedCategory} Specials`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {dietFilter === 'VEG' && (
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      🌱 Filtered: Pure Veg Only
                    </span>
                  )}
                  {dietFilter === 'NON_VEG' && (
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                      🍗 Filtered: Non-Veg Available
                    </span>
                  )}
                </div>
              </div>
              <span className="section-count">
                {filteredRestaurants.length} Restaurants Open
              </span>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--slate-500)' }}>
                Fetching top Bengaluru restaurants...
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--slate-500)' }}>
                No restaurants found matching "{searchQuery}".
              </div>
            ) : (
              <div className="restaurant-grid">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => handleOpenRestaurant(restaurant)}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Guest Login Onboarding Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onCompleteLogin={handleCompleteLogin}
        canClose={Boolean(currentUser)}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Customer Profile & Saved Addresses Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onSaveSuccess={(savedUser) => {
          setSavedAddressData(savedUser);
          setIsAddressSavedOpen(true);
        }}
      />

      {/* Cool Animated Address Saved Confirmation Modal */}
      <AddressSavedModal
        isOpen={isAddressSavedOpen}
        onClose={() => setIsAddressSavedOpen(false)}
        savedData={savedAddressData}
      />

      {/* Address Mandatory Alert Gate Modal */}
      <AddressAlertModal
        isOpen={isAddressAlertOpen}
        onClose={() => setIsAddressAlertOpen(false)}
        onAddAddress={() => setIsProfileOpen(true)}
      />

      {/* Restaurant Menu Modal */}
      <MenuModal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onAddToCart={(rest, item) => handleAddToCart(rest, item)}
        onOpenModifiers={(item, rest) => handleOpenModifiers(item, rest)}
      />

      {/* Item Modifiers Modal */}
      <ModifierModal
        item={modifierItem}
        restaurant={modifierRestaurant}
        onClose={() => setModifierItem(null)}
        onConfirmAdd={(rest, item, modData) => handleAddToCart(rest, item, modData)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        restaurant={cartRestaurant}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* Checkout Modal with Dynamic User, Card Selector & UPI Scan */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        restaurant={cartRestaurant}
        onConfirmOrder={handleConfirmOrder}
        isPlacingOrder={isPlacingOrder}
        currentUser={currentUser}
        pastOrders={pastOrders}
      />

      {/* Order History */}
      <OrderHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={pastOrders}
        onSelectOrder={(order) => setActiveOrder(order)}
        currentUser={currentUser}
      />

      {/* In-Window Restaurant Conflict Modal */}
      <RestaurantConflictModal
        isOpen={Boolean(pendingConflict)}
        onClose={() => setPendingConflict(null)}
        currentRestaurant={cartRestaurant}
        newRestaurant={pendingConflict?.restaurant}
        onConfirmReplace={handleConfirmReplaceCart}
      />
    </div>
  );
}
