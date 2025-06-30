import { Search, Play, FileText, Globe, Clock, User, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-content', {
        body: { query: searchQuery }
      });

      if (error) {
        throw error;
      }

      setSearchResults(data);
      toast({
        title: "Search completed!",
        description: `Found content about "${searchQuery}"`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenContent = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 shadow-md">
        <CardHeader className="pb-3">
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
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-4 line-clamp-3">
            {item.summary}
          </CardDescription>
          <div className="flex items-center justify-between text-xs text-gray-500">
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
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => handleOpenContent(item.url)}
          >
            Open
          </Button>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Learn Anything from the Internet
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover curated educational content from across the web, complete with AI-powered summaries
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
              onClick={handleSearch}
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
                  <h3 className="text-xl font-semibold mb-2">Video Content</h3>
                  <p className="text-gray-600">Curated educational videos from YouTube and other platforms</p>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Blog Articles</h3>
                  <p className="text-gray-600">In-depth articles and tutorials from educational blogs</p>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Web Resources</h3>
                  <p className="text-gray-600">Interactive courses and educational websites</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
