const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const College = require('./models/College');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Event = require('./models/Event');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await College.deleteMany({});
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create multiple colleges
    const colleges = [
      {
        name: 'Tech University',
        address: '123 University Ave, Tech City, TC 12345'
      },
      {
        name: 'Business College',
        address: '456 Business Blvd, Commerce City, CC 67890'
      },
      {
        name: 'Arts Institute',
        address: '789 Creative Street, Arts Town, AT 13579'
      }
    ];

    const createdColleges = [];
    for (const collegeData of colleges) {
      const college = new College(collegeData);
      await college.save();
      createdColleges.push(college);
      console.log('Created college:', college.name);
    }

    // Create super admin (not tied to any specific college)
    const superAdmin = new Admin({
      college_id: null, // Super admin is not tied to a specific college
      email: 'superadmin@campus-events.com',
      password: 'superadmin123',
      role: 'super_admin'
    });
    await superAdmin.save();
    console.log('Created super admin:', superAdmin.email);

    // Create college admins for each college
    const collegeAdmins = [
      {
        email: 'admin@techuniversity.edu',
        password: 'admin123',
        college: createdColleges[0]
      },
      {
        email: 'admin@businesscollege.edu',
        password: 'admin123',
        college: createdColleges[1]
      },
      {
        email: 'admin@artsinstitute.edu',
        password: 'admin123',
        college: createdColleges[2]
      }
    ];

    for (const adminData of collegeAdmins) {
      const collegeAdmin = new Admin({
        college_id: adminData.college._id,
        email: adminData.email,
        password: adminData.password,
        role: 'college_admin'
      });
      await collegeAdmin.save();
      console.log('Created college admin:', collegeAdmin.email, 'for', adminData.college.name);
    }

    // Create students for each college
    const studentsData = [
      // Tech University students
      {
        name: 'John Doe',
        email: 'john.doe@student.techuniversity.edu',
        password: 'student123',
        student_id: 'TU001',
        college: createdColleges[0]
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@student.techuniversity.edu',
        password: 'student123',
        student_id: 'TU002',
        college: createdColleges[0]
      },
      // Business College students
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@student.businesscollege.edu',
        password: 'student123',
        student_id: 'BC001',
        college: createdColleges[1]
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@student.businesscollege.edu',
        password: 'student123',
        student_id: 'BC002',
        college: createdColleges[1]
      },
      // Arts Institute students
      {
        name: 'David Brown',
        email: 'david.brown@student.artsinstitute.edu',
        password: 'student123',
        student_id: 'AI001',
        college: createdColleges[2]
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@student.artsinstitute.edu',
        password: 'student123',
        student_id: 'AI002',
        college: createdColleges[2]
      }
    ];

    for (const studentData of studentsData) {
      const student = new Student({
        name: studentData.name,
        email: studentData.email,
        password: studentData.password,
        student_id: studentData.student_id,
        college_id: studentData.college._id
      });
      await student.save();
      console.log('Created student:', student.name, 'for', studentData.college.name);
    }

    // Create events for each college
    const eventsData = [
      // Tech University events
      {
        name: 'Tech Conference 2024',
        type: 'technical',
        host: 'Computer Science Department',
        description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and cloud computing.',
        start_time: new Date('2024-03-15T09:00:00'),
        end_time: new Date('2024-03-15T17:00:00'),
        location: 'Main Auditorium',
        max_participants: 200,
        college: createdColleges[0]
      },
      {
        name: 'Machine Learning Workshop',
        type: 'academic',
        host: 'AI Research Lab',
        description: 'Hands-on workshop covering machine learning fundamentals and practical applications.',
        start_time: new Date('2024-03-30T09:00:00'),
        end_time: new Date('2024-03-30T16:00:00'),
        location: 'Computer Lab 1',
        max_participants: 50,
        college: createdColleges[0]
      },
      // Business College events
      {
        name: 'Business Pitch Competition',
        type: 'academic',
        host: 'Entrepreneurship Club',
        description: 'Students pitch their business ideas to industry judges. Great opportunity for networking!',
        start_time: new Date('2024-03-20T10:00:00'),
        end_time: new Date('2024-03-20T18:00:00'),
        location: 'Business Hall',
        max_participants: 100,
        college: createdColleges[1]
      },
      {
        name: 'Networking Mixer',
        type: 'social',
        host: 'Career Services',
        description: 'Connect with industry professionals and fellow students in a relaxed networking environment.',
        start_time: new Date('2024-04-05T18:00:00'),
        end_time: new Date('2024-04-05T21:00:00'),
        location: 'Conference Room A',
        max_participants: 75,
        college: createdColleges[1]
      },
      // Arts Institute events
      {
        name: 'Art Exhibition',
        type: 'cultural',
        host: 'Fine Arts Department',
        description: 'Showcase of student artwork including paintings, sculptures, and digital art.',
        start_time: new Date('2024-03-25T14:00:00'),
        end_time: new Date('2024-03-25T20:00:00'),
        location: 'Art Gallery',
        max_participants: 150,
        college: createdColleges[2]
      },
      {
        name: 'Music Concert',
        type: 'cultural',
        host: 'Music Society',
        description: 'Live performances by student bands and solo artists. Free admission for all students.',
        start_time: new Date('2024-04-10T19:00:00'),
        end_time: new Date('2024-04-10T22:00:00'),
        location: 'Concert Hall',
        max_participants: 300,
        college: createdColleges[2]
      }
    ];

    for (const eventData of eventsData) {
      const event = new Event({
        name: eventData.name,
        type: eventData.type,
        host: eventData.host,
        description: eventData.description,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location,
        max_participants: eventData.max_participants,
        college_id: eventData.college._id
      });
      await event.save();
      console.log('Created event:', event.name, 'for', eventData.college.name);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('\n🔑 Super Admin:');
    console.log('   superadmin@campus-events.com / superadmin123');
    console.log('\n🏫 College Admins:');
    console.log('   Tech University: admin@techuniversity.edu / admin123');
    console.log('   Business College: admin@businesscollege.edu / admin123');
    console.log('   Arts Institute: admin@artsinstitute.edu / admin123');
    console.log('\n👨‍🎓 Students:');
    console.log('   Tech University:');
    console.log('     john.doe@student.techuniversity.edu / student123');
    console.log('     jane.smith@student.techuniversity.edu / student123');
    console.log('   Business College:');
    console.log('     mike.johnson@student.businesscollege.edu / student123');
    console.log('     sarah.wilson@student.businesscollege.edu / student123');
    console.log('   Arts Institute:');
    console.log('     david.brown@student.artsinstitute.edu / student123');
    console.log('     emma.davis@student.artsinstitute.edu / student123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedData();
