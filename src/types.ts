export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: string;
}
