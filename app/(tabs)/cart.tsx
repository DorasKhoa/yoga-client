import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, isLoading } = useCart();

  const handleRemove = async (bookingId: string) => {
    try {
      await removeFromCart(bookingId);
    } catch (error) {
      alert('Failed to remove booking. Please try again.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Your Cart</ThemedText>
          <ThemedText>Items in cart: {items.length}</ThemedText>
        </ThemedView>

        {isLoading ? (
          <ThemedView style={styles.messageContainer}>
            <ThemedText>Loading bookings...</ThemedText>
          </ThemedView>
        ) : items.length === 0 ? (
          <ThemedView style={styles.messageContainer}>
            <ThemedText>Your cart is empty</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView>
            {items.map((item) => (
              <ThemedView key={item.bookingId} style={styles.bookingItem}>
                <ThemedText style={styles.bookingText} type="defaultSemiBold">
                  {item.course.type}
                </ThemedText>
                <ThemedText style={styles.bookingText}>
                  Date: {item.instance.date}
                </ThemedText>
                <ThemedText style={styles.bookingText}>
                  Time: {item.course.time}
                </ThemedText>
                <ThemedText style={styles.bookingText}>
                  Email: {item.email}
                </ThemedText>
                {item.bookingId && (
                  <ThemedText style={styles.bookingText}>
                    Booking ID: {item.bookingId}
                  </ThemedText>
                )}
                <TouchableOpacity
                  style={[styles.removeButton, isLoading && styles.disabledButton]}
                  disabled={isLoading}
                  onPress={() => handleRemove(item.bookingId!)}
                >
                  <ThemedText style={styles.removeButtonText}>
                    {isLoading ? 'Removing...' : 'Remove'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  messageContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingItem: {
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingText: {
    color: '#000000',
    marginBottom: 5,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFA500', // Orange color for pending status
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});