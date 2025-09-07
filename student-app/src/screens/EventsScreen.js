import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Searchbar,
  ActivityIndicator,
  Text
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  
  const navigation = useNavigation();

  const eventTypes = [
    { key: 'all', label: 'All' },
    { key: 'academic', label: 'Academic' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'sports', label: 'Sports' },
    { key: 'technical', label: 'Technical' },
    { key: 'social', label: 'Social' },
    { key: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedType]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events/public');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.host.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'ongoing': return '#10b981';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEvent = ({ item }) => (
    <Card style={styles.eventCard} onPress={() => navigation.navigate('EventDetail', { event: item })}>
      <Card.Content>
        <View style={styles.eventHeader}>
          <Title style={styles.eventTitle} numberOfLines={2}>{item.name}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {item.status}
          </Chip>
        </View>
        
        <Paragraph style={styles.eventHost}>Host: {item.host}</Paragraph>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅</Text>
            <Text style={styles.detailText}>{formatDate(item.start_time)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐</Text>
            <Text style={styles.detailText}>
              {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍</Text>
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
        
        <Paragraph style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Paragraph>
        
        <View style={styles.eventFooter}>
          <Chip style={styles.typeChip} textStyle={styles.typeText}>
            {item.type}
          </Chip>
          <Button 
            mode="contained" 
            compact
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search events..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.filterContainer}>
        <FlatList
          data={eventTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Chip
              selected={selectedType === item.key}
              onPress={() => setSelectedType(item.key)}
              style={[
                styles.filterChip,
                selectedType === item.key && styles.selectedFilterChip
              ]}
              textStyle={[
                styles.filterChipText,
                selectedType === item.key && styles.selectedFilterChipText
              ]}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#e5e7eb',
  },
  selectedFilterChip: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    color: '#374151',
  },
  selectedFilterChipText: {
    color: 'white',
  },
  eventsList: {
    padding: 16,
    paddingTop: 8,
  },
  eventCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventHost: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    backgroundColor: '#f3f4f6',
  },
  typeText: {
    color: '#374151',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default EventsScreen;
