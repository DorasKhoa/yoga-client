import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, QueryConstraint, doc } from 'firebase/firestore';
import { db } from '@/api/firebase';
export function useFirestore<T>(
  path: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== useFirestore DEBUG ===');
    console.log('Initializing with path:', path);

    if (!path) {
      console.error('Path is required');
      setError('Path is required');
      setLoading(false);
      return;
    }

    try {
      // Split path into segments
      const pathSegments = path.split('/');
      console.log('Path segments:', pathSegments);

      let collectionRef;
      if (pathSegments.length === 3) { // For subcollections like 'courses/1/instances'
        const [collectionName, docId, subcollectionName] = pathSegments;
        console.log(`Accessing subcollection: ${subcollectionName} in doc: ${docId} of collection: ${collectionName}`);
        const docRef = doc(db, collectionName, docId);
        collectionRef = collection(docRef, subcollectionName);
      } else {
        console.log('Accessing root collection:', path);
        collectionRef = collection(db, path);
      }
      
      console.log('Collection reference created');
      
      const q = query(collectionRef, ...constraints);
      console.log('Query created');
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          console.log('Snapshot received');
          console.log('Document count:', querySnapshot.size);
          const documents = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Document data:', data);
            return {
              id: doc.id,
              ...data
            };
          }) as T[];
          
          console.log('Processed documents:', JSON.stringify(documents, null, 2));
          setData(documents);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore error:', error);
          setError(error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('Cleaning up subscription');
        unsubscribe();
      };
    } catch (err) {
      console.error('useFirestore error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [path, JSON.stringify(constraints)]);

  return { data, loading, error };
}