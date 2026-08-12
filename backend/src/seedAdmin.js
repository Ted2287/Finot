const User = require('./models/User');

const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      console.log('No Admin user found. Creating default Admin account...');
      const admin = new User({
        username: 'admin',
        email: 'admin@finot.org',
        password: 'Admin123!', // Hashed automatically by pre-save hook
        firstName: 'System',
        fatherName: 'Admin',
        grandfatherName: 'Finot',
        phoneNumber: '+251900000000',
        emergencyContactName: 'Support',
        emergencyContactPhone: '+251900000000',
        usesTelegram: 'Yes',
        gender: 'Male',
        maritalStatus: 'Single',
        hasFatherConfessor: 'No',
        role: 'ADMIN',
        isActive: true
      });
      await admin.save();
      console.log('✅ Default Admin account created successfully!');
      console.log('   Username: admin');
      console.log('   Password: Admin123!');
    } else {
      console.log(`Admin account already exists: @${adminExists.username}`);
    }
  } catch (err) {
    console.error('Error seeding default Admin user:', err.message);
  }
};

module.exports = seedAdminUser;
