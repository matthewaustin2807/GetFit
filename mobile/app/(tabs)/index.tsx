// app/index.tsx (becomes a "redirector")
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // This runs immediately when the component loads
    router.replace('/dashboard/nutrition/foodDetailPage');
  }, []);

  return null; // Shows nothing (blank screen briefly)
}