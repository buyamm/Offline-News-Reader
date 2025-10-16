// App.js - Offline News Reader Application
// Cài đặt dependencies:
// npm install @react-native-async-storage/async-storage @react-native-community/netinfo
// npx expo install @react-native-async-storage/async-storage @react-native-community/netinfo

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock API endpoint - thay bằng API thật nếu có
const API_URL =
  "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY";

// Mock data cho demo
const MOCK_NEWS_DATA = [
  {
    id: "1",
    title: "React Native 0.75 Released with New Architecture",
    category: "Technology",
    excerpt:
      "The latest version brings significant performance improvements and new features.",
    content:
      "React Native 0.75 has been officially released, marking a major milestone in the framework's evolution. The new architecture provides better performance, improved developer experience, and enhanced compatibility with native modules.\n\nKey features include:\n• Faster startup times\n• Reduced memory footprint\n• Better debugging tools\n• Enhanced TypeScript support\n\nDevelopers can now build more efficient and responsive mobile applications with these improvements.",
    author: "Sarah Johnson",
    publishedAt: "2025-10-09T08:30:00Z",
    source: "Tech News Daily",
  },
  {
    id: "2",
    title: "AI Revolutionizes Mobile App Development",
    category: "Technology",
    excerpt:
      "Artificial Intelligence tools are changing how developers build mobile applications.",
    content:
      "Artificial Intelligence is transforming the mobile development landscape. AI-powered tools now assist developers in code generation, bug detection, UI/UX design, and automated testing.\n\nMajor impacts include:\n• 40% faster development cycles\n• Improved code quality\n• Better user experience\n• Reduced maintenance costs\n\nCompanies investing in AI development tools are seeing significant productivity gains.",
    author: "Michael Chen",
    publishedAt: "2025-10-09T07:15:00Z",
    source: "Developer Weekly",
  },
  {
    id: "3",
    title: "Global Climate Summit Reaches Historic Agreement",
    category: "World",
    excerpt: "World leaders commit to ambitious carbon reduction targets.",
    content:
      "In a landmark decision, the Global Climate Summit concluded with 195 countries agreeing to aggressive carbon emission reduction targets.\n\nThe agreement includes:\n• 50% emission cuts by 2035\n• Increased renewable energy investments\n• Protection of natural ecosystems\n• Technology transfer to developing nations\n\nEnvironmental experts call this a crucial step in combating climate change.",
    author: "Emma Williams",
    publishedAt: "2025-10-08T18:45:00Z",
    source: "World News Network",
  },
  {
    id: "4",
    title: "Stock Markets Hit Record Highs Amid Tech Rally",
    category: "Business",
    excerpt: "Major indices surge as technology sector leads market gains.",
    content:
      "Global stock markets reached new record highs today, driven by strong performance in the technology sector.\n\nKey highlights:\n• S&P 500 up 2.3%\n• NASDAQ gains 3.1%\n• Tech giants report strong earnings\n• Investor confidence at 5-year high\n\nAnalysts attribute the rally to positive economic indicators and strong corporate earnings.",
    author: "David Park",
    publishedAt: "2025-10-08T16:20:00Z",
    source: "Financial Times",
  },
  {
    id: "5",
    title: "New Breakthrough in Cancer Research",
    category: "Health",
    excerpt: "Scientists discover promising treatment for aggressive tumors.",
    content:
      "Researchers have announced a breakthrough in cancer treatment showing remarkable results in early trials.\n\nKey findings:\n• 85% success rate in trials\n• Minimal side effects\n• Targets multiple cancer types\n• Personalized treatment approach\n\nThe treatment combines immunotherapy with targeted drug delivery, offering hope to patients worldwide.",
    author: "Dr. Lisa Anderson",
    publishedAt: "2025-10-08T14:00:00Z",
    source: "Medical Journal",
  },
  {
    id: "6",
    title: "Champions League: Dramatic Comeback Victory",
    category: "Sports",
    excerpt:
      "Team stages incredible second-half turnaround in European competition.",
    content:
      "In one of the most dramatic matches of the season, the home team staged an incredible comeback from 3-0 down at halftime to win 4-3.\n\nMatch highlights:\n• First half: 0-3 deficit\n• Second half: 4 goals in 35 minutes\n• Record-breaking attendance\n• Manager's tactical masterclass\n\nFans are calling it one of the greatest comebacks in European football history.",
    author: "James Rodriguez",
    publishedAt: "2025-10-07T22:30:00Z",
    source: "Sports Daily",
  },
];

const CATEGORIES = [
  "All",
  "Technology",
  "World",
  "Business",
  "Health",
  "Sports",
];
const CACHE_KEY = "cached_news";
const LAST_UPDATE_KEY = "last_updated";

