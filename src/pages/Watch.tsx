import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, auth } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, addDoc, updateDoc, increment } from 'firebase/firestore';
import { Video, Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Watch() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    // Increment views once
    const videoRef = doc(db, 'videos', videoId);
    updateDoc(videoRef, { views: increment(1) }).catch(err => console.error("Error updating views", err));

    const unsubscribeVideo = onSnapshot(videoRef, (doc) => {
      if (doc.exists()) {
        setVideo({ id: doc.id, ...doc.data() } as Video);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `videos/${videoId}`);
    });

    const q = query(collection(db, 'videos', videoId, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const commentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(commentData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `videos/${videoId}/comments`);
    });

    return () => {
      unsubscribeVideo();
      unsubscribeComments();
    };
  }, [videoId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !videoId || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'videos', videoId, 'comments'), {
        videoId,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'Anonymous',
        authorPhoto: auth.currentUser.photoURL || '',
        text: newComment,
        createdAt: new Date().toISOString(),
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `videos/${videoId}/comments`);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return <div className="p-8 text-center">Video not found</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
          <video 
            src={video.videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full"
            poster={video.thumbnailUrl}
          />
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <h1 className="text-xl font-bold line-clamp-2">{video.title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${video.authorId}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={video.authorPhoto} />
                  <AvatarFallback>{video.authorName[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link to={`/profile/${video.authorId}`} className="font-semibold text-sm hover:underline">
                  {video.authorName}
                </Link>
                <span className="text-xs text-muted-foreground">1.2M subscribers</span>
              </div>
              <Button className="ml-4 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-6">
                Subscribe
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                <Button variant="ghost" className="rounded-none px-4 gap-2 border-r border-muted-foreground/20">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{video.likes}</span>
                </Button>
                <Button variant="ghost" className="rounded-none px-4">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="secondary" className="rounded-full gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-secondary/50 rounded-xl p-3 text-sm space-y-2">
            <div className="font-semibold flex gap-2">
              <span>{video.views.toLocaleString()} views</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="whitespace-pre-wrap">{video.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-bold">{comments.length} Comments</h3>
          
          {auth.currentUser ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={auth.currentUser.photoURL || ''} />
                <AvatarFallback>{auth.currentUser.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Input 
                  placeholder="Add a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-colors px-0"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" type="button" onClick={() => setNewComment('')}>Cancel</Button>
                  <Button 
                    disabled={!newComment.trim() || submittingComment}
                    className="rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Comment'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-secondary/30 rounded-lg text-center text-sm text-muted-foreground">
              Please sign in to comment
            </div>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.authorPhoto} />
                  <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">@{comment.authorName.replace(/\s+/g, '').toLowerCase()}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="text-[10px]">0</span>
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                    <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Recommendation (Mock) */}
      <div className="hidden xl:block space-y-4">
        <h3 className="font-bold text-sm">Recommended for you</h3>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-2 group cursor-pointer">
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              <img 
                src={`https://picsum.photos/seed/rec${i}/320/180`} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <h4 className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                Amazing Video Content {i} - You won't believe what happens next!
              </h4>
              <span className="text-[10px] text-muted-foreground">Channel Name</span>
              <div className="text-[10px] text-muted-foreground">
                <span>100K views</span>
                <span className="mx-1">•</span>
                <span>2 days ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
