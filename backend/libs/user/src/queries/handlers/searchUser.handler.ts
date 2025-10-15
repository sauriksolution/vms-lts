import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../../schema/user.schema";
import { SearchUserQuery } from "../impl/searchUser.query";

@QueryHandler(SearchUserQuery)
export class SearchUserQueryHandler implements IQueryHandler {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async execute(query: SearchUserQuery) {
        const { searchQuery } = query;
        
        // Validate search query is not empty
        if (!searchQuery || searchQuery.trim() === '') {
            return []; // Return empty array for empty search queries
        }
        
        return await this.userModel.aggregate([ { $search: { index: 'default', text: { query: searchQuery.trim(), path: { 'wildcard': '*' } } } } ]);
    }
}

