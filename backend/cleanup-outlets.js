const { User, Outlet, DailySales, MonthlyTarget, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function cleanupDatabaseForKompallyOnly() {
  try {
    console.log('🧹 Cleaning up database to show only YOUR Kompally outlet...');
    
    // Find Kompally outlet
    const kompallyOutlet = await Outlet.findOne({ where: { name: 'Kompally' } });
    if (!kompallyOutlet) {
      console.error('❌ Kompally outlet not found!');
      return;
    }
    
    console.log('✅ Found YOUR Kompally outlet (ID:', kompallyOutlet.id + ')');
    
    // Delete ALL sales data for other company outlets
    const deletedSales = await DailySales.destroy({
      where: { outlet_id: { [Op.ne]: kompallyOutlet.id } }
    });
    console.log('🗑️ Removed', deletedSales, 'sales entries from company outlets');
    
    // Delete ALL monthly targets for other company outlets
    const deletedTargets = await MonthlyTarget.destroy({
      where: { outlet_id: { [Op.ne]: kompallyOutlet.id } }
    });
    console.log('🗑️ Removed', deletedTargets, 'monthly targets from company outlets');
    
    // Update all normal users to be assigned to YOUR Kompally outlet
    const updatedUsers = await User.update(
      { outlet_id: kompallyOutlet.id },
      { where: { outlet_id: { [Op.ne]: kompallyOutlet.id }, role: 'normal' } }
    );
    console.log('👥 Assigned', updatedUsers[0], 'staff to YOUR Kompally outlet');
    
    // Delete ALL other company outlets - keep only YOUR Kompally
    const deletedOutlets = await Outlet.destroy({
      where: { id: { [Op.ne]: kompallyOutlet.id } }
    });
    console.log('🏪 Removed', deletedOutlets, 'company outlets (keeping only YOUR Kompally)');
    
    // Show final user list for YOUR outlet
    const users = await User.findAll({ 
      attributes: ['username', 'role', 'first_name', 'last_name'],
      order: [['role', 'DESC'], ['first_name', 'ASC']]
    });
    console.log('\n👥 YOUR Kompally outlet staff:');
    users.forEach(user => {
      if (user.role === 'admin') {
        console.log(`- Owner: ${user.username} / admin123`);
      } else {
        console.log(`- Staff: ${user.username} / password`);
      }
    });
    
    // Show final counts for YOUR outlet only
    const finalCounts = {
      outlets: await Outlet.count(),
      users: await User.count(),
      sales: await DailySales.count(),
      targets: await MonthlyTarget.count()
    };
    
    console.log('\n📊 YOUR Kompally Outlet Database:');
    console.log('- Your Outlets:', finalCounts.outlets, '(only Kompally)');
    console.log('- Your Staff:', finalCounts.users);
    console.log('- Your Sales entries:', finalCounts.sales);
    console.log('- Your Monthly targets:', finalCounts.targets);
    
    console.log('\n🎉 Success! Database now shows only YOUR Kompally outlet data.');
    console.log('🏪 No more company outlet data - only your franchise!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
  process.exit(0);
}

cleanupDatabaseForKompallyOnly();