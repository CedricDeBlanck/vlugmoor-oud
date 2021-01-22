"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("../../models/mongoose");
const utilities_1 = require("../../utilities");
class MetaDataController {
    constructor() {
        this.index = async (req, res, next) => {
            try {
                const { limit, skip } = req.query;
                let metaData = null;
                if (limit && skip) {
                    metaData = await mongoose_1.MetaData.paginate({});
                }
                else {
                    metaData = await mongoose_1.MetaData.find()
                        .sort({ created_at: -1 })
                        .exec();
                }
                return res.status(200).json(metaData);
            }
            catch (err) {
                next(err);
            }
        };
        this.show = async (req, res, next) => {
            try {
                const { id } = req.params;
                const metaData = await mongoose_1.MetaData.findById(id).exec();
                return res.status(200).json(metaData);
            }
            catch (err) {
                next(err);
            }
        };
        this.destroy = async (req, res, next) => {
            const { id } = req.params;
            try {
                let metaData = null;
                let { mode } = req.query;
                switch (mode) {
                    case 'delete':
                    default:
                        metaData = await mongoose_1.MetaData.findOneAndRemove({ _id: id });
                        break;
                    case 'softdelete':
                        metaData = await mongoose_1.MetaData.findByIdAndUpdate({ _id: id }, { _deletedAt: Date.now() });
                        break;
                    case 'softundelete':
                        metaData = await mongoose_1.MetaData.findByIdAndUpdate({ _id: id }, { _deletedAt: null });
                        break;
                }
                if (!metaData) {
                    throw new utilities_1.NotFoundError();
                }
                else {
                    return res.status(200).json({
                        message: `Successful ${mode} the MetaData with id: ${id}!`,
                        metaData,
                        mode,
                    });
                }
            }
            catch (err) {
                next(err);
            }
        };
        this.edit = async (req, res, next) => {
            const { id } = req.params;
            try {
                const metaData = await mongoose_1.MetaData.findById(id).exec();
                if (!metaData) {
                    throw new utilities_1.NotFoundError();
                }
                else {
                    const vm = {
                        metaData,
                    };
                    return res.status(200).json(vm);
                }
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            const { id } = req.params;
            try {
                const metaDataUpdate = {
                    email: req.body.email,
                    firstName: req.body.profile.firstName,
                    lastName: req.body.profile.lastName,
                    role: req.body.role,
                    password: req.body.localProvider.password,
                    avatar: req.body.profile.avatar,
                };
                const metaData = await mongoose_1.MetaData.findOneAndUpdate({ _id: id }, metaDataUpdate, {
                    new: true,
                }).exec();
                if (!metaData) {
                    throw new utilities_1.NotFoundError();
                }
                return res.status(200).json(metaData);
            }
            catch (err) {
                next(err);
            }
        };
        this.store = async (req, res, next) => {
            try {
                const metaDataCreate = new mongoose_1.MetaData({
                    email: req.body.email,
                    firstName: req.body.profile.firstName,
                    lastName: req.body.profile.lastName,
                    role: req.body.role,
                    password: req.body.localProvider.password,
                    avatar: req.body.profile.avatar,
                });
                const metaData = await metaDataCreate.save();
                return res.status(201).json(metaData);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const vm = {
                    users: await mongoose_1.User.find(),
                };
                return res.status(200).json(vm);
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.default = MetaDataController;
//# sourceMappingURL=MetaDataController.js.map