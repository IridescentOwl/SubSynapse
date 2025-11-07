"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_service_1 = require("../src/services/auth.service");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start seeding ...');
        yield prisma.user.deleteMany();
        yield prisma.subscriptionGroup.deleteMany();
        yield prisma.groupMembership.deleteMany();
        yield prisma.admin.deleteMany();
        const password = yield auth_service_1.AuthService.hashPassword('password123');
        const apiKey = crypto_1.default.randomBytes(32).toString('hex');
        const hashedApiKey = yield auth_service_1.AuthService.hashPassword(apiKey);
        // Create an admin user
        yield prisma.admin.create({
            data: {
                email: 'admin@thapar.edu',
                password,
                apiKey: hashedApiKey,
            },
        });
        console.log(`Created admin user with email: admin@thapar.edu`);
        console.log(`API Key: ${apiKey}`);
        // Create a user
        const user1 = yield prisma.user.create({
            data: {
                email: 'testuser1@thapar.edu',
                name: 'Test User 1',
                password,
                emailVerified: true,
                creditBalance: 1000,
            },
        });
        console.log(`Created user: ${user1.name} with id: ${user1.id}`);
        // Create another user
        const user2 = yield prisma.user.create({
            data: {
                email: 'testuser2@thapar.edu',
                name: 'Test User 2',
                password,
                emailVerified: true,
                creditBalance: 500,
            },
        });
        console.log(`Created user: ${user2.name} with id: ${user2.id}`);
        // Create a subscription group
        const group1 = yield prisma.subscriptionGroup.create({
            data: {
                ownerId: user1.id,
                name: 'Netflix Premium Family',
                serviceType: 'Streaming',
                totalPrice: 649,
                slotsTotal: 4,
                slotsFilled: 2,
                adminApproved: true,
            },
        });
        console.log(`Created subscription group: ${group1.name} with id: ${group1.id}`);
        // Add the owner as a member
        yield prisma.groupMembership.create({
            data: {
                userId: user1.id,
                groupId: group1.id,
                shareAmount: group1.totalPrice / group1.slotsTotal,
            },
        });
        // Add the second user as a member
        yield prisma.groupMembership.create({
            data: {
                userId: user2.id,
                groupId: group1.id,
                shareAmount: group1.totalPrice / group1.slotsTotal,
            },
        });
        console.log('Seeding finished.');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
