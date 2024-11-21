import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Instance, Course } from '@/types';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/api/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/contexts/CartContext';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface InstanceWithType extends Instance {
  type: string;
  course: Course;
}

export default function HomeScreen() {
  const [allInstances, setAllInstances] = useState<InstanceWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const insets = useSafeAreaInsets();
  const { addToCart, isLoading, items } = useCart();

  useEffect(() => {
    const fetchAllInstances = async () => {
      try {
        setLoading(true);
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        
        const instancePromises = coursesSnapshot.docs.map(async (courseDoc) => {
          const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
          const instancesSnapshot = await getDocs(
            collection(db, `courses/${courseDoc.id}/instances`)
          );
          
          return instancesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: courseData.type,
            course: courseData
          })) as InstanceWithType[];
        });

        const instanceArrays = await Promise.all(instancePromises);
        const allInstancesData = instanceArrays.flat();
        
        setAllInstances(allInstancesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching instances:', err);
        setError(err instanceof Error ? err.message : 'Error fetching data');
        setLoading(false);
      }
    };

    fetchAllInstances();
  }, []);

  const handleConfirmBooking = (instanceId: string) => {
    setShowEmailInput(instanceId);
  };

  const handleBooking = async (instance: InstanceWithType) => {
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }

    try {
      await addToCart({
        instance,
        course: instance.course,
        email
      });
      
      setEmail('');
      setShowEmailInput(null);
      router.push('/cart');
    } catch (error) {
      alert('Failed to book class. Please try again.');
    }
  };

  const getAvailableSpots = (instance: InstanceWithType) => {
    const currentBookings = items.filter(
      item => item.instance.id === instance.id
    ).length;
    const capacity = parseInt(instance.course.capacity);
    return capacity - currentBookings;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Available Classes</ThemedText>
          <ThemedText>Total Classes: {allInstances.length}</ThemedText>
        </ThemedView>

        {loading && (
          <ThemedView style={styles.messageContainer}>
            <ThemedText>Loading classes...</ThemedText>
          </ThemedView>
        )}

        {error && (
          <ThemedView style={styles.messageContainer}>
            <ThemedText>{error}</ThemedText>
          </ThemedView>
        )}

        {!loading && !error && allInstances.length === 0 && (
          <ThemedView style={styles.messageContainer}>
            <ThemedText>No classes available</ThemedText>
          </ThemedView>
        )}

        {!loading && !error && allInstances.length > 0 && (
          <ThemedView>
            {allInstances.map((instance) => (
              <ThemedView 
                key={instance.id}
                style={styles.instanceContainer}
                lightColor="#f8f9fa"
                darkColor="#2c3e50"
              >
                <ThemedText type="title" style={styles.typeTitle}>
                  {instance.type}
                </ThemedText>
                <ThemedText type="defaultSemiBold">Date: {instance.date}</ThemedText>
                <ThemedText type="defaultSemiBold">Teacher: {instance.teacher}</ThemedText>
                <ThemedText type="defaultSemiBold">
                  Available spots: {getAvailableSpots(instance)}/{instance.course.capacity}
                </ThemedText>
                {instance.comments && (
                  <ThemedText>Comments: {instance.comments}</ThemedText>
                )}
                
                {showEmailInput === instance.id ? (
                  <ThemedView style={styles.emailContainer}>
                    <TextInput
                      style={styles.emailInput}
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <ThemedView style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.bookButton, 
                          styles.confirmButton,
                          isLoading && styles.disabledButton
                        ]}
                        disabled={isLoading}
                        onPress={() => handleBooking(instance)}
                      >
                        <ThemedText style={styles.bookButtonText}>
                          {isLoading ? 'Booking...' : 'Submit'}
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.bookButton, styles.cancelButton]}
                        onPress={() => {
                          setShowEmailInput(null);
                          setEmail('');
                        }}
                      >
                        <ThemedText style={styles.bookButtonText}>Cancel</ThemedText>
                      </TouchableOpacity>
                    </ThemedView>
                  </ThemedView>
                ) : (
                  <TouchableOpacity 
                    style={[
                      styles.bookButton,
                      getAvailableSpots(instance) <= 0 && styles.disabledButton
                    ]}
                    disabled={getAvailableSpots(instance) <= 0}
                    onPress={() => handleConfirmBooking(instance.id)}
                  >
                    <ThemedText style={styles.bookButtonText}>
                      {getAvailableSpots(instance) <= 0 ? 'Class Full' : 'Book this class'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
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
  instanceContainer: {
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  typeTitle: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  bookButton: {
    backgroundColor: '#A1CEDC',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#4CAF50', // màu xanh lá
  },
  cancelButton: {
    backgroundColor: '#f44336', // màu đỏ
  },
  bookButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  emailContainer: {
    marginTop: 10,
  },
  emailInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
