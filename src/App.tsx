/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { doc, setDoc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoCard from '@/components/VideoCard';
import { Video } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';
import Watch from '@/pages/Watch';
import Upload from '@/pages/Upload';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || '{}');
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Oops!</h1>
          <p className="text-muted-foreground max-w-md">{errorMessage}</p>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
      setVideos(videoData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 p-4">
      {videos.length > 0 ? (
        videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No videos found</p>
          <p className="text-sm">Be the first to upload a video!</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            displayName: user.displayName || 'Anonymous',
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
          });
        }
      };
      syncUser().catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <Navbar />
          <div className="flex pt-14">
            <Sidebar />
            <main className="flex-1 lg:ml-64 min-h-[calc(100vh-3.5rem)]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/watch/:videoId" element={<Watch />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile/:userId" element={<div className="p-8">Profile Page (Coming Soon)</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}


