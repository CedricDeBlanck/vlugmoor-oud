"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
class ApiRouter {
    constructor(config, authService) {
        this.config = config;
        this.authService = authService;
        this.router = express_1.default.Router();
        this.registerControllers();
        this.registerRoutes();
    }
    registerControllers() {
        this.helloController = new controllers_1.HelloController();
        this.userController = new controllers_1.UserController(this.config, this.authService);
        this.metaDataController = new controllers_1.MetaDataController();
    }
    registerRoutes() {
        /*
         * Hello routes
         */
        this.router.get('/hello', this.helloController.index);
        /*
         * Users routes
         */
        this.router.get('/users', this.userController.index);
        this.router.get('/users/:id', this.userController.show);
        this.router.delete('/users/:id', this.userController.destroy);
        /*
         * Metadata routes
         */
        this.router.get('/metadata', this.metaDataController.index);
        this.router.get('/metadata/create', this.metaDataController.create);
        this.router.get('metadata/:id', this.metaDataController.show);
        this.router.post('/metadata', this.metaDataController.store);
        this.router.get('/metadata/:id/edit', this.metaDataController.edit);
        this.router.put('/metadata/:id', this.metaDataController.update);
        this.router.delete('/metadata/:id', this.metaDataController.destroy);
        this.router.post('/auth/signin/', this.userController.signInLocal);
        this.router.post('/auth/signup/', this.userController.signupLocal);
    }
}
exports.default = ApiRouter;
//# sourceMappingURL=ApiRouter.js.map