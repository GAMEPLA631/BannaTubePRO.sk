import { Search, Upload, User, LogIn, LogOut, Menu, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, signInWithGoogle, logout } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/" className="flex items-center gap-1 text-red-600 font-bold text-xl tracking-tighter">
          <Youtube className="h-8 w-8 fill-current" />
          <span className="hidden sm:inline">BannaTube PRO</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-4 hidden md:flex items-center gap-2">
        <div className="relative flex-1">
          <Input 
            placeholder="Search" 
            className="w-full h-10 pl-4 pr-10 rounded-full bg-secondary/50 border-muted-foreground/20 focus-visible:ring-1"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => navigate('/upload')} title="Upload Video">
              <Upload className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.uid}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Your Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button variant="outline" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={signInWithGoogle}>
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}
