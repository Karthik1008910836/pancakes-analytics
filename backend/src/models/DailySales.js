const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailySales = sequelize.define('DailySales', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
    }
  },
  outlet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  mtd_target: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  daily_target: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  gross_sale: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  net_sale: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  offline_net_sale: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  offline_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  apc: {
    type: DataTypes.VIRTUAL,
    get() {
      const totalTickets = this.getDataValue('total_tickets');
      const netSale = this.getDataValue('net_sale');
      return totalTickets > 0 ? (netSale / totalTickets).toFixed(2) : 0;
    }
  },
  cakes_sold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  pastries_sold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  entered_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'daily_sales',
  indexes: [
    {
      unique: true,
      fields: ['date', 'outlet_id']
    },
    {
      fields: ['outlet_id']
    },
    {
      fields: ['date']
    },
    {
      fields: ['entered_by']
    }
  ],
  validate: {
    netSaleLessOrEqualGross() {
      if (this.net_sale > this.gross_sale) {
        throw new Error('Net sale cannot be greater than gross sale');
      }
    },
    offlineTicketsLessOrEqualTotal() {
      if (this.offline_tickets > this.total_tickets) {
        throw new Error('Offline tickets cannot be greater than total tickets');
      }
    },
    offlineSaleLessOrEqualNet() {
      if (this.offline_net_sale > this.net_sale) {
        throw new Error('Offline net sale cannot be greater than total net sale');
      }
    }
  }
});

DailySales.prototype.getTargetAchievement = function() {
  return this.daily_target > 0 ? ((this.net_sale / this.daily_target) * 100).toFixed(2) : 0;
};

DailySales.prototype.getOnlinePercentage = function() {
  const onlineSale = this.net_sale - this.offline_net_sale;
  return this.net_sale > 0 ? ((onlineSale / this.net_sale) * 100).toFixed(2) : 0;
};

module.exports = DailySales;