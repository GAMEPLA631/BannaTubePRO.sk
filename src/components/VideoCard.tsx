import { Video } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'motion/react';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 group cursor-pointer"
    >
      <Link to={`/watch/${video.id}`} className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          12:34
        </div>
      </Link>
      
      <div className="flex gap-3">
        <Link to={`/profile/${video.authorId}`}>
          <Avatar className="h-9 w-9 mt-0.5">
            <AvatarImage src={video.authorPhoto} />
            <AvatarFallback>{video.authorName[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col gap-1 overflow-hidden">
          <Link to={`/watch/${video.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </Link>
          <div className="flex flex-col text-xs text-muted-foreground">
            <Link to={`/profile/${video.authorId}`} className="hover:text-foreground transition-colors">
              {video.authorName}
            </Link>
            <div className="flex items-center gap-1">
              <span>{video.views.toLocaleString()} views</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
