import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Text,
  ActivityIndicator
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import StarRating from 'react-native-star-rating';

const FeedbackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params;
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/feedback/submit', {
        event_id: event._id,
        rating: rating,
        comment: comment.trim()
      });
      
      Alert.alert(
        'Success', 
        'Thank you for your feedback!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit feedback';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.eventCard}>
          <Card.Content>
            <Title style={styles.eventTitle}>{event.name}</Title>
            <Paragraph style={styles.eventDetails}>
              {formatDate(event.start_time)} • {event.location}
            </Paragraph>
            <Paragraph style={styles.eventHost}>Host: {event.host}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.feedbackCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Rate Your Experience</Title>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Overall Rating:</Text>
              <StarRating
                disabled={false}
                maxStars={5}
                rating={rating}
                selectedStar={(rating) => setRating(rating)}
                fullStarColor="#fbbf24"
                emptyStarColor="#d1d5db"
                starSize={40}
                containerStyle={styles.starContainer}
              />
              <Text style={styles.ratingText}>
                {rating === 0 ? 'Select a rating' : 
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </Text>
            </View>

            <TextInput
              label="Comments (Optional)"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.commentInput}
              placeholder="Share your thoughts about the event..."
              maxLength={500}
            />
            
            <Text style={styles.characterCount}>
              {comment.length}/500 characters
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || rating === 0}
            style={styles.submitButton}
          >
            Submit Feedback
          </Button>
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
  content: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  eventHost: {
    fontSize: 14,
    color: '#6b7280',
  },
  feedbackCard: {
    marginBottom: 24,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  starContainer: {
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  commentInput: {
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
});

export default FeedbackScreen;
