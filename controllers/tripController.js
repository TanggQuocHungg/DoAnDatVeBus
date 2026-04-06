let tripModel = require('../schemas/trips')
let routeModel = require('../schemas/routes')
let busModel = require('../schemas/buses')

module.exports = {
    CreateATrip: async function (route, bus, departureTime, arrivalTime, price) {
        try {
            // 1. VALIDATE: Kiểm tra route tồn tại
            let routeData = await routeModel.findOne({ 
                _id: route, 
                isDeleted: false 
            });
            if (!routeData) {
                throw new Error("Tuyến đường không tồn tại");
            }

            // 2. VALIDATE: Kiểm tra bus tồn tại
            let busData = await busModel.findOne({ 
                _id: bus, 
                isDeleted: false 
            });
            if (!busData) {
                throw new Error("Xe không tồn tại");
            }

            // 3. VALIDATE: Kiểm tra departure time < arrival time
            if (new Date(departureTime) >= new Date(arrivalTime)) {
                throw new Error("Thời gian khởi hành phải nhỏ hơn thời gian đến");
            }

            // 4. VALIDATE: Kiểm tra giá > 0
            if (price <= 0) {
                throw new Error("Giá vé phải lớn hơn 0");
            }

            // 5. TẠO TRIP
            let newItem = new tripModel({
                route: route,
                bus: bus,
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                price: price,
                status: "PENDING"
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            throw error;
        }
    },

    GetAllTrips: async function () {
        return await tripModel.find({
            isDeleted: false
        }).populate('route').populate('bus')
    },

    GetATripById: async function (id) {
        let result = await tripModel.findOne({
            isDeleted: false,
            _id: id
        }).populate('route').populate('bus')
        
        if (result) {
            return result;
        }
        return false;
    },

    UpdateATrip: async function (id, updateData) {
        // VALIDATE: Chỉ cho update price và status
        let allowedFields = ['price', 'status'];
        let cleanData = {};
        
        for (let field of allowedFields) {
            if (updateData[field] !== undefined) {
                cleanData[field] = updateData[field];
            }
        }

        // VALIDATE: Nếu update price, kiểm tra > 0
        if (cleanData.price !== undefined && cleanData.price <= 0) {
            throw new Error("Giá vé phải lớn hơn 0");
        }

        let updatedItem = await tripModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, cleanData, { new: true }).populate('route').populate('bus')

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    },

    DeleteATrip: async function (id) {
        let updatedItem = await tripModel.findOneAndUpdate({
            isDeleted: false,
            _id: id
        }, {
            isDeleted: true
        }, { new: true })

        if (updatedItem) {
            return updatedItem;
        }
        return false;
    }
}