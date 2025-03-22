module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
        // Add other product fields as needed
    });

    Product.associate = function(models) {
        Product.hasMany(models.OrderDetail, {
            foreignKey: 'fk_product_id'
        });
    };

    return Product;
};