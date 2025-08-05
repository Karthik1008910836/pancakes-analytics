const { sequelize } = require('./src/models');

async function customizeForKompally() {
  try {
    console.log('🏪 Customizing database for Kompally franchise store only...');

    // Remove all outlets except Kompally
    await sequelize.query(`
      DELETE FROM daily_sales WHERE outlet_id != 1;
      DELETE FROM monthly_targets WHERE outlet_id != 1;
      DELETE FROM users WHERE outlet_id != 1 AND role = 'normal';
      DELETE FROM outlets WHERE id != 1;
    `);

    // Update admin user to be Kompally franchise owner
    await sequelize.query(`
      UPDATE users 
      SET 
        first_name = 'Franchise',
        last_name = 'Owner',
        email = 'owner@kompally.99pancakes.com',
        outlet_id = 1
      WHERE role = 'admin';
    `);

    // Update normal user for Kompally
    await sequelize.query(`
      UPDATE users 
      SET 
        first_name = 'Store',
        last_name = 'Manager',
        email = 'manager@kompally.99pancakes.com'
      WHERE outlet_id = 1 AND role = 'normal';
    `);

    // Update Kompally outlet information
    await sequelize.query(`
      UPDATE outlets 
      SET 
        manager_name = 'Store Manager',
        address = 'Your Kompally Store Address',
        city = 'Hyderabad',
        state = 'Telangana'
      WHERE id = 1;
    `);

    console.log('✅ Database customized for Kompally franchise store');
    console.log('\n🔑 Updated login credentials:');
    console.log('👑 Franchise Owner: owner@kompally.99pancakes.com / admin123');
    console.log('👤 Store Manager: manager@kompally.99pancakes.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error customizing database:', error);
    process.exit(1);
  }
}

customizeForKompally();