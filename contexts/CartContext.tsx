import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { Instance, Course } from '@/types';
import { createBooking, deleteBooking } from '@/api/bookingService';

interface BookingItem {
  instance: Instance;
  course: Course;
  email: string;
  bookingId?: string;
}

interface CartContextType {
  items: BookingItem[];
  addToCart: (booking: Omit<BookingItem, 'bookingId'>) => Promise<void>;
  removeFromCart: (bookingId: string) => Promise<void>;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        
        const bookingsPromises = bookingsSnapshot.docs.map(async (bookingDoc) => {
          const bookingData = bookingDoc.data();
          
          // Fetch course data
          const courseDoc = await getDoc(doc(db, 'courses', bookingData.courseId));
          const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
          
          // Fetch instance data
          const instanceDoc = await getDoc(
            doc(db, 'courses', bookingData.courseId, 'instances', bookingData.instanceId)
          );
          const instanceData = { id: instanceDoc.id, ...instanceDoc.data() } as Instance;

          return {
            bookingId: bookingDoc.id,
            instance: instanceData,
            course: courseData,
            email: bookingData.email,
          } as BookingItem;
        });

        const bookings = await Promise.all(bookingsPromises);
        setItems(bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const addToCart = async (booking: Omit<BookingItem, 'bookingId'>) => {
    try {
      setIsLoading(true);
      
      // Kiểm tra xem booking với cùng instance và email đã tồn tại chưa
      const exists = items.some(
        item => 
          item.instance.id === booking.instance.id && 
          item.email === booking.email
      );

      if (exists) {
        alert('You have already booked this class with this email');
        return;
      }

      // Đếm số lượng booking hiện tại cho instance này
      const currentBookingsCount = items.filter(
        item => item.instance.id === booking.instance.id
      ).length;

      // Kiểm tra capacity
      const capacity = parseInt(booking.course.capacity);
      if (currentBookingsCount >= capacity) {
        alert('Sorry, this class is full. Please choose another class.');
        return;
      }

      // Tạo booking mới trên Firebase
      const bookingId = await createBooking(
        booking.instance,
        booking.course,
        booking.email
      );
      
      // Thêm booking mới vào state
      const newBooking = { ...booking, bookingId };
      setItems(currentItems => [...currentItems, newBooking]);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (bookingId: string) => {
    try {
      setIsLoading(true);
      
      // Xóa booking trên Firebase
      await deleteBooking(bookingId);

      // Xóa khỏi state local
      setItems(currentItems => 
        currentItems.filter(item => item.bookingId !== bookingId)
      );
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        clearCart,
        isLoading 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}