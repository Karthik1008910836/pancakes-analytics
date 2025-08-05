const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function fixPasswords() {
  try {
    console.log('Fixing user passwords...');
    
    // Fix admin password
    const adminUser = await User.findOne({ where: { email: 'admin@99pancakes.com' } });
    if (adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await adminUser.update({ password_hash: hashedPassword });
      console.log('✅ Fixed admin password');
    }
    
    // Fix normal user passwords
    const normalUsers = await User.findAll({ where: { role: 'normal' } });
    for (const user of normalUsers) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await user.update({ password_hash: hashedPassword });
      console.log(`✅ Fixed password for ${user.email}`);
    }
    
    // Test the fix
    const testUser = await User.findOne({ where: { email: 'admin@99pancakes.com' } });
    const isValid = await testUser.validatePassword('admin123');
    console.log(`\n🔑 Admin login test: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\n🎉 All passwords fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    process.exit(1);
  }
}

fixPasswords();