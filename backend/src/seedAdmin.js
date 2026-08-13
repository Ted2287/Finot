const User = require('./models/User');

const seedAdminUser = async () => {
  try {
    // Ensure all non-admin usernames are assigned role USER
    await User.updateMany(
      { username: { $ne: 'admin' } },
      { $set: { role: 'USER' } }
    );

    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('Creating default Admin account...');
      admin = new User({
        username: 'admin',
        email: 'admin@finot.org',
        password: 'Admin123!',
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
        isActive: true,
        isDeleted: false
      });
      await admin.save();
      console.log('✅ Default Admin account created successfully! Username: admin | Password: Admin123!');
    } else {
      admin.password = 'Admin123!';
      admin.role = 'ADMIN';
      admin.isActive = true;
      admin.isDeleted = false;
      await admin.save();
      console.log('✅ Default Admin account updated & password reset! Username: admin | Password: Admin123!');
    }
  } catch (err) {
    console.error('Error seeding default Admin user:', err.message);
  }
};

module.exports = seedAdminUser;
