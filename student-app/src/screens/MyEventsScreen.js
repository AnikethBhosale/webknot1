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
  ActivityIndicator,
  Text
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const MyEventsScreen = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students/me/events');
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching my events:', error);
      Alert.alert('Error', 'Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyEvents();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'attended': return '#10b981';
      case 'absent': return '#ef4444';
      case 'registered': return '#3b82f6';
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

  const canGiveFeedback = (registration) => {
    return registration.status === 'attended' && 
           registration.event_id.status === 'completed';
  };

  const renderRegistration = ({ item }) => (
    <Card style={styles.eventCard}>
      <Card.Content>
        <View style={styles.eventHeader}>
          <Title style={styles.eventTitle} numberOfLines={2}>
            {item.event_id.name}
          </Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {item.status}
          </Chip>
        </View>
        
        <Paragraph style={styles.eventHost}>
          Host: {item.event_id.host}
        </Paragraph>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅</Text>
            <Text style={styles.detailText}>{formatDate(item.event_id.start_time)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐</Text>
            <Text style={styles.detailText}>
              {formatTime(item.event_id.start_time)} - {formatTime(item.event_id.end_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍</Text>
            <Text style={styles.detailText}>{item.event_id.location}</Text>
          </View>
        </View>
        
        <View style={styles.eventFooter}>
          <Chip style={styles.typeChip} textStyle={styles.typeText}>
            {item.event_id.type}
          </Chip>
          
          <View style={styles.actionButtons}>
            <Button 
              mode="outlined" 
              compact
              onPress={() => navigation.navigate('EventDetail', { event: item.event_id })}
            >
              View Details
            </Button>
            
            {canGiveFeedback(item) && (
              <Button 
                mode="contained" 
                compact
                onPress={() => navigation.navigate('Feedback', { event: item.event_id })}
                style={styles.feedbackButton}
              >
                Give Feedback
              </Button>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={registrations}
        keyExtractor={(item) => item._id}
        renderItem={renderRegistration}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events registered</Text>
            <Text style={styles.emptySubtext}>
              Browse events and register for ones you're interested in
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Events')}
              style={styles.browseButton}
            >
              Browse Events
            </Button>
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
  eventsList: {
    padding: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackButton: {
    backgroundColor: '#10b981',
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
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 8,
  },
});

export default MyEventsScreen;
