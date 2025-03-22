module.exports = (sequelize, dataTypes) => {
    const SecondaryImages = sequelize.define('SecondaryImages', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_product: {
            type: dataTypes.INTEGER
        },
        image_2: {
            type: dataTypes.STRING
        },
        image_3: {
            type: dataTypes.STRING
        },
        image_4: {
            type: dataTypes.STRING
        }      
    },
    {
        tableName: 'secondary_images',
        timestamps: false
    });
    SecondaryImages.associate = (models) => {
        SecondaryImages.belongsTo(models.Product, {
            as: 'products',
            foreignKey: 'id_product'
        });
    }

    return SecondaryImages;
}