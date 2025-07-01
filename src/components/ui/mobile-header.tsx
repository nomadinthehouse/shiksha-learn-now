
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Star, Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  onSignIn: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onSignIn }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Shiksha
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={handleProfileClick}
                      >
                        <Settings className="h-4 w-4" />
                        Profile & Settings
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button 
                onClick={onSignIn}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
