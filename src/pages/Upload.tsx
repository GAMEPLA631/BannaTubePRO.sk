import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Upload as UploadIcon, Youtube } from 'lucide-react';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const videoData = {
        title,
        description,
        videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4', // Default for demo
        thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/${title}/1280/720`,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorPhoto: auth.currentUser.photoURL || '',
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'videos'), videoData);
      navigate(`/watch/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
            <UploadIcon className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Upload Video</CardTitle>
          <CardDescription>Share your content with the BannaTube PRO community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Title</label>
              <Input 
                placeholder="Enter a catchy title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Tell viewers about your video" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Video URL (Direct link)</label>
                <Input 
                  placeholder="https://example.com/video.mp4" 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="h-10"
                />
                <p className="text-[10px] text-muted-foreground italic">Leave empty for demo video</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL</label>
                <Input 
                  placeholder="https://example.com/thumb.jpg" 
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="h-10"
                />
                <p className="text-[10px] text-muted-foreground italic">Leave empty for auto-generated</p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Video'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
