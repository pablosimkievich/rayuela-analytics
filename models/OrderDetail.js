module.exports = (sequelize, DataTypes) => {
    const OrderDetail = sequelize.define('OrderDetail', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fk_order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fk_product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fk_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'order_detail',  // Specify the exact table name
        timestamps: false  // Set to true if you have created_at and updated_at columns
    });

    OrderDetail.associate = function(models) {
        OrderDetail.belongsTo(models.Product, {
            foreignKey: 'fk_product_id'
        });
        OrderDetail.belongsTo(models.Order, {
            foreignKey: 'fk_order_id'
        });
    };

    return OrderDetail;
};
