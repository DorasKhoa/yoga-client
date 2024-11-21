import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Instance, Course } from '@/types';

interface BookingData {
  instanceId: string;
  courseId: string;
  email: string;
  date: string;
  time: string;
  type: string;
  teacher: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export const createBooking = async (
  instance: Instance,
  course: Course,
  email: string
): Promise<string> => {
  try {
    const bookingData: BookingData = {
      instanceId: instance.id,
      courseId: course.id,
      email: email,
      date: instance.date,
      time: course.time,
      type: course.type,
      teacher: instance.teacher,
      status: 'pending',
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};