const App = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
      if (state.isConnected && !loading) {
        Alert.alert(
          "🌐 Back Online",
          "Connection restored. Pull to refresh for latest news."
        );
      } else if (!state.isConnected && !loading) {
        Alert.alert("📵 Offline Mode", "Showing cached articles.");
      }
    });

    return () => unsubscribe();
  }, [loading]);

  // Load news from cache or API
  const loadNews = useCallback(async () => {
    try {
      if (isOnline) {
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const data = MOCK_NEWS_DATA;

        setNews(data);

        // Save to cache
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        const timestamp = new Date().toISOString();
        await AsyncStorage.setItem(LAST_UPDATE_KEY, timestamp);
        setLastUpdate(timestamp);
      } else {
        // Load from cache
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        const lastUpdateTime = await AsyncStorage.getItem(LAST_UPDATE_KEY);

        if (cached) {
          setNews(JSON.parse(cached));
          setLastUpdate(lastUpdateTime);
        } else {
          Alert.alert(
            "No Cache",
            "No cached data available. Please connect to internet."
          );
        }
      }
    } catch (error) {
      console.error("Error loading news:", error);
      Alert.alert("Error", "Failed to load news. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Filter news by category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredNews(news);
    } else {
      setFilteredNews(
        news.filter((item) => item.category === selectedCategory)
      );
    }
  }, [news, selectedCategory]);

  const onRefresh = useCallback(() => {
    if (isOnline) {
      setRefreshing(true);
      loadNews();
    } else {
      Alert.alert(
        "Offline",
        "Cannot refresh while offline. Please check your connection."
      );
    }
  }, [isOnline, loadNews]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => setSelectedArticle(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>

      <Text style={styles.newsTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.newsExcerpt} numberOfLines={2}>
        {item.excerpt}
      </Text>

      <View style={styles.newsMeta}>
        <Text style={styles.newsAuthor}>{item.author}</Text>
        <Text style={styles.newsTime}>{formatDate(item.publishedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderArticleDetail = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />

      <View style={styles.detailHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedArticle(null)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>Article</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.detailContent}>
        <View style={styles.detailBody}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{selectedArticle.category}</Text>
          </View>

          <Text style={styles.detailTitle}>{selectedArticle.title}</Text>

          <View style={styles.detailMeta}>
            <Text style={styles.detailAuthor}>By {selectedArticle.author}</Text>
            <Text style={styles.detailDate}>
              {formatDate(selectedArticle.publishedAt)}
            </Text>
          </View>

          <Text style={styles.detailSource}>
            Source: {selectedArticle.source}
          </Text>

          <Text style={styles.detailText}>{selectedArticle.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (selectedArticle) {
    return renderArticleDetail();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📰 News Reader</Text>
          <Text style={styles.headerSubtitle}>
            {filteredNews.length} articles •{" "}
            {isOnline ? "🟢 Online" : "🔴 Offline"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryFilter(!showCategoryFilter)}
        >
          <Text style={styles.filterButtonText}>
            {showCategoryFilter ? "✕" : "☰"} Filter
          </Text>
        </TouchableOpacity>
      </View>

      {showCategoryFilter && (
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            📵 Offline Mode - Showing cached articles
          </Text>
        </View>
      )}

      {lastUpdate && (
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>
            Last updated: {formatDate(lastUpdate)}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : filteredNews.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭 No articles found</Text>
          <Text style={styles.emptySubtext}>
            {isOnline ? "Try refreshing" : "Connect to internet to fetch news"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3498DB"]}
              tintColor="#3498DB"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#2C3E50",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#BDC3C7",
    marginTop: 4,
  },
  filterButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryFilter: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 5,
  },
  categoryChipActive: {
    backgroundColor: "#3498DB",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  offlineBanner: {
    backgroundColor: "#E67E22",
    padding: 12,
    alignItems: "center",
  },
  offlineBannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  updateInfo: {
    backgroundColor: "#ECF0F1",
    padding: 8,
    alignItems: "center",
  },
  updateText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  listContent: {
    padding: 15,
  },
  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3498DB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 24,
  },
  newsExcerpt: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  newsAuthor: {
    fontSize: 13,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  newsTime: {
    fontSize: 12,
    color: "#95A5A6",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  detailHeader: {
    backgroundColor: "#2C3E50",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  detailContent: {
    flex: 1,
  },
  detailBody: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    lineHeight: 34,
    marginTop: 10,
    marginBottom: 15,
  },
  detailMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  detailAuthor: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  detailDate: {
    fontSize: 13,
    color: "#95A5A6",
  },
  detailSource: {
    fontSize: 13,
    color: "#3498DB",
    fontStyle: "italic",
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 26,
  },
});

export default App;
