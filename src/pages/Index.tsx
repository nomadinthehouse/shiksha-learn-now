import { Search, Play, FileText, Globe, Clock, User, Star, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/hooks/use-toast-custom";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { YoutubeModal } from "@/components/ui/youtube-modal";
import { FloatingChat } from "@/components/ui/floating-chat";
import { LearningLevelModal } from "@/components/ui/learning-level-modal";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";

const IndexContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [showLearningLevelModal, setShowLearningLevelModal] = useState(false);
  const [learningLevel, setLearningLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [youtubeModal, setYoutubeModal] = useState<{isOpen: boolean, videoId: string, title: string}>({
    isOpen: false,
    videoId: '',
    title: ''
  });
  const [showSidebar, setShowSidebar] = useState(false);
  
  const { showSuccess, showError } = useCustomToast();
  const { user, loading, signOut } = useAuth();

  const handleSearch = async (level?: 'beginner' | 'intermediate' | 'advanced') => {
    if (!searchQuery.trim()) {
      showError("Please enter a search query to find educational content.");
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-content', {
        body: { 
          query: searchQuery,
          userId: user?.id,
          learningLevel: level || learningLevel
        }
      });

      if (error) {
        throw error;
      }

      setSearchResults(data);
      showSuccess(`Found educational content about "${searchQuery}" for ${level || learningLevel} level`);
    } catch (error) {
      console.error('Search error:', error);
      showError("Search failed. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchClick = () => {
    if (!searchQuery.trim()) {
      showError("Please enter a search query to find educational content.");
      return;
    }
    setShowLearningLevelModal(true);
  };

  const handleLearningLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setLearningLevel(level);
    handleSearch(level);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleOpenContent = async (url: string, item: any) => {
    if (!user) {
      setAuthMessage("Please sign in to access educational content and track your learning progress.");
      setShowAuthModal(true);
      return;
    }

    // Track user progress
    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          topic: searchQuery.toLowerCase(),
          content_url: url,
          content_type: item.content_type || 'website',
          status: 'in_progress',
          completion_percentage: 0,
          time_spent: 0
        }, {
          onConflict: 'user_id,content_url'
        });

      // Track search history
      await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query: searchQuery,
          learning_level: learningLevel,
          results_count: (searchResults?.videos?.length || 0) + 
                        (searchResults?.websites?.length || 0) + 
                        (searchResults?.blogs?.length || 0)
        });
    } catch (error) {
      console.error('Error tracking progress:', error);
    }

    if (item.content_type === 'video' && url.includes('youtube.com/watch?v=')) {
      const videoId = item.metadata?.videoId || url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        setYoutubeModal({
          isOpen: true,
          videoId,
          title: item.title
        });
        return;
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTopicSelect = (topic: string) => {
    setSearchQuery(topic);
    setShowLearningLevelModal(true);
  };

  const handleAuthRequired = () => {
    setAuthMessage("Please sign in to use the learning assistant and get personalized help.");
    setShowAuthModal(true);
  };

  const ContentCard = ({ item, type }: { item: any; type: 'video' | 'blog' | 'website' }) => {
    const getIcon = () => {
      switch (type) {
        case 'video': return <Play className="h-4 w-4" />;
        case 'blog': return <FileText className="h-4 w-4" />;
        case 'website': return <Globe className="h-4 w-4" />;
      }
    };

    const getTypeColor = () => {
      switch (type) {
        case 'video': return 'bg-red-100 text-red-800';
        case 'blog': return 'bg-blue-100 text-blue-800';
        case 'website': return 'bg-green-100 text-green-800';
      }
    };

    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 shadow-md flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${getTypeColor()} text-xs`}>
              {getIcon()}
              <span className="ml-1 capitalize">{type}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.source}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {item.title}
          </CardTitle>
          {item.relevanceScore && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {item.relevanceScore}% match
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <CardDescription className="text-sm mb-4 line-clamp-3 flex-grow">
            {item.summary}
          </CardDescription>
          {item.learningTopics && item.learningTopics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.learningTopics.slice(0, 3).map((topic: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>{item.author}</span>
            </div>
            {item.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{item.duration}</span>
              </div>
            )}
            {item.metadata?.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{item.metadata.readTime}</span>
              </div>
            )}
          </div>
          <div className="mt-auto">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => handleOpenContent(item.url, item)}
            >
              {type === 'video' ? 'Watch' : 'Open'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 py-4 mb-6 z-10">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        {title === 'Videos' && <Play className="h-6 w-6 text-red-600" />}
        {title === 'Blogs' && <FileText className="h-6 w-6 text-blue-600" />}
        {title === 'Websites' && <Globe className="h-6 w-6 text-green-600" />}
        {title}
        <Badge variant="secondary" className="ml-2">
          {count}
        </Badge>
      </h2>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Shiksha
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Learn Anything from the Internet
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Discover curated educational content tailored to your learning level, complete with AI-powered summaries and intelligent filtering
              </p>
              
              <div className="flex gap-4 max-w-2xl mx-auto">
                <Input
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg py-6 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <Button
                  onClick={handleSearchClick}
                  disabled={isSearching}
                  className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="space-y-12">
                {/* Videos Section */}
                {searchResults.videos && searchResults.videos.length > 0 && (
                  <section>
                    <SectionHeader title="Videos" count={searchResults.videos.length} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.videos.map((video: any, index: number) => (
                        <ContentCard key={`video-${index}`} item={video} type="video" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Websites Section */}
                {searchResults.websites && searchResults.websites.length > 0 && (
                  <section>
                    <SectionHeader title="Websites" count={searchResults.websites.length} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.websites.map((website: any, index: number) => (
                        <ContentCard key={`website-${index}`} item={website} type="website" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Blogs Section */}
                {searchResults.blogs && searchResults.blogs.length > 0 && (
                  <section>
                    <SectionHeader title="Blogs" count={searchResults.blogs.length} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.blogs.map((blog: any, index: number) => (
                        <ContentCard key={`blog-${index}`} item={blog} type="blog" />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Welcome State */}
            {!searchResults && !isSearching && (
              <div className="text-center py-20">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">AI-Filtered Videos</h3>
                      <p className="text-gray-600">Curated educational videos with AI-powered relevance scoring</p>
                    </div>
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Learning Platforms</h3>
                      <p className="text-gray-600">Interactive courses from leading educational platforms</p>
                    </div>
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Quality Articles</h3>
                      <p className="text-gray-600">In-depth articles from trusted educational sources</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - only show when user is logged in and has searched */}
          {user && searchResults && (
            <div className="w-80 flex-shrink-0">
              <DashboardSidebar 
                currentTopic={searchQuery}
                onTopicSelect={handleTopicSelect}
              />
            </div>
          )}
        </div>
      </div>

      {searchResults && <FloatingChat searchContext={searchQuery} onAuthRequired={handleAuthRequired} />}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        message={authMessage}
      />
      <LearningLevelModal
        isOpen={showLearningLevelModal}
        onClose={() => setShowLearningLevelModal(false)}
        onLevelSelect={handleLearningLevelSelect}
        topic={searchQuery}
      />
      <YoutubeModal 
        isOpen={youtubeModal.isOpen}
        onClose={() => setYoutubeModal({isOpen: false, videoId: '', title: ''})}
        videoId={youtubeModal.videoId}
        title={youtubeModal.title}
      />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
