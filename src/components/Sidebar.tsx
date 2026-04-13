import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, Film, Flame, Music2, Gamepad2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Flame, label: 'Trending', path: '/trending' },
  { icon: PlaySquare, label: 'Subscriptions', path: '/subscriptions' },
];

const libraryItems = [
  { icon: History, label: 'History', path: '/history' },
  { icon: Film, label: 'Your videos', path: '/your-videos' },
  { icon: Clock, label: 'Watch later', path: '/watch-later' },
  { icon: ThumbsUp, label: 'Liked videos', path: '/liked' },
];

const exploreItems = [
  { icon: Music2, label: 'Music', path: '/music' },
  { icon: Gamepad2, label: 'Gaming', path: '/gaming' },
  { icon: Trophy, label: 'Sports', path: '/sports' },
];

export default function Sidebar() {
  const location = useLocation();

  const SidebarButton = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "w-full justify-start gap-4 px-3 h-10 font-normal rounded-lg",
        location.pathname === path ? "bg-secondary font-medium" : "hover:bg-secondary/50"
      )}
    >
      <Link to={path}>
        <Icon className={cn("h-5 w-5", location.pathname === path ? "text-red-600" : "")} />
        <span className="text-sm">{label}</span>
      </Link>
    </Button>
  );

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 hidden lg:block border-r bg-background overflow-hidden">
      <ScrollArea className="h-full px-2 py-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarButton key={item.label} icon={item.icon} label={item.label} path={item.path} />
          ))}
        </div>
        <Separator className="my-4 mx-2" />
        <div className="space-y-1">
          <h3 className="px-4 mb-2 text-sm font-semibold text-muted-foreground">Library</h3>
          {libraryItems.map((item) => (
            <SidebarButton key={item.label} icon={item.icon} label={item.label} path={item.path} />
          ))}
        </div>
        <Separator className="my-4 mx-2" />
        <div className="space-y-1">
          <h3 className="px-4 mb-2 text-sm font-semibold text-muted-foreground">Explore</h3>
          {exploreItems.map((item) => (
            <SidebarButton key={item.label} icon={item.icon} label={item.label} path={item.path} />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
