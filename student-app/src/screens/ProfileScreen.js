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
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ProfileScreen = () => {
  const { student, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || ''
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/students/profile', formData);
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: student?.name || '',
      email: student?.email || ''
    });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>
                {student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            <Title style={styles.studentName}>{student?.name}</Title>
            <Paragraph style={styles.studentId}>ID: {student?.student_id}</Paragraph>
            {student?.college && (
              <Paragraph style={styles.collegeName}>{student.college.name}</Paragraph>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Profile Information</Title>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              {editing ? (
                <TextInput
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  mode="outlined"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.value}>{student?.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              {editing ? (
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              ) : (
                <Text style={styles.value}>{student?.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Student ID</Text>
              <Text style={styles.value}>{student?.student_id}</Text>
            </View>

            {student?.college && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>College</Text>
                <Text style={styles.value}>{student.college.name}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Actions</Title>
            
            {editing ? (
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                >
                  Save Changes
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setEditing(true)}
                style={styles.actionButton}
              >
                Edit Profile
              </Button>
            )}

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={() => {
                // Navigate to change password screen
                Alert.alert('Coming Soon', 'Change password feature will be available soon');
              }}
              style={styles.actionButton}
            >
              Change Password
            </Button>

            <Button
              mode="contained"
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
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
  profileCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  collegeName: {
    fontSize: 14,
    color: '#9ca3af',
  },
  detailsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  actionsCard: {
    marginBottom: 32,
    elevation: 2,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#6b7280',
    paddingVertical: 8,
  },
  input: {
    backgroundColor: 'white',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
});

export default ProfileScreen;
