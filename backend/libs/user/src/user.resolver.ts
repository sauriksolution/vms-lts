import { UseGuards, Inject, forwardRef } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { RolesGuard } from "@vms/user/guards/roles.guard";
import { Roles } from "@vms/user/decorators/roles.decorator";

import { AuthService } from "@vms/auth";
import { GqlAuthGuard } from "@vms/auth/guards/GqlAuthGuard.guard";
import { LocalAuthGuard } from "@vms/auth/guards/LocalAuthGuard.guard";
import { CurrentUser } from "@vms/auth/decorators/CurrentUserDecorator.decorator";

import { UserService } from "./user.service";

import { User } from "./models/user.model";
import { SearchUser } from "./models/searchUser.model"; 
import { LoginUser } from "./dto/loginUser.dto";

@Resolver((of) => {return User})
export class UserResolver {
    constructor(
        @Inject(forwardRef(() => {return AuthService}))
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @UseGuards(GqlAuthGuard)
    @Query((returns) => {return String}, { name: "helloUser" })
    async hello(@CurrentUser() user: User) {
        return "👋 from to " + user.email + " " + user.permission;
    }

    @UseGuards(GqlAuthGuard,RolesGuard)
    @Roles("admin")
    @Query((returns) => {return [SearchUser]}, { name: "searchUser"})
    async searchUser(@Args("searchQuery") searchQuery: string) {
        return this.userService.searchUser(searchQuery); 
    }

    @UseGuards(LocalAuthGuard)
    @Mutation((returns) => {return LoginUser}, { name: "login" })
    async login(
        @Args("email") email: string,
        @Args("password") password: string,
    ) {
        return await this.authService.login({
            email: email,
            password: password,
        });
    }

    // Signup new user
    @Mutation((returns) => {return Boolean}, { name: "signup"})
    async signup(
        @Args("email") email: string,
        @Args("password") password: string,
        @Args("confirmationPin") confirmationPin: string,
        @Args("type") type: string,
        @Args("IDDocType") idDocType: string,
        @Args("idNumber") idNumber: string,
        @Args("name") name: string,
        @Args("file") file: string,
    ) {
        return (await this.authService.signup({
            email: email,
            password: password,
            confirmationPin:confirmationPin,
            type: type,
            idNumber: idNumber,
            file: file,
            idDocType: idDocType,
            name: name
        }));
    }

    // Verify user account with email
    @Mutation((returns) => {return Boolean}, { name: "verify"})
    async verify(@Args("verifyID") verifyID: string, @Args("email") email: string) {
        return this.authService.verifyNewAccount(verifyID, email); 
    }

    // Register visitor (requires approval)
    @Mutation((returns) => {return Boolean}, { name: "registerVisitor"})
    async registerVisitor(
        @Args("email") email: string,
        @Args("password") password: string,
        @Args("name") name: string,
        @Args("idNumber") idNumber: string,
        @Args("idDocType") idDocType: string,
        @Args("phoneNumber") phoneNumber: string,
        @Args("purposeOfVisit") purposeOfVisit: string,
        @Args("visitDate") visitDate: string,
        @Args("file") file: string,
    ) {
        return await this.userService.createVisitorRegistration({
            email,
            password,
            name,
            idNumber,
            idDocType,
            phoneNumber,
            purposeOfVisit,
            visitDate,
            file
        });
    }

    // Get all the unauthorized user accounts
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("receptionist", "admin")
    @Query((returns) => { return [User] }, { name: "getUnauthorizedUsers"})
    async getUnauthorizedUsers(@CurrentUser() user: User) {
        return await this.userService.getUnAuthorizedUsers(user.permission);
    }

    // Get all pending visitors for approval
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("receptionist", "admin", "resident")
    @Query((returns) => { return [User] }, { name: "getPendingVisitors"})
    async getPendingVisitors() {
        return await this.userService.getPendingVisitors();
    }

    // Delete User Account
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("admin")
    @Mutation((returns) => { return Boolean }, { name: "deleteUserAccount" })
    async deleteUserAccount(@Args("email") email: string) {
        return await this.userService.deleteUserAccount(email);
    }
    
    // Authorize User Account
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("receptionist", "admin")
    @Mutation((returns) => { return Boolean }, { name: "authorizeUserAccount" })
    async authorizeUserAccount(@Args("email") email: string) {
        return await this.userService.authorizeUserAccount(email);
    }

    // Approve Visitor
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("receptionist", "admin", "resident")
    @Mutation((returns) => { return Boolean }, { name: "approveVisitor" })
    async approveVisitor(@Args("email") email: string) {
        return await this.userService.approveVisitor(email);
    }

    // Deauthorize User Account
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("receptionist", "admin")
    @Mutation((returns) => { return Boolean }, { name: "deauthorizeUserAccount" })
    async deuthorizeUserAccount(@Args("email") email: string) {
        return await this.userService.deauthorizeUserAccount(email); 
    }

    // Add User Directly (without authorization step)
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("admin")
    @Mutation((returns) => { return Boolean }, { name: "addUserDirectly" })
    async addUserDirectly(@Args("email") email: string) {
        return await this.userService.addUserDirectly(email); 
    }

    // Create Receptionist Account (Admin only)
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("admin")
    @Mutation((returns) => { return Boolean }, { name: "createReceptionist" })
    async createReceptionist(
        @Args("email") email: string,
        @Args("password") password: string,
        @Args("name") name: string,
        @Args("idNumber") idNumber: string,
        @Args("idDocType") idDocType: string,
        @Args("confirmationPin") confirmationPin: string,
        @Args("file") file: string,
    ) {
        return await this.userService.createUserByAdmin(
            email,
            password,
            name,
            idNumber,
            idDocType,
            confirmationPin,
            file,
            "receptionist"
        );
    }

    // Create Resident Account (Admin only)
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("admin")
    @Mutation((returns) => { return Boolean }, { name: "createResident" })
    async createResident(
        @Args("email") email: string,
        @Args("password") password: string,
        @Args("name") name: string,
        @Args("idNumber") idNumber: string,
        @Args("idDocType") idDocType: string,
        @Args("confirmationPin") confirmationPin: string,
        @Args("file") file: string,
    ) {
        return await this.userService.createUserByAdmin(
            email,
            password,
            name,
            idNumber,
            idDocType,
            confirmationPin,
            file,
            "resident"
        );
    }

    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles("admin")
    @Query((returns) => { return [SearchUser] }, { name: "getUsersByType"})
    async getUsersByType(@Args("permission") permission: number) {
        return await this.userService.getUsersByType(permission);
    }

    @UseGuards(GqlAuthGuard)
    @Query((returns) => { return Number }, { name: "getNumInvites"})
    async getNumInvites(@Args("email") email: string) {
        return await this.userService.getNumInvites(email);
    }

    @UseGuards(GqlAuthGuard)
    @Query((returns) => { return Number }, { name: "getNumThemes"})
    async getNumThemes(@Args("email") email: string) {
        return await this.userService.getNumThemes(email);
    }

    @UseGuards(GqlAuthGuard)
    @Query((returns) => { return Number }, { name: "getNumSleepovers"})
    async getNumSleepovers(@Args("email") email: string) {
        return await this.userService.getNumSleepovers(email);
    }

    @UseGuards(GqlAuthGuard)
    @Query((returns) => { return Number }, { name: "getCurfewTimeOfResident"})
    async getCurfewTimeOfResident(@Args("email") email: string) {
        return await this.userService.getCurfewTimeOfResident(email);
    }

    @Query((returns) => { return Boolean }, { name: "resendVerify" })
    async resendVerify(@Args("email") email: string) {
        return await this.authService.resendVerifyEmail(email);
    }
}
