const bcrypt = require('bcryptjs');
const { User, Outlet, DailySales, MonthlyTarget } = require('./src/models');

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...');

    // Create outlets (only if they don't exist)
    const outletData = [
      {
        name: 'Kompally',
        address: 'Shop No. 15, Main Road, Kompally',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500014',
        phone: '9876543210',
        manager_name: 'Rajesh Kumar'
      },
      {
        name: 'Madhapur',
        address: 'Plot No. 42, HITEC City, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        phone: '9876543211',
        manager_name: 'Priya Sharma'
      },
      {
        name: 'Jubilee Hills',
        address: 'Road No. 36, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        phone: '9876543212',
        manager_name: 'Amit Patel'
      },
      {
        name: 'Banjara Hills',
        address: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        phone: '9876543213',
        manager_name: 'Sneha Reddy'
      }
    ];

    const outlets = [];
    for (const outlet of outletData) {
      const [createdOutlet] = await Outlet.findOrCreate({
        where: { name: outlet.name },
        defaults: outlet
      });
      outlets.push(createdOutlet);
    }

    console.log('✅ Created outlets');

    // Create users (only if they don't exist)
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@99pancakes.com',
        password_hash: 'admin123',
        role: 'admin',
        first_name: 'System',
        last_name: 'Administrator'
      }
    });

    const [kompally_user] = await User.findOrCreate({
      where: { username: 'kompallyuser' },
      defaults: {
        username: 'kompallyuser',
        email: 'kompally@99pancakes.com',
        password_hash: 'password',
        role: 'normal',
        outlet_id: outlets[0].id,
        first_name: 'Ravi',
        last_name: 'Kumar'
      }
    });

    const [madhapur_user] = await User.findOrCreate({
      where: { username: 'madhapuruser' },
      defaults: {
        username: 'madhapuruser',
        email: 'madhapur@99pancakes.com',
        password_hash: 'password',
        role: 'normal',
        outlet_id: outlets[1].id,
        first_name: 'Lakshmi',
        last_name: 'Devi'
      }
    });

    const [jubilee_user] = await User.findOrCreate({
      where: { username: 'jubileeuser' },
      defaults: {
        username: 'jubileeuser',
        email: 'jubilee@99pancakes.com',
        password_hash: 'password',
        role: 'normal',
        outlet_id: outlets[2].id,
        first_name: 'Suresh',
        last_name: 'Babu'
      }
    });

    const [banjara_user] = await User.findOrCreate({
      where: { username: 'banjarauser' },
      defaults: {
        username: 'banjarauser',
        email: 'banjara@99pancakes.com',
        password_hash: 'password',
        role: 'normal',
        outlet_id: outlets[3].id,
        first_name: 'Kavitha',
        last_name: 'Reddy'
      }
    });

    const users = [adminUser, kompally_user, madhapur_user, jubilee_user, banjara_user];

    console.log('✅ Created users');

    // Create monthly targets only for Kompally outlet
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const targets = [];
    const kompallyOutlet = outlets[0]; // Kompally is the first outlet
    
    for (let month = 1; month <= 12; month++) {
      const targetAmount = 400000; // Kompally monthly target
      const daysInMonth = new Date(currentYear, month, 0).getDate();
      const dailyTarget = targetAmount / daysInMonth;
      
      targets.push({
        outlet_id: kompallyOutlet.id,
        year: currentYear,
        month: month,
        target_amount: targetAmount,
        daily_target: Math.round(dailyTarget),
        created_by: users[0].id // Admin user
      });
    }

    await MonthlyTarget.bulkCreate(targets);
    console.log('✅ Created monthly targets');

    // Create sample sales data for the last 10 days
    const salesData = [];
    const today = new Date();
    
    for (let i = 9; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Only create sales data for Kompally outlet (ID = 1)
      const kompallyOutlet = outlets[0]; // Kompally is the first outlet
      const monthlyTarget = targets.find(t => 
        t.outlet_id === kompallyOutlet.id && 
        t.month === date.getMonth() + 1
      );
        
      if (monthlyTarget) {
        // Generate realistic sales data for Kompally
        const baseMultiplier = 1.0; // Kompally base multiplier
        
        const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
        const grossSale = Math.round(monthlyTarget.daily_target * baseMultiplier * randomFactor);
        const netSale = Math.round(grossSale * 0.95); // 5% discount/tax
        const totalTickets = Math.round(40 + Math.random() * 60); // 40-100 tickets
        const offlinePercentage = 0.2 + Math.random() * 0.3; // 20-50% offline
        const offlineNetSale = Math.round(netSale * offlinePercentage);
        const offlineTickets = Math.round(totalTickets * offlinePercentage);
        const cakesSold = Math.round(20 + Math.random() * 40); // 20-60 cakes
        const pastriesSold = Math.round(80 + Math.random() * 80); // 80-160 pastries
        
        // Use the Kompally user for all entries
        const kompallyUser = users.find(u => u.outlet_id === kompallyOutlet.id);
        
        salesData.push({
          date: dateStr,
          outlet_id: kompallyOutlet.id,
          mtd_target: monthlyTarget.target_amount,
          daily_target: monthlyTarget.daily_target,
          gross_sale: grossSale,
          net_sale: netSale,
          total_tickets: totalTickets,
          offline_net_sale: offlineNetSale,
          offline_tickets: offlineTickets,
          cakes_sold: cakesSold,
          pastries_sold: pastriesSold,
          entered_by: kompallyUser ? kompallyUser.id : users[0].id
        });
      }
    }

    await DailySales.bulkCreate(salesData);
    console.log('✅ Created sample sales data');

    console.log('🎉 Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${outlets.length} outlets created`);
    console.log(`- ${users.length} users created`);
    console.log(`- ${targets.length} monthly targets created`);
    console.log(`- ${salesData.length} sales entries created`);
    
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@99pancakes.com / admin123');
    console.log('User: kompally@99pancakes.com / password');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

module.exports = seedDemoData;