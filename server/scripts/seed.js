const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');
const { connectDB, disconnectDB } = require('../config/db');

const seedData = async (shouldExit = true) => {
  try {
    console.log('🌱 Starting StaffSync database seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Announcement.deleteMany({}),
      Training.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('🧹 Cleared existing database records.');

    // 1. Create Core Users
    // Common password: Demo@12345
    const demoPassword = 'Demo@12345';

    const hrUser = await User.create({
      name: 'Eleanor Vance (HR Director)',
      email: 'hr@staffsync.demo',
      password: demoPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const managerUser = await User.create({
      name: 'Marcus Sterling (Engineering Lead)',
      email: 'manager@staffsync.demo',
      password: demoPassword,
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const employeeUser = await User.create({
      name: 'Sophia Chen (Senior Frontend Engineer)',
      email: 'employee@staffsync.demo',
      password: demoPassword,
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    // Additional Team Coworkers for realism
    const dev2User = await User.create({
      name: 'Liam Patel (Backend Architect)',
      email: 'liam.patel@staffsync.demo',
      password: demoPassword,
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
    });

    const dev3User = await User.create({
      name: 'Aria Thorne (DevOps Specialist)',
      email: 'aria.thorne@staffsync.demo',
      password: demoPassword,
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      isActive: true,
    });

    const mktManager = await User.create({
      name: 'David Kim (Marketing Director)',
      email: 'david.kim@staffsync.demo',
      password: demoPassword,
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
    });

    console.log('✅ Demo Users created (HR, Manager, Employee, Coworkers).');

    // 2. Create Departments
    const engineeringDept = await Department.create({
      name: 'Engineering & Technology',
      code: 'ENG',
      description: 'Software development, cloud infrastructure, and technical innovation.',
      manager: managerUser._id,
    });

    const hrDept = await Department.create({
      name: 'People Operations & HR',
      code: 'HR',
      description: 'Talent acquisition, employee experience, and organizational development.',
      manager: hrUser._id,
    });

    const marketingDept = await Department.create({
      name: 'Growth & Product Marketing',
      code: 'MKT',
      description: 'Brand strategy, user acquisition, digital campaigns, and community.',
      manager: mktManager._id,
    });

    const financeDept = await Department.create({
      name: 'Finance & Compliance',
      code: 'FIN',
      description: 'Financial planning, accounting, payroll, and corporate compliance.',
      manager: hrUser._id,
    });

    console.log('✅ Departments created.');

    // 3. Create Employee Profiles
    const hrEmployee = await Employee.create({
      user: hrUser._id,
      employeeId: 'EMP-1001',
      designation: 'Head of People Operations',
      department: hrDept._id,
      phone: '+1 (555) 234-5678',
      address: { street: '100 Innovation Way', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
      dateOfJoining: new Date('2022-01-15'),
      gender: 'Female',
      salary: 135000,
      employmentType: 'Full-Time',
      status: 'Active',
      leaveBalances: {
        annual: { total: 20, used: 2 },
        sick: { total: 10, used: 1 },
        casual: { total: 8, used: 0 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      skills: ['Talent Strategy', 'People Analytics', 'HRIS', 'Labor Laws'],
    });

    const managerEmployee = await Employee.create({
      user: managerUser._id,
      employeeId: 'EMP-1002',
      designation: 'Staff Engineering Manager',
      department: engineeringDept._id,
      manager: hrUser._id,
      phone: '+1 (555) 345-6789',
      address: { street: '450 Silicon Blvd', city: 'San Jose', state: 'CA', zipCode: '95113', country: 'USA' },
      dateOfJoining: new Date('2022-03-01'),
      gender: 'Male',
      salary: 155000,
      employmentType: 'Full-Time',
      status: 'Active',
      leaveBalances: {
        annual: { total: 20, used: 4 },
        sick: { total: 10, used: 0 },
        casual: { total: 8, used: 1 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      skills: ['Engineering Leadership', 'Microservices', 'Distributed Systems', 'Agile/Scrum'],
    });

    const demoEmployee = await Employee.create({
      user: employeeUser._id,
      employeeId: 'EMP-1003',
      designation: 'Senior Frontend Engineer',
      department: engineeringDept._id,
      manager: managerUser._id,
      phone: '+1 (555) 456-7890',
      address: { street: '789 Market St, Apt 4B', city: 'San Francisco', state: 'CA', zipCode: '94103', country: 'USA' },
      dateOfJoining: new Date('2023-02-10'),
      gender: 'Female',
      salary: 120000,
      employmentType: 'Full-Time',
      status: 'Active',
      leaveBalances: {
        annual: { total: 18, used: 3 },
        sick: { total: 10, used: 2 },
        casual: { total: 8, used: 1 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux Toolkit', 'UI/UX Design'],
    });

    const dev2Employee = await Employee.create({
      user: dev2User._id,
      employeeId: 'EMP-1004',
      designation: 'Senior Backend Engineer',
      department: engineeringDept._id,
      manager: managerUser._id,
      phone: '+1 (555) 567-8901',
      address: { street: '320 Pine Street', city: 'San Francisco', state: 'CA', zipCode: '94104', country: 'USA' },
      dateOfJoining: new Date('2023-05-15'),
      gender: 'Male',
      salary: 125000,
      employmentType: 'Full-Time',
      status: 'Active',
      leaveBalances: {
        annual: { total: 18, used: 5 },
        sick: { total: 10, used: 0 },
        casual: { total: 8, used: 2 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      skills: ['Node.js', 'MongoDB', 'Docker', 'REST API', 'GraphQL', 'AWS'],
    });

    const dev3Employee = await Employee.create({
      user: dev3User._id,
      employeeId: 'EMP-1005',
      designation: 'Cloud & DevOps Engineer',
      department: engineeringDept._id,
      manager: managerUser._id,
      phone: '+1 (555) 678-9012',
      address: { street: '12 Mission Blvd', city: 'Fremont', state: 'CA', zipCode: '94539', country: 'USA' },
      dateOfJoining: new Date('2023-08-01'),
      gender: 'Female',
      salary: 118000,
      employmentType: 'Full-Time',
      status: 'Active',
      leaveBalances: {
        annual: { total: 18, used: 1 },
        sick: { total: 10, used: 1 },
        casual: { total: 8, used: 0 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      skills: ['Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Linux Administration'],
    });

    const mktEmployee = await Employee.create({
      user: mktManager._id,
      employeeId: 'EMP-1006',
      designation: 'Director of Brand & Growth',
      department: marketingDept._id,
      manager: hrUser._id,
      phone: '+1 (555) 789-0123',
      address: { street: '850 Castro Street', city: 'Mountain View', state: 'CA', zipCode: '94041', country: 'USA' },
      dateOfJoining: new Date('2022-09-01'),
      gender: 'Male',
      salary: 140000,
      employmentType: 'Full-Time',
      status: 'Active',
      leaveBalances: {
        annual: { total: 20, used: 6 },
        sick: { total: 10, used: 0 },
        casual: { total: 8, used: 1 },
        maternityPaternity: { total: 90, used: 0 },
        unpaid: { total: 0, used: 0 },
      },
      skills: ['Performance Marketing', 'SEO', 'Brand Strategy', 'Product Launches'],
    });

    console.log('✅ Employee profiles created.');

    // 4. Seed Attendance History (Past 14 days)
    const employeesList = [
      { emp: hrEmployee, user: hrUser },
      { emp: managerEmployee, user: managerUser },
      { emp: demoEmployee, user: employeeUser },
      { emp: dev2Employee, user: dev2User },
      { emp: dev3Employee, user: dev3User },
      { emp: mktEmployee, user: mktManager },
    ];

    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const dateStr = d.toISOString().split('T')[0];

      for (const item of employeesList) {
        // Today's attendance for demo employee will be left for live interactive demo (unless checked in)
        if (i === 0 && item.emp.employeeId === 'EMP-1003') {
          continue; // Leave unchecked so evaluator can test the "Check In" button live!
        }

        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8 or 9 AM
        const checkInMin = Math.floor(Math.random() * 45);
        const checkIn = new Date(d);
        checkIn.setHours(checkInHour, checkInMin, 0, 0);

        const workHours = i === 0 ? 3.5 : Number((7.8 + Math.random() * 1.5).toFixed(2));
        const checkOut = new Date(checkIn.getTime() + workHours * 3600 * 1000);

        await Attendance.create({
          employee: item.emp._id,
          user: item.user._id,
          date: dateStr,
          checkIn,
          checkOut: i === 0 ? null : checkOut,
          workHours: i === 0 ? 0 : workHours,
          status: 'Present',
          checkInNote: 'On time at primary office workstation.',
          checkOutNote: i === 0 ? '' : 'Completed daily sprints and code reviews.',
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 100 + 10),
        });
      }
    }

    console.log('✅ Attendance records generated.');

    // 5. Seed Leave Requests
    // 1 Pending leave for Demo Employee (so Manager can review it!)
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(nextWeekStart.getDate() + 5);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

    await Leave.create({
      employee: demoEmployee._id,
      user: employeeUser._id,
      leaveType: 'annual',
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      days: 3,
      reason: 'Attending annual React & Web Architecture Conference.',
      status: 'Pending',
    });

    // 1 Approved leave for Dev 2
    const pastLeaveStart = new Date(today);
    pastLeaveStart.setDate(pastLeaveStart.getDate() - 10);
    const pastLeaveEnd = new Date(pastLeaveStart);
    pastLeaveEnd.setDate(pastLeaveEnd.getDate() + 1);

    await Leave.create({
      employee: dev2Employee._id,
      user: dev2User._id,
      leaveType: 'casual',
      startDate: pastLeaveStart,
      endDate: pastLeaveEnd,
      days: 2,
      reason: 'Personal family obligations and medical follow-up.',
      status: 'Approved',
      reviewedBy: managerUser._id,
      reviewDate: new Date(pastLeaveStart.getTime() - 86400000),
    });

    // 1 Pending leave for Dev 3 (DevOps)
    const futureLeaveStart = new Date(today);
    futureLeaveStart.setDate(futureLeaveStart.getDate() + 12);
    const futureLeaveEnd = new Date(futureLeaveStart);
    futureLeaveEnd.setDate(futureLeaveEnd.getDate() + 1);

    await Leave.create({
      employee: dev3Employee._id,
      user: dev3User._id,
      leaveType: 'sick',
      startDate: futureLeaveStart,
      endDate: futureLeaveEnd,
      days: 1,
      reason: 'Scheduled dental procedure recovery.',
      status: 'Pending',
    });

    console.log('✅ Leave requests seeded (Pending and Approved).');

    // 6. Seed Announcements
    await Announcement.create([
      {
        title: 'Quarterly Town Hall & Product Roadmap 2026',
        content: 'Join the executive leadership team this Thursday at 3:00 PM EST for our Q4 Town Hall. We will discuss global performance, our upcoming enterprise HR rollout, and celebrate peer recognition nominees.',
        category: 'Company News',
        priority: 'High',
        isPinned: true,
        author: hrUser._id,
      },
      {
        title: 'Upcoming Public Holiday: Thanksgiving Office Closure',
        content: 'StaffSync offices will be closed on Thursday and Friday for Thanksgiving. Emergency system on-call rotations are confirmed in PagerDuty.',
        category: 'Holiday Notice',
        priority: 'Medium',
        isPinned: true,
        author: hrUser._id,
      },
      {
        title: 'Updated Hybrid Work & Equipment Subsidy Policy',
        content: 'HR has published the revised 2026 Remote Work stipend policy. Full-time team members are eligible for up to $800 annually for ergonomic home workspace upgrades.',
        category: 'Policy Update',
        priority: 'Medium',
        isPinned: false,
        author: hrUser._id,
      },
      {
        title: 'Annual Hackathon "CodeSync 2026" Registrations Open',
        content: 'Team registrations are now officially open for our 48-hour internal hackathon. Awesome prizes, mentorship from senior engineers, and prototype showcase to VCs!',
        category: 'Event',
        priority: 'Low',
        isPinned: false,
        author: managerUser._id,
      },
    ]);

    console.log('✅ Announcements published.');

    // 7. Seed Training Programs
    await Training.create([
      {
        title: 'Modern React 19 & Redux Toolkit Architecture',
        description: 'Comprehensive deep dive into state management, concurrent features, server components, and performance profiling for large-scale enterprise single-page applications.',
        category: 'Technical',
        instructor: 'Dr. Sarah Connor, Principal Architect',
        estimatedHours: 12,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-11-30'),
        resources: [
          { title: 'React Performance Guide', url: 'https://react.dev/learn', type: 'course' },
          { title: 'Redux Toolkit Best Practices', url: 'https://redux-toolkit.js.org', type: 'document' },
        ],
        assignedEmployees: [
          {
            employee: demoEmployee._id,
            user: employeeUser._id,
            status: 'In Progress',
            progressPercentage: 65,
            assignedAt: new Date('2026-09-01'),
          },
          {
            employee: dev2Employee._id,
            user: dev2User._id,
            status: 'Completed',
            progressPercentage: 100,
            completionDate: new Date(),
            feedback: 'Excellent breakdown of state normalization patterns.',
          },
        ],
        createdBy: managerUser._id,
      },
      {
        title: 'SOC2 Security Compliance & Data Privacy 2026',
        description: 'Mandatory annual training covering zero-trust access, customer PII handling, phishing prevention, and incident escalation protocols.',
        category: 'Compliance',
        instructor: 'StaffSync InfoSec Division',
        estimatedHours: 4,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-12-15'),
        resources: [
          { title: 'Information Security Standard Operating Procedures', url: 'https://staffsync.demo/security', type: 'document' },
        ],
        assignedEmployees: [
          {
            employee: demoEmployee._id,
            user: employeeUser._id,
            status: 'Not Started',
            progressPercentage: 0,
            assignedAt: new Date('2026-10-01'),
          },
          {
            employee: dev3Employee._id,
            user: dev3User._id,
            status: 'Completed',
            progressPercentage: 100,
            completionDate: new Date(),
          },
        ],
        createdBy: hrUser._id,
      },
      {
        title: 'Engineering Leadership & High-Performance Teams',
        description: 'Coaching frameworks, 1-on-1 career development, psychological safety, and technical roadmap execution for current and aspiring engineering leads.',
        category: 'Leadership',
        instructor: 'Executive Coaching Partners',
        estimatedHours: 8,
        startDate: new Date('2026-10-10'),
        endDate: new Date('2026-11-20'),
        resources: [
          { title: 'Manager Handbook & Playbook', url: 'https://staffsync.demo/leadership', type: 'document' },
        ],
        assignedEmployees: [
          {
            employee: managerEmployee._id,
            user: managerUser._id,
            status: 'In Progress',
            progressPercentage: 40,
            assignedAt: new Date('2026-10-10'),
          },
        ],
        createdBy: hrUser._id,
      },
    ]);

    console.log('✅ Training programs seeded.');

    // 8. Seed Notifications
    await Notification.create([
      {
        recipient: managerUser._id,
        title: 'Pending Leave Application',
        message: 'Sophia Chen requested 3 days of Annual Leave for conference attendance.',
        type: 'leave',
        link: '/leave-management',
        read: false,
      },
      {
        recipient: employeeUser._id,
        title: 'New Training Assigned',
        message: 'You have been enrolled in "SOC2 Security Compliance & Data Privacy 2026".',
        type: 'training',
        link: '/training-management',
        read: false,
      },
      {
        recipient: employeeUser._id,
        title: 'Company Announcement',
        message: 'Quarterly Town Hall & Product Roadmap 2026 has been published.',
        type: 'announcement',
        link: '/announcements',
        read: true,
      },
      {
        recipient: hrUser._id,
        title: 'System Notice',
        message: 'StaffSync HRMS seeded successfully with production demo environment.',
        type: 'system',
        link: '/',
        read: false,
      },
    ]);

    console.log('✅ Demo notifications created.');
    console.log('🎉 Database seeding complete!');
    console.log('--------------------------------------------------');
    console.log('DEMO ACCOUNTS READY FOR EVALUATION:');
    console.log('1. HR / Admin:  hr@staffsync.demo       / Demo@12345');
    console.log('2. Manager:     manager@staffsync.demo  / Demo@12345');
    console.log('3. Employee:    employee@staffsync.demo / Demo@12345');
    console.log('--------------------------------------------------');

    if (shouldExit) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

// If run directly via command line
if (require.main === module) {
  connectDB().then(() => seedData(true));
}

module.exports = seedData;
