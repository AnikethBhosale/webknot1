import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const EventDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { student } = useAuth();
  const { event: initialEvent } = route.params;
  
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/me/events`);
      const registration = response.data.find(reg => reg.event_id._id === event._id);
      
      if (registration) {
        setIsRegistered(true);
        setRegistrationStatus(registration.status);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!student) {
      Alert.alert('Error', 'Please login to register for events');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/students/register-event', {
        event_id: event._id
      });
      
      setIsRegistered(true);
      setRegistrationStatus('registered');
      Alert.alert('Success', 'Successfully registered for the event!');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/students/unregister-event/${event._id}`);
      
      setIsRegistered(false);
      setRegistrationStatus('');
      Alert.alert('Success', 'Successfully unregistered from the event!');
    } catch (error) {
      const message = error.response?.data?.message || 'Unregistration failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canRegister = () => {
    return event.status === 'upcoming' && !isRegistered;
  };

  const canUnregister = () => {
    return isRegistered && registrationStatus === 'registered' && event.status === 'upcoming';
  };

  const canGiveFeedback = () => {
    return isRegistered && registrationStatus === 'attended' && event.status === 'completed';
  };

  return (
    <ScrollView style={styles.container}>
      {event.poster_url && (
        <Image
          source={{ uri: `http://localhost:5000${event.poster_url}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>{event.name}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
            textStyle={styles.statusText}
          >
            {event.status}
          </Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Host:</Text>
              <Text style={styles.value}>{event.host}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type:</Text>
              <Chip style={styles.typeChip} textStyle={styles.typeText}>
                {event.type}
              </Chip>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(event.start_time)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{event.location}</Text>
            </View>
            
            {event.max_participants && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Max Participants:</Text>
                <Text style={styles.value}>{event.max_participants}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Description</Title>
            <Paragraph style={styles.description}>{event.description}</Paragraph>
          </Card.Content>
        </Card>

        {event.college_id && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>College</Title>
              <Text style={styles.collegeName}>{event.college_id.name}</Text>
              {event.college_id.address && (
                <Text style={styles.collegeAddress}>{event.college_id.address}</Text>
              )}
            </Card.Content>
          </Card>
        )}

        <View style={styles.actionButtons}>
          {canRegister() && (
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
            >
              Register for Event
            </Button>
          )}

          {canUnregister() && (
            <Button
              mode="outlined"
              onPress={handleUnregister}
              loading={loading}
              disabled={loading}
              style={styles.actionButton}
            >
              Unregister
            </Button>
          )}

          {isRegistered && (
            <View style={styles.registrationStatus}>
              <Text style={styles.statusLabel}>Registration Status:</Text>
              <Chip 
                style={[
                  styles.statusChip, 
                  { backgroundColor: getStatusColor(registrationStatus) }
                ]}
                textStyle={styles.statusText}
              >
                {registrationStatus}
              </Chip>
            </View>
          )}

          {canGiveFeedback() && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Feedback', { event })}
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            >
              Give Feedback
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  poster: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 12,
  },
  statusChip: {
    height: 32,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    width: 120,
  },
  value: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  typeChip: {
    backgroundColor: '#f3f4f6',
  },
  typeText: {
    color: '#374151',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  collegeAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  registrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
});

export default EventDetailScreen;
